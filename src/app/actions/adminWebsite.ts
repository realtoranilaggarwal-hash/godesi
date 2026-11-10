"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole, requireStaff } from "@/lib/auth";
import { type ActionState, fieldError } from "@/lib/actions";
import { escapeHtml, sendEmail, shell } from "@/lib/email";
import { siteUrl } from "@/lib/format";
import { isPowerUpKey, POWER_UPS } from "@/lib/websiteBuilder";
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
});

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
    });
    const current = await db.websiteProject.findUnique({
      where: { id: input.id },
      include: { user: { select: { email: true } } },
    });
    if (!current) return { error: "Project not found." };
    const previewToken = current.previewToken ?? randomBytes(18).toString("base64url");
    const sending = input.send === "send";
    const project = await db.websiteProject.update({
      where: { id: input.id },
      data: {
        designUrl: input.designUrl,
        previewToken,
        ...(current.status === "DRAFT" ? { status: "PREVIEW" as const } : {}),
        ...(sending ? { previewSentAt: new Date() } : {}),
      },
    });
    const link = `${siteUrl()}/website/look/${previewToken}`;
    revalidatePath(`/admin/website/${project.id}`);
    if (!sending) return { success: "Saved. The private link is below." };

    const to = project.email ?? current.user?.email;
    if (!to) return { success: "Saved — no email on file, so copy the private link below and send it on WhatsApp." };
    await sendEmail({
      to,
      replyTo: WEBSITE_OFFER.email,
      subject: `Your new website design is ready — ${project.businessName}`,
      html: shell(
        "Your website design is ready",
        `<h2>Your new website is ready to see</h2>
         <p>Hi! We designed a new website for <strong>${escapeHtml(project.businessName)}</strong>.</p>
         <p><a href="${link}" style="display:inline-block;background:#4f46e5;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:bold">See my new website</a></p>
         <p>Love it? Press &ldquo;I love it&rdquo; to launch it. Want something different? Press &ldquo;I want changes&rdquo; and tell us.</p>
         <p>This link is private to you.</p>`,
      ),
    });
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
