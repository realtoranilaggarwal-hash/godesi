"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { sendEmail, shell } from "@/lib/email";
import { SITE } from "@/lib/site";

const schema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(80),
  email: z.string().trim().email("Enter a valid email").max(120),
  phone: z.string().trim().min(7, "Enter a valid phone").max(30),
  courseTitle: z.string().trim().min(4, "Give your course a name").max(140),
  outline: z.string().trim().min(20, "Tell us what it teaches").max(2000),
});

function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ] ?? char,
  );
}

/** A member wants to sell their own course on GoDesi at the 90/10 split. */
export async function submitCourseSellerAction(formData: FormData) {
  const parsed = schema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    courseTitle: formData.get("courseTitle"),
    outline: formData.get("outline"),
  });
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0].message };
  }
  const d = parsed.data;
  // One application per person per day — silently accept repeats so bots get
  // no signal, but don't pile up leads or send another email.
  const recent = await db.partnerLead.count({
    where: {
      site: "godesi.com",
      intent: "sell",
      category: "course",
      createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      OR: [{ email: d.email }, { phone: d.phone }],
    },
  });
  if (recent > 0) return { ok: true as const };
  await db.partnerLead.create({
    data: {
      site: "godesi.com",
      intent: "sell",
      category: "course",
      city: "Online course",
      name: d.name,
      phone: d.phone,
      email: d.email,
      message: `Course: ${d.courseTitle}\n\n${d.outline}`,
    },
  });
  const rows = [
    ["Course", d.courseTitle],
    ["Name", d.name],
    ["Email", d.email],
    ["Phone", d.phone],
    ["Outline", d.outline],
  ]
    .map(
      ([label, value]) =>
        `<tr><td style="padding:4px 12px 4px 0;color:#64748b;vertical-align:top">${label}</td><td style="padding:4px 0"><b>${escapeHtml(value)}</b></td></tr>`,
    )
    .join("");
  await sendEmail({
    to: SITE.supportEmail,
    subject: `Course seller application — ${d.courseTitle}`,
    html: shell(
      "New course seller",
      `<p>Someone wants to sell their course on GoDesi (90/10 split).</p><table>${rows}</table><p><a href="https://godesi.com/admin/partner-leads">Open the requests desk</a></p>`,
    ),
  }).catch(() => null);
  return { ok: true as const };
}
