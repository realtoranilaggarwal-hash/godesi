import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendEmail, shell } from "@/lib/email";
import { siteUrl } from "@/lib/format";
import { WEBSITE_OFFER } from "@/lib/websiteOffer";
import { websitePath } from "@/lib/websiteBuilder";

export const dynamic = "force-dynamic";

const esc = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const thanks = (name: string, back: string) => `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex">
<title>Message sent</title>
<style>body{font-family:system-ui,sans-serif;display:grid;place-items:center;min-height:100vh;margin:0;background:#f8fafc;color:#1f2937}
main{text-align:center;padding:40px;max-width:420px}h1{font-size:28px}a{color:#4f46e5}</style></head>
<body><main><h1>✅ Message sent</h1><p>Thanks — ${esc(name)} will get back to you shortly.</p><p><a href="${esc(back)}">← Back to the website</a></p></main></body></html>`;

/** The contact form on every generated site posts here; the business gets an email. */
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const form = await request.formData().catch(() => null);
  const project = await db.websiteProject.findUnique({ where: { id: params.id } });
  const back = `${siteUrl()}${websitePath(params.id, "/site")}`;
  if (!form || !project) return new NextResponse("Not found", { status: 404 });
  if (String(form.get("company") ?? "")) return NextResponse.redirect(back, 303);

  const name = String(form.get("name") ?? "").trim().slice(0, 120);
  const contact = String(form.get("contact") ?? "").trim().slice(0, 160);
  const message = String(form.get("message") ?? "").trim().slice(0, 2000);
  if (!name || !contact || !message) {
    return new NextResponse("Please fill in your name, contact and message.", { status: 400 });
  }

  const html = shell(
    `New message from your website`,
    `<h2>New message from your website</h2>
     <p><strong>${esc(name)}</strong> · ${esc(contact)}</p>
     <p style="white-space:pre-wrap">${esc(message)}</p>
     <p style="color:#64748b;font-size:12px">Sent from the ${esc(project.businessName)} website built with GoDesi.</p>`,
  );
  const subject = `${project.businessName}: message from ${name}`;
  const to = project.email ?? WEBSITE_OFFER.email;
  await sendEmail({ to, subject, html });
  if (to !== WEBSITE_OFFER.email && project.status !== "LIVE") {
    await sendEmail({ to: WEBSITE_OFFER.email, subject: `[preview] ${subject}`, html });
  }

  return new NextResponse(thanks(project.businessName, back), {
    headers: { "Content-Type": "text/html; charset=utf-8", "X-Robots-Tag": "noindex" },
  });
}
