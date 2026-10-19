import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { sendEmail, shell } from "@/lib/email";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

const schema = z.object({
  site: z.string().trim().min(3).max(60),
  intent: z.enum(["buy", "sell"]),
  city: z.string().trim().min(2, "Enter a city or ZIP").max(80),
  name: z.string().trim().min(2, "Enter your name").max(80),
  phone: z.string().trim().min(7, "Enter a valid phone").max(30),
  email: z
    .string()
    .trim()
    .email("Enter a valid email")
    .max(120)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  message: z.string().trim().max(1000).optional(),
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

/** Server-to-server only: network sites send the shared PARTNER_LEAD_KEY. */
export async function POST(request: Request) {
  const key = process.env.PARTNER_LEAD_KEY;
  if (!key || request.headers.get("x-partner-key") !== key) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 },
    );
  }
  const data = parsed.data;
  const lead = await db.partnerLead.create({
    data: {
      site: data.site,
      intent: data.intent,
      city: data.city,
      name: data.name,
      phone: data.phone,
      email: data.email ?? null,
      message: data.message || null,
    },
  });

  const rows = [
    ["Wants to", data.intent === "sell" ? "Sell a home" : "Buy a home"],
    ["City / ZIP", data.city],
    ["Name", data.name],
    ["Phone", data.phone],
    ["Email", data.email ?? "—"],
    ["Note", data.message || "—"],
    ["From", data.site],
  ]
    .map(
      ([label, value]) =>
        `<tr><td style="padding:4px 12px 4px 0;color:#64748b">${label}</td><td style="padding:4px 0"><b>${escapeHtml(value)}</b></td></tr>`,
    )
    .join("");
  await sendEmail({
    to: SITE.supportEmail,
    subject: `New ${data.intent} request from ${data.site} — ${data.city}`,
    html: shell(
      "New agent request",
      `<table>${rows}</table><p><a href="https://godesi.com/admin/partner-leads">Open the network requests desk</a></p>`,
    ),
  });

  return NextResponse.json({ ok: true, id: lead.id });
}
