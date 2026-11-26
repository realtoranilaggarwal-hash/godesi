import { writeFileSync } from "node:fs";
import { sendEmail } from "@/lib/email";

/**
 * Welcome email for Pandit Lakshman Ji's $200 Premium package, with the
 * website-redo and NYE party offers. Writes a preview to
 * /tmp/master-lakshman-welcome.html; pass --send to email it.
 *
 *   npx tsx scripts/send-master-lakshman-welcome.ts [--send]
 */
const TO = "astrologerlakshman9@gmail.com";
const SLUG = "master-lakshman-ji-astrologer-psychic-healer-jersey-city";
const SITE = "https://godesi.com";
const PAGE = `${SITE}/business/${SLUG}`;
const PROFILE = `${SITE}/astrologer-lakshman`;
const QR = `${SITE}/api/qr/${SLUG}`;
const PAY = `${SITE}/pay/master-lakshman-0b09bc7020fc`;
const RESET = `${SITE}/forgot-password?email=${encodeURIComponent(TO)}`;

const button = (href: string, label: string) =>
  `<a href="${href}" style="display:inline-block;background:#ea580c;color:#fff;text-decoration:none;font-weight:700;padding:10px 18px;border-radius:8px">${label}</a>`;

const html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#1f2937;line-height:1.5">
<p>Namaste Pandit Lakshman Ji,</p>
<p>Welcome to GoDesi Premium. As you discussed with Anil, your <b>one-year Premium package is $200</b>, valid until <b>November 26, 2027</b>. Here is everything that is now live for you:</p>
<ul>
<li><b>Your business page</b>, Featured among astrologers, with your WhatsApp button: <a href="${PAGE}">${PAGE.replace("https://", "")}</a></li>
<li><b>Banner ads</b> on GoDesi's astrology pages and in the sidebar across the site</li>
<li><b>Your offer</b> on your page and in GoDesi Deals: <i>"First consultation FREE when you mention GoDesi"</i></li>
<li><b>5 gigs</b> on your profile that people can book and pay for online: kundli reading, love &amp; marriage, career &amp; finance, dosha remedies, and palm &amp; tarot. See them at <a href="${PROFILE}">${PROFILE.replace("https://", "")}</a>. You can change the prices and wording any time after you sign in.</li>
<li><b>A featured classified</b> and a <b>GoDesi News Desk story</b> about your practice</li>
</ul>
<h3 style="margin-bottom:4px">1. Pay $200 for your package</h3>
<p style="margin-top:0">Please complete your <b>$200</b> payment by card with the button below. It is a secure Stripe checkout, and you will get a receipt by email.</p>
<p>${button(PAY, "Pay $200 now")}</p>
<h3 style="margin-bottom:4px">2. Set your password</h3>
<p style="margin-top:0">Your account is <b>${TO}</b>. Click below and GoDesi will email you a 6-digit code to choose your password.</p>
<p>${button(RESET, "Set my password")}</p>
<h3 style="margin-bottom:4px">3. See who is finding you</h3>
<p style="margin-top:0">After you sign in, your <a href="${SITE}/dashboard">dashboard</a> shows how many people viewed your page, which website they came from (Google, Facebook, GoDesi) and which city they are in. From there you can also edit your page, photos, gigs and offer.</p>
<h3 style="margin-bottom:4px">4. Put your QR code on all your media</h3>
<p style="margin-top:0">Please add this QR code to your flyers, visiting cards, posters, social media and videos. People scan it, land on your GoDesi page, see your location on the map and can call or WhatsApp you in one tap. Scans show up in your dashboard.</p>
<p style="text-align:center"><img src="${QR}" width="240" height="240" alt="Pandit Lakshman Ji GoDesi QR code"></p>
<p style="text-align:center">${button(`${QR}?download=1`, "Download QR code")}</p>
<h3 style="margin-bottom:4px">5. Your GoDesi caller offer</h3>
<p style="margin-top:0">When someone calls and says they found you on GoDesi, please give them their first consultation free. Asking "How did you hear about me?" also lets you see how many calls GoDesi sends you.</p>
<h3 style="margin-bottom:4px">A new website for $300 (a $1,000 website)</h3>
<p style="margin-top:0">We would also like to rebuild <a href="https://astrolakshmanji.com/">astrolakshmanji.com</a> for you. Several of its pages are static and some are not working properly. We will make a fast, modern website where every page works: one page for each of your services, your Google reviews, a WhatsApp and call button on every page, and a booking form, all set up so Google can find each service. This is a $1,000 website, and as Premium member you get it for <b>$300</b>. Just reply "Yes" to this email and we will start.</p>
<h3 style="margin-bottom:4px">Promotion at our New Year's Eve party</h3>
<p style="margin-top:0">If you like, we can also promote you through our New Year's Eve party, <a href="https://www.newyearevesparty.com/">NewYearEvesParty.com</a>, and tell guests to visit your website to get their first consultation free. Reply and let us know.</p>
<p>Your package renews on November 26, 2027, and we will send you the renewal bill before then. Any questions, just reply to this email or call Anil.</p>
<p>Thank you for trusting GoDesi,<br><b>Anil Aggarwal</b><br>GoDesi.com</p>
</div>`;

async function main() {
  writeFileSync("/tmp/master-lakshman-welcome.html", html);
  if (!process.argv.includes("--send")) return console.log("Preview: /tmp/master-lakshman-welcome.html");
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) {
    console.error("RESEND_API_KEY and EMAIL_FROM must be set to send");
    process.exit(1);
  }
  const ok = await sendEmail({
    to: TO,
    subject: "Welcome to GoDesi Premium, Pandit Lakshman Ji — your page, gigs, QR code and password",
    html,
  });
  if (!ok) {
    console.error("Send failed");
    process.exit(1);
  }
  console.log(`Sent to ${TO}`);
}

main();
