"use server";

import { z } from "zod";
import { sendEmail, shell } from "@/lib/email";
import { type ActionState, fieldError } from "@/lib/actions";
import {
  WEBSITE_OFFER,
  WEBSITE_OFFER_PAGE_PROMPTS,
} from "@/lib/websiteOffer";

const requestSchema = z.object({
  businessName: z.string().trim().min(2, "Tell us your business name"),
  contactName: z.string().trim().min(2, "Tell us your name"),
  email: z.string().trim().email("Enter an email we can reply to"),
  phone: z.string().trim().min(6, "Add a phone number we can reach you on").max(30),
  whatsapp: z.string().trim().max(30).optional(),
  city: z.string().trim().min(2, "Which city are you in?"),
  googleProfileUrl: z
    .string()
    .trim()
    .url("Enter the full Google Business Profile link, or leave it blank")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  existingUrl: z
    .string()
    .trim()
    .max(200)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  notes: z.string().trim().max(2000).optional(),
});

const escape = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const row = (label: string, value?: string) =>
  value ? `<p style="margin:0 0 6px"><strong>${label}:</strong> ${escape(value)}</p>` : "";

/**
 * A $99 website enquiry. Everything the build needs is collected up front and
 * emailed to the Godesi desk, so nobody has to chase the owner for basics.
 */
export async function requestWebsiteAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const parsed = requestSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Please check the form" };
    }
    const data = parsed.data;

    const pages = WEBSITE_OFFER_PAGE_PROMPTS.map((prompt) => {
      const value = String(formData.get(prompt.name) ?? "").trim();
      return value
        ? `<p style="margin:0 0 6px"><strong>${escape(prompt.label)}:</strong><br />${escape(
            value,
          ).replace(/\n/g, "<br />")}</p>`
        : "";
    }).join("");

    const sent = await sendEmail({
      to: WEBSITE_OFFER.email,
      subject: `$${WEBSITE_OFFER.priceUsd} website request — ${data.businessName}`,
      html: shell(
        `Website request — ${escape(data.businessName)}`,
        `${row("Contact", data.contactName)}
         ${row("Email", data.email)}
         ${row("Phone", data.phone)}
         ${row("WhatsApp", data.whatsapp)}
         ${row("City", data.city)}
         ${row("Google Business Profile", data.googleProfileUrl)}
         ${row("Existing site / socials", data.existingUrl)}
         <hr style="border:0;border-top:1px solid #e2e8f0;margin:14px 0" />
         ${pages || "<p style='margin:0 0 6px'>No page details supplied.</p>"}
         ${
           data.notes
             ? `<hr style="border:0;border-top:1px solid #e2e8f0;margin:14px 0" /><p style="white-space:pre-wrap;margin:0">${escape(
                 data.notes,
               )}</p>`
             : ""
         }`,
      ),
    });

    if (!sent) {
      return {
        error: `We could not send that right now — please email ${WEBSITE_OFFER.email} directly.`,
      };
    }

    return {
      success:
        "Thanks! Your website brief is with our team — we reply within one business day to confirm and take payment.",
    };
  } catch (error) {
    return fieldError(error);
  }
}
