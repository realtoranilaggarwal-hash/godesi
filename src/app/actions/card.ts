"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { emailEnabled, sendEmail, shell } from "@/lib/email";
import { siteUrl } from "@/lib/format";
import { type ActionState } from "@/lib/actions";

const leadSchema = z
  .object({
    slug: z.string().min(1).max(140),
    name: z.string().trim().min(2, "Tell us your name").max(80),
    phone: z.string().trim().max(30).optional(),
    email: z
      .string()
      .trim()
      .email("Enter a real email or leave it blank")
      .max(120)
      .optional()
      .or(z.literal("")),
    note: z.string().trim().max(500).optional(),
    /** Honeypot — real visitors never fill this in. */
    company: z.string().max(0).optional(),
  })
  .refine((d) => (d.phone ?? "").length > 0 || (d.email ?? "").length > 0, {
    message: "Leave a phone or email so they can reach you",
  });

const escape = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export async function shareCardLeadAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = leadSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form" };
  }

  const { slug, name, phone, email, note, company } = parsed.data;
  // Bots that filled the honeypot get a silent success so they move on.
  if (company) return { success: "Done — they have your details." };

  const business = await db.business.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      status: true,
      owner: { select: { email: true, name: true } },
    },
  });
  if (!business || business.status !== "APPROVED") {
    return { error: "This card is not available right now" };
  }

  await db.cardLead.create({
    data: {
      businessId: business.id,
      name,
      phone: phone || null,
      email: email || null,
      note: note || null,
    },
  });

  const ownerEmail = business.owner?.email;
  if (ownerEmail && emailEnabled()) {
    await sendEmail({
      to: ownerEmail,
      subject: `New lead for ${business.name} on Godesi`,
      html: shell(
        `New lead for ${escape(business.name)}`,
        `<p><strong>${escape(name)}</strong> shared their details from your digital card:</p>
         <p>${phone ? `📞 ${escape(phone)}<br>` : ""}${
           email ? `✉️ ${escape(email)}<br>` : ""
         }${note ? `💬 ${escape(note)}` : ""}</p>
         <p><a href="${siteUrl()}/dashboard/card-leads">See all your card leads →</a></p>`,
      ),
    });
  }

  return { success: `Done — ${business.name} has your details.` };
}
