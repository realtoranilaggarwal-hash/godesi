import { createHmac } from "node:crypto";

/**
 * One-ebook member code for vdorental.com: GD-<last 8 chars of the user id>-<8-char HMAC>.
 * vdorental verifies it with the same GODESI_EBOOK_SECRET and lets each code unlock one ebook.
 */
export function vdoEbookCode(userId: string): string | null {
  const secret = process.env.GODESI_EBOOK_SECRET;
  if (!secret) return null;
  const id = userId.slice(-8).toLowerCase();
  const sig = createHmac("sha256", secret).update(`vdo-ebook:${id}`).digest("hex").slice(0, 8);
  return `GD-${id}-${sig}`.toUpperCase();
}
