"use server";

import { z } from "zod";
import { SITE } from "@/lib/site";
import { sendEmail, shell } from "@/lib/email";
import { type ActionState } from "@/lib/actions";
import { REPORT_ISSUE_TYPES } from "@/lib/safety";

const reportSchema = z.object({
  name: z.string().trim().min(2, "Tell us your name"),
  email: z.string().trim().email("Enter an email we can reply to"),
  subject: z.string().trim().min(2, "Which vendor or listing is this about?"),
  issueType: z.enum(REPORT_ISSUE_TYPES),
  description: z
    .string()
    .trim()
    .min(20, "Please describe what happened (20+ characters)"),
  evidenceUrl: z.string().trim().url().optional().or(z.literal("")),
});

const escape = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export async function reportIssueAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = reportSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form" };
  }

  const { name, email, subject, issueType, description, evidenceUrl } = parsed.data;

  const sent = await sendEmail({
    to: SITE.supportEmail,
    subject: `[Report] ${issueType} — ${subject}`,
    html: shell(
      `Issue reported — ${escape(issueType)}`,
      `<p><strong>${escape(name)}</strong> &lt;${escape(email)}&gt;</p>
       <p>About: <strong>${escape(subject)}</strong></p>
       <p style="white-space:pre-wrap">${escape(description)}</p>
       ${evidenceUrl ? `<p>Evidence: <a href="${escape(evidenceUrl)}">${escape(evidenceUrl)}</a></p>` : ""}`,
    ),
  });

  if (!sent) {
    return {
      error:
        "We could not send that right now. Please try again, or email " +
        SITE.supportEmail,
    };
  }

  return {
    success:
      "Thanks — our team has your report and will review it. We may contact you for more detail.",
  };
}
