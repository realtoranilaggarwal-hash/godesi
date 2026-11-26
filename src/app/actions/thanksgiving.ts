"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { escapeHtml, sendEmail, shell } from "@/lib/email";
import { requestGeo } from "@/lib/geo";
import { THANKSGIVING, thanksgivingLive } from "@/lib/thanksgiving";
import { WEBSITE_OFFER } from "@/lib/websiteOffer";

const schema = z.object({
  offer: z.enum(["marketing", "website"]),
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(7).max(30),
  email: z.string().trim().email().max(120),
  business: z.string().trim().max(120).optional(),
  message: z.string().trim().max(1000).optional(),
});

/** Saves a Thanksgiving package inquiry and emails it to the GoDesi team. */
export async function thanksgivingInquiryAction(formData: FormData) {
  if (!thanksgivingLive()) redirect("/thanksgiving");
  const parsed = schema.safeParse(Object.fromEntries(formData));
  const offer = formData.get("offer") === "website" ? "website" : "marketing";
  if (!parsed.success) redirect(`/thanksgiving?offer=${offer}&error=1#inquire`);
  const data = parsed.data;

  // Same email at most 3 inquiries a day (phones can be shared office lines); repeats are dropped quietly.
  const recent = await db.promoEvent.count({
    where: {
      campaign: THANKSGIVING.campaign,
      kind: "inquiry",
      createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      email: data.email,
    },
  });
  if (recent >= 3) redirect(`/thanksgiving?offer=${data.offer}&sent=1#inquire`);

  await db.promoEvent.create({
    data: {
      campaign: THANKSGIVING.campaign,
      kind: "inquiry",
      target: data.offer,
      city: requestGeo().city,
      name: data.name,
      phone: data.phone,
      email: data.email,
      business: data.business || null,
      message: data.message || null,
    },
  });

  const label =
    data.offer === "marketing"
      ? `$${THANKSGIVING.marketingUsd} annual marketing package`
      : `$${THANKSGIVING.websiteUsd} AI website`;
  const rows = [
    ["Name", data.name],
    ["Phone", data.phone],
    ["Email", data.email],
    ["Business", data.business ?? ""],
    ["Message", data.message ?? ""],
  ]
    .filter(([, value]) => value)
    .map(([key, value]) => `<p><strong>${key}:</strong> ${escapeHtml(value)}</p>`)
    .join("");
  await sendEmail({
    to: WEBSITE_OFFER.email,
    subject: `Thanksgiving inquiry: ${label} — ${data.name}`,
    html: shell(`Thanksgiving inquiry: ${label}`, rows),
    replyTo: data.email,
  });

  redirect(`/thanksgiving?offer=${data.offer}&sent=1#inquire`);
}
