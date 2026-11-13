"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { randomBytes } from "node:crypto";
import { hashPassword, requireRole, requireUser } from "@/lib/auth";
import { normalizeWhatsApp } from "@/lib/format";
import { pingIndexNowInBackground } from "@/lib/indexNow";
import { type ActionState, fieldError } from "@/lib/actions";
import { weddingVendorJoined } from "@/lib/weddingLaunch";
import { escapeHtml, sendEmail, shell } from "@/lib/email";
import { siteUrl } from "@/lib/format";
import { canonicalEmail } from "@/lib/signupGuard";
import { ensureUsername } from "@/lib/profiles";
import { invalidateDirectory } from "@/lib/cache";

const claimSchema = z.object({
  businessId: z.string().min(1),
  message: z
    .string()
    .trim()
    .min(20, "Tell us how you are connected to this business (at least 20 characters)")
    .max(1000),
  phone: z.string().trim().optional(),
});

/** A user asks to take over a seeded listing; an admin decides. */
export async function claimBusinessAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    const parsed = claimSchema.safeParse({
      businessId: formData.get("businessId"),
      message: formData.get("message"),
      phone: formData.get("phone"),
    });
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    const business = await db.business.findUnique({
      where: { id: parsed.data.businessId },
      select: { id: true, slug: true, ownerId: true },
    });
    if (!business) return { error: "That listing no longer exists." };
    if (business.ownerId) return { error: "This listing has already been claimed." };

    const owned = await db.business.findUnique({ where: { ownerId: user.id } });
    if (owned) {
      return {
        error: "You already have a business on Godesi — one listing per account.",
      };
    }

    await db.businessClaim.upsert({
      where: { businessId_userId: { businessId: business.id, userId: user.id } },
      create: {
        businessId: business.id,
        userId: user.id,
        message: parsed.data.message,
        phone: parsed.data.phone ? normalizeWhatsApp(parsed.data.phone) : null,
      },
      update: { message: parsed.data.message, status: "PENDING" },
    });

    revalidatePath(`/business/${business.slug}`);
    return { success: "Claim submitted — we'll review it and email you." };
  } catch (error) {
    return fieldError(error);
  }
}

/** Approving a claim hands the listing (and its future edits) to the claimant. */
export async function reviewClaimAction(formData: FormData) {
  await requireRole("ADMIN");
  const id = String(formData.get("id") ?? "");
  const approve = formData.get("decision") === "approve";

  const claim = await db.businessClaim.findUnique({
    where: { id },
    include: { business: { select: { id: true, slug: true, ownerId: true } } },
  });
  if (!claim) return;

  let handedOver = false;
  if (!approve) {
    await db.businessClaim.update({ where: { id }, data: { status: "REJECTED" } });
  } else if (claim.business.ownerId) {
    // Someone else got there first; nothing to hand over.
    await db.businessClaim.update({ where: { id }, data: { status: "REJECTED" } });
  } else {
    await db.$transaction([
      db.business.update({
        where: { id: claim.businessId },
        data: { ownerId: claim.userId, status: "APPROVED" },
      }),
      db.businessClaim.update({ where: { id }, data: { status: "APPROVED" } }),
      // Any competing claim on the same listing is closed out.
      db.businessClaim.updateMany({
        where: { businessId: claim.businessId, id: { not: id }, status: "PENDING" },
        data: { status: "REJECTED" },
      }),
    ]);
    handedOver = true;
    await weddingVendorJoined(claim.userId);
  }

  revalidatePath("/admin");
  revalidatePath(`/business/${claim.business.slug}`);
  if (handedOver) pingIndexNowInBackground(`/business/${claim.business.slug}`);
}

const assignSchema = z.object({
  businessId: z.string().min(1),
  email: z.string().trim().toLowerCase().email("Enter the owner's email"),
  name: z.string().trim().max(120).optional(),
  phone: z.string().trim().max(40).optional(),
});

/**
 * Staff hand an unclaimed listing to an owner who can't claim it themselves.
 * Creates the owner's account when they have none and emails them a link to
 * set their own password.
 */
export async function adminAssignOwnerAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireRole("ADMIN");
    const parsed = assignSchema.safeParse({
      businessId: formData.get("businessId"),
      email: formData.get("email"),
      name: formData.get("name") || undefined,
      phone: formData.get("phone") || undefined,
    });
    if (!parsed.success) return { error: parsed.error.issues[0].message };
    const { businessId, email, phone } = parsed.data;

    const business = await db.business.findUnique({
      where: { id: businessId },
      select: { id: true, slug: true, name: true, ownerId: true },
    });
    if (!business) return { error: "That listing no longer exists." };
    if (business.ownerId) return { error: "This listing already has an owner." };

    let owner = await db.user.findFirst({
      where: { OR: [{ email }, { emailCanonical: canonicalEmail(email) }] },
      select: { id: true, email: true, name: true, bannedAt: true },
    });
    const isNew = !owner;
    if (owner?.bannedAt) return { error: "That member is suspended." };
    if (owner) {
      const owned = await db.business.findUnique({
        where: { ownerId: owner.id },
        select: { name: true },
      });
      if (owned) {
        return {
          error: `${owner.email} already owns "${owned.name}" — one listing per account.`,
        };
      }
    } else {
      const name = parsed.data.name || business.name;
      owner = await db.user.create({
        data: {
          name: name.length >= 2 ? name : business.name,
          email,
          emailCanonical: canonicalEmail(email),
          role: "BUSINESS",
          // Unusable until the owner sets their own password from the email.
          passwordHash: await hashPassword(randomBytes(32).toString("hex")),
          offerPhone: phone ? normalizeWhatsApp(phone) : null,
        },
        select: { id: true, email: true, name: true, bannedAt: true },
      });
      await ensureUsername(owner.id);
    }

    await db.$transaction([
      db.business.update({
        where: { id: business.id },
        data: { ownerId: owner.id, status: "APPROVED" },
      }),
      db.businessClaim.updateMany({
        where: { businessId: business.id, status: "PENDING" },
        data: { status: "REJECTED" },
      }),
    ]);
    await weddingVendorJoined(owner.id);

    const cardUrl = `${siteUrl()}/business/${business.slug}`;
    const next = isNew
      ? `${siteUrl()}/forgot-password?email=${encodeURIComponent(owner.email)}`
      : `${siteUrl()}/login?next=${encodeURIComponent("/dashboard")}`;
    const sent = await sendEmail({
      to: owner.email,
      subject: `Your ${business.name} listing on GoDesi is ready`,
      html: shell(
        "Your GoDesi listing is ready",
        `<p>Hi ${escapeHtml(owner.name)},</p>
        <p>We've set up <a href="${cardUrl}">${escapeHtml(business.name)}</a> on GoDesi and put it in your account, so you can update your photos, hours, phone and offers any time.</p>
        <p><a href="${next}" style="display:inline-block;background:#e11d48;color:#fff;padding:10px 18px;border-radius:999px;text-decoration:none;font-weight:700">${isNew ? "Set your password" : "Log in to your listing"}</a></p>
        ${isNew ? `<p style="font-size:13px;color:#64748b">On that page, ask for a code with this email address (${escapeHtml(owner.email)}), then choose your password.</p>` : ""}`,
      ),
    });

    invalidateDirectory();
    revalidatePath("/admin");
    revalidatePath(`/admin/business/${business.slug}`);
    revalidatePath(`/business/${business.slug}`);
    pingIndexNowInBackground(`/business/${business.slug}`);
    return {
      success: `${business.name} now belongs to ${owner.email}${isNew ? " (new account created)" : ""}. ${sent ? "We emailed them a link to get in." : isNew
            ? "Email is off, so let them know: they sign in with \"Forgot password\" using that email."
            : "Email is off, so let them know it's now in their account."}`,
    };
  } catch (error) {
    return fieldError(error);
  }
}
