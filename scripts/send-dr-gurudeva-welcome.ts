import { writeFileSync } from "node:fs";
import { sendEmail } from "@/lib/email";

/**
 * Welcome email for Dr. Gurudeva's Premium package. Writes a preview to
 * /tmp/dr-gurudeva-welcome.html; pass --send to email it.
 *
 *   npx tsx scripts/send-dr-gurudeva-welcome.ts [--send]
 */
const TO = "doctor_deva@yahoo.com";
const SLUG = "dr-gurudeva-indian-vedic-astrologer-jyotish-highland-park";
const SITE = "https://godesi.com";
const PAGE = `${SITE}/business/${SLUG}`;
const QR = `${SITE}/api/qr/${SLUG}`;
const RESET = `${SITE}/forgot-password?email=${encodeURIComponent(TO)}`;

const button = (href: string, label: string) =>
  `<a href="${href}" style="display:inline-block;background:#ea580c;color:#fff;text-decoration:none;font-weight:700;padding:10px 18px;border-radius:8px">${label}</a>`;

const html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#1f2937;line-height:1.5">
<p>Namaste Dr. Gurudeva ji,</p>
<p>Welcome to GoDesi Premium. As Anil promised, you have our <b>$500 one-year package for $100</b>, valid until <b>November 25, 2027</b>. Here is everything that is now live for you:</p>
<ul>
<li><b>Your business page</b>, Featured among astrologers: <a href="${PAGE}">${PAGE.replace("https://", "")}</a></li>
<li><b>Banner ads</b> on GoDesi's astrology pages and in the sidebar across the site</li>
<li><b>Your offer</b> on your page and in GoDesi Deals: <i>"First phone consultation FREE when you mention GoDesi"</i></li>
<li><b>A gemstones & yantras classified</b> and a <b>GoDesi News Desk story</b> about your 35 years of practice</li>
</ul>
<h3 style="margin-bottom:4px">1. Set your password</h3>
<p style="margin-top:0">Your account is <b>${TO}</b>. Click below and GoDesi will email you a 6-digit code to choose your password.</p>
<p>${button(RESET, "Set my password")}</p>
<h3 style="margin-bottom:4px">2. See who is finding you</h3>
<p style="margin-top:0">After you sign in, your <a href="${SITE}/dashboard">dashboard</a> shows how many people viewed your page, which website they came from (Google, Facebook, GoDesi) and which city they are in. From there you can also edit your page, photos and offer.</p>
<h3 style="margin-bottom:4px">3. Put your QR code on all your media</h3>
<p style="margin-top:0">From now on, please add this QR code to your flyers, visiting cards, posters, social media and videos. People scan it, land on your GoDesi page, see your location on the map and can call or WhatsApp you in one tap. Scans show up in your dashboard.</p>
<p style="text-align:center"><img src="${QR}" width="240" height="240" alt="Dr. Gurudeva GoDesi QR code"></p>
<p style="text-align:center">${button(`${QR}?download=1`, "Download QR code")}</p>
<h3 style="margin-bottom:4px">4. Your GoDesi caller offer</h3>
<p style="margin-top:0">When someone calls and says they found you on GoDesi, please give them their first phone consultation free. Asking "How did you hear about me?" also lets you see how many calls GoDesi sends you.</p>
<p>Your package renews on November 25, 2027, and we will send you the renewal bill before then. Any questions, just reply to this email or call Anil.</p>
<p>Thank you for trusting GoDesi,<br><b>Anil Aggarwal</b><br>GoDesi.com</p>
</div>`;

async function main() {
  writeFileSync("/tmp/dr-gurudeva-welcome.html", html);
  if (!process.argv.includes("--send")) return console.log("Preview: /tmp/dr-gurudeva-welcome.html");
  const ok = await sendEmail({
    to: TO,
    subject: "Welcome to GoDesi Premium, Dr. Gurudeva — your page, QR code and password",
    html,
  });
  console.log(ok ? `Sent to ${TO}` : "Send failed");
}

main();
