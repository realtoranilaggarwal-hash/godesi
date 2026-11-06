import { createHmac, timingSafeEqual } from "crypto";
import { siteUrl } from "@/lib/format";

/** Emails can't send a login cookie, so the QR image link in a ticket email is signed instead. */
export function ticketQrToken(code: string) {
  return createHmac("sha256", process.env.AUTH_SECRET ?? "")
    .update(`ticket-qr:${code}`)
    .digest("hex")
    .slice(0, 32);
}

export function ticketQrTokenValid(code: string, token: string | null) {
  if (!token) return false;
  const expected = Buffer.from(ticketQrToken(code));
  const given = Buffer.from(token);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

export function ticketQrEmailUrl(code: string) {
  return `${siteUrl()}/api/tickets/${code}/qr?t=${ticketQrToken(code)}`;
}
