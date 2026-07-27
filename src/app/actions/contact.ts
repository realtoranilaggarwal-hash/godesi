"use server";

import { z } from "zod";
import { SITE } from "@/lib/site";
import { sendEmail, shell } from "@/lib/email";
import { type ActionState, fieldError } from "@/lib/actions";
import { CONTACT_TOPICS, SALES_TOPICS } from "@/lib/contact";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Tell us your name"),
  email: z.string().trim().email("Enter an email we can reply to"),
  phone: z.string().trim().max(30).optional(),
  topic: z.enum(CONTACT_TOPICS),
  message: z
    .string()
    .trim()
    .min(20, "Please describe your query (20+ characters)"),
});

const escape = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export async function sendContactMessageAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = contactSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Please check the form",
    };
  }

  const { name, email, phone, topic, message } = parsed.data;
  const to = SALES_TOPICS.includes(topic) ? SITE.salesEmail : SITE.supportEmail;

  try {
    const sent = await sendEmail({
      to,
      subject: `[${topic}] message from ${name}`,
      html: shell(
        `New enquiry — ${escape(topic)}`,
        `<p><strong>${escape(name)}</strong> &lt;${escape(email)}&gt;${
          phone ? ` · ${escape(phone)}` : ""
        }</p>
         <p style="white-space:pre-wrap">${escape(message)}</p>`,
      ),
    });

    if (!sent) {
      return {
        error: "We could not send that right now. Please try again shortly.",
      };
    }

    return {
      success:
        "Thanks — your message is with our team. We reply within one business day.",
    };
  } catch (error) {
    return fieldError(error);
  }
}
