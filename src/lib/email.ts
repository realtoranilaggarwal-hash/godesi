import { SITE } from "@/lib/site";
import { siteUrl } from "@/lib/format";

/**
 * Transactional email through Resend's REST API. Sending is best-effort: a
 * provider outage must never break a signup or a ticket booking, so failures
 * are logged and surfaced to the caller as `false`.
 */
const ENDPOINT = "https://api.resend.com/emails";

/**
 * Both variables are required: EMAIL_FROM is only set once the sending domain is
 * verified, so OTP flows stay switched off until mail can actually be delivered.
 */
export function emailEnabled() {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

export function shell(title: string, body: string) {
  return `<!doctype html><html><body style="margin:0;background:#f8fafc;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#0f172a">
  <div style="max-width:560px;margin:0 auto;padding:24px">
    <div style="background:linear-gradient(90deg,#f97316,#e11d48,#c026d3);border-radius:16px 16px 0 0;padding:18px 24px">
      <span style="color:#fff;font-size:20px;font-weight:800;letter-spacing:.5px">Godesi</span>
    </div>
    <div style="background:#fff;border:1px solid #e2e8f0;border-top:0;border-radius:0 0 16px 16px;padding:24px">
      <h1 style="margin:0 0 12px;font-size:20px">${title}</h1>
      ${body}
    </div>
    <p style="margin:16px 0 0;font-size:12px;color:#64748b;text-align:center">
      <a href="${siteUrl()}" style="color:#64748b">${siteUrl().replace(/^https?:\/\//, "")}</a>
      · Need help? <a href="mailto:${SITE.supportEmail}" style="color:#64748b">${SITE.supportEmail}</a>
    </p>
  </div></body></html>`;
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!key || !from) return false;

  try {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: [to], subject, html }),
    });
    if (!response.ok) {
      console.error("Resend send failed", response.status, await response.text());
      return false;
    }
    return true;
  } catch (error) {
    console.error("Resend send error", error);
    return false;
  }
}

export function otpEmail(code: string) {
  return {
    subject: `${code} is your Godesi verification code`,
    html: shell(
      "Verify your email",
      `<p style="margin:0 0 16px;color:#334155">Enter this code to finish setting up your Godesi account. It expires in 10 minutes.</p>
       <p style="margin:0 0 16px;font-size:34px;font-weight:800;letter-spacing:8px">${code}</p>
       <p style="margin:0;font-size:13px;color:#64748b">If you did not create a Godesi account, you can ignore this email.</p>`,
    ),
  };
}

export function ticketEmail({
  eventTitle,
  when,
  venue,
  seats,
  code,
}: {
  eventTitle: string;
  when: string;
  venue: string;
  seats: number;
  code: string;
}) {
  const url = `${siteUrl()}/tickets/${code}`;
  return {
    subject: `Your ticket for ${eventTitle}`,
    html: shell(
      "You're going! 🎉",
      `<p style="margin:0 0 12px;color:#334155"><strong>${eventTitle}</strong></p>
       <p style="margin:0 0 4px;color:#334155">📅 ${when}</p>
       <p style="margin:0 0 4px;color:#334155">📍 ${venue}</p>
       <p style="margin:0 0 16px;color:#334155">🎫 ${seats} seat${seats > 1 ? "s" : ""} · booking code <strong>${code}</strong></p>
       <p style="margin:0 0 16px"><img src="${siteUrl()}/api/tickets/${code}/qr" alt="Ticket QR code" width="180" height="180" /></p>
       <p style="margin:0"><a href="${url}" style="display:inline-block;background:#4f46e5;color:#fff;border-radius:10px;padding:12px 18px;font-weight:700;text-decoration:none">Open my ticket</a></p>
       <p style="margin:16px 0 0;font-size:13px;color:#64748b">Show the QR code at the entrance.</p>`,
    ),
  };
}
