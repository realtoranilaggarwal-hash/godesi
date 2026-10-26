"use server";

import { timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { ActionState } from "@/lib/actions";
import { INVESTOR_COOKIE, investorCookie } from "@/lib/investor";
import { db } from "@/lib/db";
import { sendEmail, shell } from "@/lib/email";
import { SITE } from "@/lib/site";

export async function unlockInvestorAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const expected = process.env.INVESTOR_PASSWORD;
  const given = String(formData.get("password") ?? "");
  const ok =
    !!expected &&
    given.length === expected.length &&
    timingSafeEqual(Buffer.from(given), Buffer.from(expected));
  if (!ok)
    return { error: "That password is not right — check it and try again." };
  cookies().set(INVESTOR_COOKIE, investorCookie(), {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  redirect("/investors");
}

const leadSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(80),
  email: z.string().trim().email("Enter a valid email").max(120),
  phone: z.string().trim().min(7, "Enter a valid phone").max(30),
  amount: z.string().trim().min(1).max(40),
  message: z.string().trim().max(2000).optional(),
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

/** Someone on the investor kit wants to talk about investing. */
export async function submitInvestorLeadAction(formData: FormData) {
  const parsed = leadSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    amount: formData.get("amount"),
    message: formData.get("message") || undefined,
  });
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0].message };
  }
  const d = parsed.data;
  // One lead per person per day — silently accept repeats so bots get no
  // signal, but don't pile up leads or send another email.
  const recent = await db.partnerLead.count({
    where: {
      site: "godesi.com",
      intent: "invest",
      category: "investor",
      createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      OR: [{ email: d.email }, { phone: d.phone }],
    },
  });
  if (recent > 0) return { ok: true as const };
  await db.partnerLead.create({
    data: {
      site: "godesi.com",
      intent: "invest",
      category: "investor",
      city: "Investor kit",
      name: d.name,
      phone: d.phone,
      email: d.email,
      message: `Considering: ${d.amount}\n\n${d.message ?? ""}`.trim(),
    },
  });
  const rows = [
    ["Name", d.name],
    ["Email", d.email],
    ["Phone", d.phone],
    ["Considering", d.amount],
    ["Note", d.message ?? "—"],
  ]
    .map(
      ([label, value]) =>
        `<tr><td style="padding:4px 12px 4px 0;color:#64748b;vertical-align:top">${label}</td><td style="padding:4px 0"><b>${escapeHtml(value)}</b></td></tr>`,
    )
    .join("");
  await sendEmail({
    to: SITE.supportEmail,
    subject: `Investor interest — ${d.name} (${d.amount})`,
    html: shell(
      "New investor lead",
      `<p>Someone on the investor kit left their details.</p><table>${rows}</table><p><a href="https://godesi.com/admin/partner-leads">Open the requests desk</a></p>`,
    ),
  }).catch(() => null);
  return { ok: true as const };
}
