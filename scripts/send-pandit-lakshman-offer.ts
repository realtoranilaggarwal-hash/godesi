import { writeFileSync } from "node:fs";
import { sendEmail } from "@/lib/email";

/**
 * Payment reminder for Pandit Lakshman Ji with two choices: the $500
 * Premium + website package (offered Nov 26, 2026 only) or $200 Premium.
 * Writes a preview to /tmp/pandit-lakshman-offer.html; pass --send to email it.
 *
 *   npx tsx scripts/send-pandit-lakshman-offer.ts [--send]
 */
const TO = "astrologerlakshman9@gmail.com";
const SITE = "https://godesi.com";
const PAGE = `${SITE}/business/master-lakshman-ji-astrologer-psychic-healer-jersey-city`;
const PAY_PACKAGE = `${SITE}/pay/pandit-lakshman-cea49a8a968b`;
const PAY_PREMIUM = `${SITE}/pay/master-lakshman-0b09bc7020fc`;

const button = (href: string, label: string, color = "#ea580c") =>
  `<a href="${href}" style="display:inline-block;background:${color};color:#fff;text-decoration:none;font-weight:700;padding:12px 20px;border-radius:8px">${label}</a>`;

const html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#1f2937;line-height:1.5">
<p>Namaste Pandit Lakshman Ji,</p>
<p>Your GoDesi page now shows your new name, <b>Pandit Lakshman Ji</b>, your visiting card, your palm photo and your hours, <b>9 AM to 8 PM</b>: <a href="${PAGE}">see your page</a>.</p>
<p>This is a reminder that your payment is still pending. Please choose one of these two options:</p>
<div style="border:2px solid #ea580c;border-radius:12px;padding:14px 18px;margin:14px 0">
<p style="margin:0;font-size:18px"><b>Option 1: Premium + new website: $500 total</b> <span style="color:#be123c;font-weight:700">(today only)</span></p>
<p style="margin:8px 0">We redesign your website <a href="https://astrolakshmanji.com/">astrolakshmanji.com</a> so every page works: a page for each service, your Google reviews, call and WhatsApp buttons on every page, and a booking form, all set up so Google can find you. We normally charge <b>$999</b> for a website, and our holiday price is <b>$499</b> until December 31.</p>
<p style="margin:8px 0">Because you are bringing your business to GoDesi, and we want to promote you through our New Year's Eve party, Anil is offering a package deal: <b>the website, your one-year Premium package and the NYE party promotion, all for $500</b>. This price is <b>only open today, November 26</b>.</p>
<p style="margin:8px 0 0">${button(PAY_PACKAGE, "Pay $500: Premium + website")}</p>
</div>
<div style="border:1px solid #d1d5db;border-radius:12px;padding:14px 18px;margin:14px 0">
<p style="margin:0;font-size:18px"><b>Option 2: Premium only: $200</b></p>
<p style="margin:8px 0">If you don't want a website right now, that's fine. Your one-year Premium package (Featured page, banner ads, classified, 5 gigs and News Desk story) is $200.</p>
<p style="margin:8px 0 0">${button(PAY_PREMIUM, "Pay $200: Premium", "#4c1d95")}</p>
</div>
<p>Both are secure card payments by Stripe, and you will get a receipt by email. Any questions, just reply to this email or call Anil.</p>
<p>Thank you,<br><b>Anil Aggarwal</b><br>GoDesi.com</p>
</div>`;

async function main() {
  writeFileSync("/tmp/pandit-lakshman-offer.html", html);
  if (!process.argv.includes("--send")) return console.log("Preview: /tmp/pandit-lakshman-offer.html");
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) {
    console.error("RESEND_API_KEY and EMAIL_FROM must be set to send");
    process.exit(1);
  }
  const ok = await sendEmail({
    to: TO,
    subject: "Pandit Lakshman Ji: today only, Premium + new website for $500 (or Premium for $200)",
    html,
  });
  if (!ok) {
    console.error("Send failed");
    process.exit(1);
  }
  console.log(`Sent to ${TO}`);
}

main();
