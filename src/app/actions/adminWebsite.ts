"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole, requireStaff } from "@/lib/auth";
import { type ActionState, fieldError } from "@/lib/actions";
import { escapeHtml, sendEmail, shell } from "@/lib/email";
import { siteUrl } from "@/lib/format";
import { isPowerUpKey, POWER_UPS, WEBSITE_CATEGORIES } from "@/lib/websiteBuilder";
import { normalizeCouponCode } from "@/lib/coupons";
import { PARTNER_PACKAGE, PARTNER_PACKAGE_KEY } from "@/lib/partnerPackage";
import { WEBSITE_OFFER } from "@/lib/websiteOffer";

const statusSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["DRAFT", "PREVIEW", "APPROVED", "PAID", "LIVE", "CANCELLED"]),
  liveUrl: z.string().trim().url().optional().or(z.literal("")),
  staffNotes: z.string().trim().max(2000).optional(),
});

/** Staff move a project along (usually PAID → LIVE with the address) and keep notes. */
export async function updateWebsiteProjectAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireStaff();
    const input = statusSchema.parse({
      id: formData.get("id"),
      status: formData.get("status"),
      liveUrl: formData.get("liveUrl") ?? "",
      staffNotes: formData.get("staffNotes") ?? "",
    });
    await db.websiteProject.update({
      where: { id: input.id },
      data: {
        status: input.status,
        liveUrl: input.liveUrl || null,
        staffNotes: input.staffNotes || null,
      },
    });
    revalidatePath("/admin/website");
    return { success: "Saved" };
  } catch (error) {
    return fieldError(error);
  }
}

/** Admins set a Power-Up's monthly price or switch it off; blank = back to default. */
export async function savePowerUpPricesAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireRole("ADMIN");
    const rows: { key: string; monthlyUsd: number; active: boolean }[] = [];
    for (const powerUp of POWER_UPS) {
      const key = powerUp.key;
      if (!isPowerUpKey(key)) continue;
      const raw = String(formData.get(`price-${key}`) ?? "").trim();
      const active = formData.get(`active-${key}`) === "on";
      const price = raw === "" ? powerUp.monthlyUsd : Number(raw);
      if (!Number.isInteger(price) || price < 0 || price > 999) {
        return { error: `${powerUp.label}: whole dollars between 0 and 999.` };
      }
      rows.push({ key, monthlyUsd: price, active });
    }
    await db.$transaction(
      rows.map(({ key, monthlyUsd, active }) =>
        db.websitePowerUp.upsert({
          where: { key },
          create: { key, monthlyUsd, active },
          update: { monthlyUsd, active },
        }),
      ),
    );
    revalidatePath("/admin/website");
    return { success: "Prices saved" };
  } catch (error) {
    return fieldError(error);
  }
}

const designSchema = z.object({
  id: z.string().min(1),
  designUrl: z.string().trim().url("Paste the full design link, starting with https://"),
  send: z.enum(["save", "send"]),
  code: z.string().trim().max(40).optional(),
});

/** The private preview address, with a discount code already filled in when given. */
function lookLink(token: string, code?: string | null) {
  const normalized = code ? normalizeCouponCode(code) : "";
  return `${siteUrl()}/website/look/${token}${normalized ? `?code=${encodeURIComponent(normalized)}` : ""}`;
}

/** Returns an error message unless the code is an active Website discount code. */
async function websiteCodeProblem(code: string) {
  if (!code) return null;
  const coupon = await db.coupon.findUnique({ where: { code } });
  if (coupon?.active && coupon.scope === "WEBSITE") return null;
  return `${code} isn't an active Website discount code. Make it at /admin/coupons first, or leave it blank.`;
}

/** Staff notes with the shared code recorded on the first line (the admin page reads it back). */
function notesWithCode(notes: string | null, code: string) {
  const rest = (notes ?? "").replace(/^Shared with code \S+\n?/, "");
  if (!code) return rest || null;
  return rest ? `Shared with code ${code}\n${rest}` : `Shared with code ${code}`;
}

async function emailPreview(to: string, businessName: string, link: string, included = false) {
  await sendEmail({
    to,
    replyTo: WEBSITE_OFFER.email,
    subject: `Your new website design is ready — ${businessName}`,
    html: shell(
      "Your website design is ready",
      `<h2>Your new website is ready to see</h2>
       <p>Hi! We designed a new website for <strong>${escapeHtml(businessName)}</strong>.</p>
       <p><a href="${link}" style="display:inline-block;background:#4f46e5;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:bold">See my new website</a></p>
       <p>${included ? `It&rsquo;s included in your GoDesi Partner Package, so there&rsquo;s nothing more to pay today. Hosting is included for the first year, then $${PARTNER_PACKAGE.hostingAfterYearUsd}/month.` : "Under the design you can see the price, the extras you can add and use your discount code."} Love it? Press &ldquo;I love it&rdquo; to launch it. Want something different? Press &ldquo;I want changes&rdquo; and tell us.</p>
       <p>This link is private to you.</p>`,
    ),
  });
}

/**
 * Staff paste the link to the design they made. "Send" emails the owner a
 * private GoDesi link; the design address itself is never put in the email.
 */
export async function saveDesignLinkAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireStaff();
    const input = designSchema.parse({
      id: formData.get("id"),
      designUrl: formData.get("designUrl"),
      send: formData.get("send") === "send" ? "send" : "save",
      code: formData.get("code") ?? undefined,
    });
    const current = await db.websiteProject.findUnique({
      where: { id: input.id },
      include: { user: { select: { email: true } } },
    });
    if (!current) return { error: "Project not found." };
    const code = input.code ? normalizeCouponCode(input.code) : "";
    const codeProblem = await websiteCodeProblem(code);
    if (codeProblem) return { error: codeProblem };
    const previewToken = current.previewToken ?? randomBytes(18).toString("base64url");
    const sending = input.send === "send";
    const project = await db.websiteProject.update({
      where: { id: input.id },
      data: {
        designUrl: input.designUrl,
        previewToken,
        staffNotes: notesWithCode(current.staffNotes, code),
        ...(current.status === "DRAFT" ? { status: "PREVIEW" as const } : {}),
        ...(sending ? { previewSentAt: new Date() } : {}),
      },
    });
    const link = lookLink(previewToken, code);
    revalidatePath(`/admin/website/${project.id}`);
    if (!sending) return { success: "Saved. The private link is below." };

    const to = project.email ?? current.user?.email;
    if (!to) return { success: "Saved — no email on file, so copy the private link below and send it on WhatsApp." };
    await emailPreview(to, project.businessName, link, Boolean(project.includedIn));
    return { success: `Preview sent to ${to}.` };
  } catch (error) {
    return fieldError(error);
  }
}

/** Staff tick off a change the owner asked for on their live site. */
export async function markChangeDoneAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireStaff();
    const id = z.string().min(1).parse(formData.get("id"));
    const request = await db.websiteChangeRequest.update({
      where: { id },
      data: { doneAt: new Date() },
    });
    revalidatePath(`/admin/website/${request.projectId}`);
    return { success: "Marked done" };
  } catch (error) {
    return fieldError(error);
  }
}

const clientPreviewSchema = z.object({
  businessName: z.string().trim().min(2, "Business name?").max(120),
  category: z.enum(WEBSITE_CATEGORIES, { message: "Pick a category" }),
  city: z.string().trim().max(120).optional(),
  email: z.string().trim().email("That email doesn't look right").optional().or(z.literal("")),
  whatsapp: z.string().trim().max(40).optional(),
  oldWebsite: z.string().trim().url("Old website: paste the full link, starting with https://").optional().or(z.literal("")),
  designUrl: z.string().trim().url("Paste the full design link, starting with https://"),
  code: z.string().trim().max(40).optional(),
  send: z.boolean(),
  partnerPackage: z.boolean(),
});

/**
 * Staff send a design to a client who hasn't ordered online: makes a custom
 * project already in PREVIEW, with its private link (and code) ready to share.
 */
export async function createClientPreviewAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  let id: string;
  let note = "";
  try {
    await requireStaff();
    const text = (key: string) => String(formData.get(key) ?? "");
    const input = clientPreviewSchema.parse({
      businessName: text("businessName"),
      category: text("category"),
      city: text("city"),
      email: text("email"),
      whatsapp: text("whatsapp"),
      oldWebsite: text("oldWebsite"),
      designUrl: text("designUrl"),
      code: text("code"),
      send: formData.get("send") === "send",
      partnerPackage: formData.get("partnerPackage") === "on",
    });
    const previewToken = randomBytes(18).toString("base64url");
    const code = input.code ? normalizeCouponCode(input.code) : "";
    const codeProblem = await websiteCodeProblem(code);
    if (codeProblem) return { error: codeProblem };
    const sending = input.send && Boolean(input.email);
    const project = await db.websiteProject.create({
      data: {
        tier: "CUSTOM",
        status: "PREVIEW",
        businessName: input.businessName,
        category: input.category,
        city: input.city ?? "",
        email: input.email || null,
        whatsapp: input.whatsapp || null,
        sources: input.oldWebsite ? { website: input.oldWebsite } : {},
        designUrl: input.designUrl,
        previewToken,
        previewSentAt: sending ? new Date() : null,
        staffNotes: notesWithCode(null, code),
        includedIn: input.partnerPackage ? PARTNER_PACKAGE_KEY : null,
      },
    });
    if (sending && input.email) {
      await emailPreview(input.email, project.businessName, lookLink(previewToken, code), input.partnerPackage);
      note = "&sent=1";
    }
    id = project.id;
  } catch (error) {
    return fieldError(error);
  }
  revalidatePath("/admin/website");
  redirect(`/admin/website/${id}?new=1${note}`);
}
