"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { sendEmail, emailEnabled } from "@/lib/email";
import { SITE } from "@/lib/site";
import { siteUrl } from "@/lib/format";
import { poojaPackageBySlug } from "@/lib/poojaPackages";
import type { ActionState } from "@/lib/actions";

const bookSchema = z.object({
  package: z.string().min(1),
  name: z.string().trim().min(2, "Your name").max(80),
  email: z.string().trim().email("A valid email"),
  phone: z.string().trim().min(7, "Phone or WhatsApp number").max(30),
  sankalp: z.string().trim().max(200).optional(),
  preferredDate: z.string().optional(),
  address: z.string().trim().max(400).optional(),
  notes: z.string().trim().max(1000).optional(),
});

export async function bookPoojaAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = bookSchema.safeParse({
    package: formData.get("package"),
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    sankalp: formData.get("sankalp") || undefined,
    preferredDate: formData.get("preferredDate") || undefined,
    address: formData.get("address") || undefined,
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form and try again" };
  }

  const pkg = poojaPackageBySlug(parsed.data.package);
  if (!pkg) return { error: "Pick a pooja package" };

  const date = parsed.data.preferredDate
    ? new Date(`${parsed.data.preferredDate}T12:00:00`)
    : null;

  await db.poojaBooking.create({
    data: {
      package: pkg.slug,
      priceUsd: pkg.priceUsd,
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      sankalp: parsed.data.sankalp || null,
      preferredDate: date,
      address: parsed.data.address || null,
      notes: parsed.data.notes || null,
    },
  });

  if (emailEnabled()) {
    await sendEmail({
      to: SITE.supportEmail,
      subject: `🙏 Pooja booking: ${pkg.name} — ${parsed.data.name}`,
      html: `<p><b>${pkg.name}</b> ($${pkg.priceUsd})</p>
        <p>${parsed.data.name} · ${parsed.data.email} · ${parsed.data.phone}<br>
        Sankalp/gotra: ${parsed.data.sankalp || "—"}<br>
        Preferred date: ${parsed.data.preferredDate || "flexible"}<br>
        Prasad address: ${parsed.data.address || "—"}<br>
        Notes: ${parsed.data.notes || "—"}</p>
        <p><a href="${siteUrl()}/admin/pooja">Open pooja bookings</a></p>`,
    });
  }

  return {
    success:
      "🙏 Booked! Our pandit team will call or WhatsApp you within a day to fix the muhurat and the video link.",
  };
}
