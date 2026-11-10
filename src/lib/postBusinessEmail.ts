import { db } from "@/lib/db";
import { emailEnabled, sendEmail } from "@/lib/email";
import { siteUrl } from "@/lib/format";
import { morningToken } from "@/lib/morningEmail";

/**
 * Weekly nudge for members who signed up as a business but have not posted a
 * business card yet. It stops on its own once they post one, and the
 * unsubscribe link (shared with the morning email) stops it too.
 */
const SUBJECT =
  "Your GoDesi business page is waiting, post it free in 2 minutes";
const MIN_AGE_MS = 2 * 24 * 60 * 60 * 1000;

function weeklyCap() {
  const value = Number(process.env.POST_BUSINESS_WEEKLY_CAP);
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : 150;
}

function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
}

export function postBusinessHtml(name: string | null, unsubscribe: string) {
  const base = siteUrl();
  const first = escapeHtml((name ?? "").trim().split(/\s+/)[0] || "there");
  return `<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#1e293b;font-size:15px;line-height:1.55">
<div style="background:linear-gradient(90deg,#f97316,#db2777);color:#fff;padding:18px 22px;border-radius:12px 12px 0 0">
<div style="font-size:13px;opacity:.9">GoDesi.com</div><div style="font-size:22px;font-weight:bold">Your business page is waiting</div></div>
<div style="border:1px solid #e2e8f0;border-top:0;padding:22px;border-radius:0 0 12px 12px">
<p>Hi ${first},</p>
<p>Thanks for joining GoDesi.com as a business owner! Your business isn't posted yet, so people searching GoDesi can't find you. It's <b>free</b> and takes about 2 minutes.</p>
<p style="text-align:center;margin:22px 0"><a href="${base}/howto" style="background:#1e293b;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:bold">&#9654; Watch the 90-second video</a></p>
<ol style="padding-left:20px">
<li>Sign in at godesi.com</li>
<li>Choose <b>Business card</b></li>
<li>Pick your category and add your address, a few lines about your business and your WhatsApp number</li>
<li>Click <b>Create my card</b></li></ol>
<p style="text-align:center;margin:22px 0"><a href="${base}/dashboard/profile" style="background:#db2777;color:#fff;text-decoration:none;padding:13px 24px;border-radius:8px;font-weight:bold;font-size:16px">Post my business free</a></p>
<p><b>What you get:</b> your own page on GoDesi, a spot in search and your city's listings, call and WhatsApp buttons, customer reviews and a QR code to share.</p>
<p>Questions? Just reply to this email, or call or WhatsApp me at 732-877-8585.</p>
<p>Anil Aggarwal<br>GoDesi.com</p>
<p style="margin-top:22px;font-size:12px;color:#94a3b8">You're getting this weekly because you signed up on GoDesi.com as a business and haven't posted it yet. <a href="${unsubscribe}" style="color:#94a3b8">Unsubscribe</a></p>
</div></div>`;
}

export async function sendPostBusinessReminders({ dryRun = false } = {}) {
  if (!emailEnabled()) return { sent: 0, skipped: "email not configured" };

  const members = await db.user.findMany({
    where: {
      role: "BUSINESS",
      bannedAt: null,
      morningOptOutAt: null,
      digestOptOutAt: null,
      createdAt: { lt: new Date(Date.now() - MIN_AGE_MS) },
      business: { is: null },
      NOT: [
        { email: { endsWith: "@example.com" } },
        { email: { endsWith: "resend.dev" } },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: weeklyCap(),
    select: { id: true, email: true, name: true },
  });
  if (dryRun)
    return { dryRun: true, eligible: members.length, subject: SUBJECT };

  let sent = 0;
  for (const member of members) {
    const unsubscribe = `${siteUrl()}/unsubscribe?m=${member.id}&t=${morningToken(member.id)}`;
    const ok = await sendEmail({
      to: member.email,
      subject: SUBJECT,
      html: postBusinessHtml(member.name, unsubscribe),
      replyTo:
        process.env.POST_BUSINESS_REPLY_TO || "realtoranilaggarwal@gmail.com",
      headers: { "List-Unsubscribe": `<${unsubscribe}>` },
    });
    if (ok) sent += 1;
  }
  return { sent, eligible: members.length };
}
