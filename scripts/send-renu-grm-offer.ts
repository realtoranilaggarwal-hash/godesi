import { writeFileSync } from "node:fs";
import { sendEmail } from "@/lib/email";

/**
 * GRM Advisory package offer + 1st-half invoice to Renu Mistry ($500 total, $250 now).
 * Writes a preview to /tmp/renu-grm-offer.html; pass --send to email it.
 *
 *   npx tsx scripts/send-renu-grm-offer.ts [--send]
 */
const TO = "rmistry@grsadvisory.com";
const REPLY_TO = "godesibiz@gmail.com";
const SITE = "https://godesi.com";
const PAY_NOW = `${SITE}/pay/renu-grm-ee183b7a6e65`;

const item = (title: string, body: string, tag = "Included") =>
  `<tr><td style="padding:12px 0;border-bottom:1px solid #e5e7eb;vertical-align:top">
<p style="margin:0;font-weight:700;font-size:16px;color:#064e3b">${title}</p>
<p style="margin:4px 0 0;color:#374151">${body}</p></td>
<td style="padding:12px 0 12px 12px;border-bottom:1px solid #e5e7eb;vertical-align:top;text-align:right;white-space:nowrap;color:#047857;font-weight:700">${tag}</td></tr>`;

const html = `<div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;color:#1f2937;line-height:1.5">
<div style="background:#064e3b;color:#fff;border-radius:12px 12px 0 0;padding:22px 24px">
<p style="margin:0;font-size:13px;letter-spacing:2px;color:#fcd34d">GODESI.COM · WEBSITE + MARKETING PACKAGE</p>
<h1 style="margin:6px 0 0;font-size:26px">GRM Advisory</h1>
<p style="margin:4px 0 0;color:#d1fae5">Prepared for Renu Mistry · P.O. Box 10055, New Brunswick, NJ 08907</p>
</div>
<div style="border:1px solid #d1d5db;border-top:0;border-radius:0 0 12px 12px;padding:20px 24px">
<p>Dear Renu,</p>
<p>Thank you for sending your website details through our GoDesi website form. We have everything we need, and we will build your <b>GRM Advisory</b> website. Here is everything in your package for your <b>first full year</b>, with the regular GoDesi price of each item:</p>
<table style="width:100%;border-collapse:collapse">
${item("1. Your GRM Advisory website", "A custom website built on your new domain <b>GRMAdvisory.com</b>, with the pages you asked for: Home, About us, Services, Areas we serve and Contact. It will feature financial planning, advanced tax strategies, tax minimisation, and wealth building and preservation. Visitors can call you, WhatsApp you at (347) 238-8467, send an inquiry, ask for a quote or book an appointment.", "$499")}
${item("2. Domain GRMAdvisory.com", "Registered for you for the first year.", "$19")}
${item("3. Website hosting", "Keeps your website online for the first year.", "$100")}
${item("4. Weekly content emails (52 a year)", "Every week you will get an email with a new picture and short post on your topics (tax savings, financial planning, wealth building). Each picture carries a GoDesi QR code that opens your GoDesi page, and your GoDesi page links to your website. <b>Your part:</b> post each picture and text to your social media (WhatsApp, Facebook, Instagram, LinkedIn) as soon as you get it — that is what brings people to you.", "$260 (52 × $5)")}
${item("5. Your website posts, live on GoDesi", "Your 5 latest website posts will show on your GoDesi page through an RSS feed, so your page stays live and interactive and every post links back to your website.", "Free")}
${item("6. Two promotional videos", "Two short videos made for GRM Advisory from your services and message, $50 each.", "$100")}
${item("7. Featured on GoDesi.com for a year", "A featured GRM Advisory classified and listing on GoDesi.com, the Desi community site for events, businesses and deals ($20 a month, or $100 a year).", "$100")}
${item("8. Banners on GoDesi.com for a year", "Your 320×100 GRM Advisory banner in the GoDesi side banner spot ($24 a month, 20% off for a full year), plus your banners in other GoDesi banner spots.", "$230")}
<tr><td style="padding:12px 0 0;font-weight:700;font-size:16px">Regular GoDesi price</td><td style="padding:12px 0 0 12px;text-align:right;font-weight:700;font-size:16px;color:#6b7280;text-decoration:line-through">$1,308</td></tr>
</table>
<div style="background:#fffbeb;border:2px solid #f59e0b;border-radius:12px;padding:16px 18px;margin:18px 0">
<p style="margin:0;font-size:18px"><b>Your price for everything, for the first year: $500</b> <span style="color:#b45309">(you save $808)</span></p>
<p style="margin:6px 0 0;font-size:14px;color:#374151">The domain and hosting are free for the first year, and your website and promotion are discounted.</p>
<p style="margin:10px 0 0">• <b>$250 now</b> to start the work<br>• <b>$250 later</b>, when your website is finished</p>
<p style="margin:14px 0 0"><a href="${PAY_NOW}" style="display:inline-block;background:#047857;color:#fff;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:8px">Pay $250 now →</a></p>
<p style="margin:10px 0 0;font-size:13px;color:#6b7280">Secure card payment by Stripe. You will get a receipt by email.</p>
</div>
<div style="border:1px solid #d1d5db;border-radius:12px;padding:14px 18px;margin:0 0 18px">
<p style="margin:0;font-weight:700;color:#064e3b">After the first year, and optional upgrades</p>
<p style="margin:6px 0 0">From the second year, these are separate and paid by you each year:<br>• <b>Domain:</b> $19 a year<br>• <b>Hosting:</b> $100 a year to keep your website online<br>• <b>Daily content (optional):</b> a new picture and post every day instead of every week, <b>$500 a year</b></p>
</div>
<p>As soon as your first payment comes in, we will start on your website. If you would like to change anything, just reply to this email or call/WhatsApp Anil at (732) 983-7958.</p>
<p>Thank you,<br><b>Anil Aggarwal</b><br>GoDesi.com</p>
</div></div>`;

async function main() {
  writeFileSync("/tmp/renu-grm-offer.html", html);
  if (!process.argv.includes("--send")) return console.log("Preview: /tmp/renu-grm-offer.html");
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) {
    console.error("RESEND_API_KEY and EMAIL_FROM must be set to send");
    process.exit(1);
  }
  const ok = await sendEmail({
    to: TO,
    replyTo: REPLY_TO,
    subject: "GRM Advisory: your website + marketing package — $500 ($250 to start)",
    html,
  });
  if (!ok) {
    console.error("Send failed");
    process.exit(1);
  }
  console.log(`Sent to ${TO}`);
}

main();
