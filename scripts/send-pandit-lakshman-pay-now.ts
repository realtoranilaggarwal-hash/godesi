import { writeFileSync } from "node:fs";
import { sendEmail } from "@/lib/email";

/**
 * Short "pay the $200 now" nudge to Pandit Lakshman Ji: the $200 Premium price
 * goes back to $250 one hour after this is sent.
 * Writes a preview to /tmp/pandit-lakshman-pay-now.html; pass --send to email it.
 *
 *   npx tsx scripts/send-pandit-lakshman-pay-now.ts [--send]
 */
const TO = "astrologerlakshman9@gmail.com";
const SITE = "https://godesi.com";
const PAGE = `${SITE}/business/master-lakshman-ji-astrologer-psychic-healer-jersey-city`;
const PAY_PREMIUM = `${SITE}/pay/master-lakshman-0b09bc7020fc`;

const deadline = new Date(Date.now() + 60 * 60 * 1000).toLocaleTimeString("en-US", {
  timeZone: "America/New_York",
  hour: "numeric",
  minute: "2-digit",
});

const html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#1f2937;line-height:1.5">
<p>Namaste Pandit Lakshman Ji,</p>
<p>Your GoDesi Premium package is ready and working: <a href="${PAGE}">see your page</a>. Your banner is also showing to GoDesi visitors on their phones.</p>
<div style="border:2px solid #be123c;border-radius:12px;padding:14px 18px;margin:14px 0;background:#fff1f2">
<p style="margin:0;font-size:18px"><b>Please pay $200 now.</b> The price goes back to <b>$250</b> in 1 hour, at <b>${deadline} ET</b> today.</p>
<p style="margin:10px 0 0"><a href="${PAY_PREMIUM}" style="display:inline-block;background:#be123c;color:#fff;text-decoration:none;font-weight:700;padding:12px 20px;border-radius:8px">Pay $200 now →</a></p>
</div>
<p>It's a secure card payment by Stripe, and you will get a receipt by email. Any questions, just reply to this email or call Anil.</p>
<p>Thank you,<br><b>Anil Aggarwal</b><br>GoDesi.com</p>
</div>`;

async function main() {
  writeFileSync("/tmp/pandit-lakshman-pay-now.html", html);
  if (!process.argv.includes("--send")) return console.log("Preview: /tmp/pandit-lakshman-pay-now.html");
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) {
    console.error("RESEND_API_KEY and EMAIL_FROM must be set to send");
    process.exit(1);
  }
  const ok = await sendEmail({
    to: TO,
    subject: `Pandit Lakshman Ji: pay $200 by ${deadline} ET — price goes back to $250`,
    html,
  });
  if (!ok) {
    console.error("Send failed");
    process.exit(1);
  }
  console.log(`Sent to ${TO}; deadline ${deadline} ET`);
}

main();
