import { createHmac, randomInt, timingSafeEqual } from "node:crypto";

/**
 * One-time "any course free" codes Anil hands to the clients he sells or buys
 * a home for. Codes are self-verifying (HMAC of AUTH_SECRET), and a redeemed
 * code is stored as the enrollment's unique `reference`, so each works once.
 */
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
export const FREE_CODE_PROVIDER = "free-code";

function signature(body: string) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not set");
  const digest = createHmac("sha256", secret).update(`course:${body}`).digest();
  return Array.from(digest.subarray(0, 4), (byte) => ALPHABET[byte % ALPHABET.length]).join("");
}

export function generateFreeCourseCode() {
  const body = Array.from({ length: 6 }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");
  return `ANIL-${body}-${signature(body)}`;
}

/** Returns the canonical code when it is genuine, otherwise null. */
export function verifyFreeCourseCode(input: string) {
  const code = input.trim().toUpperCase().replace(/\s+/g, "");
  const match = /^ANIL-([A-Z0-9]{6})-([A-Z0-9]{4})$/.exec(code);
  if (!match) return null;
  const expected = Buffer.from(signature(match[1]));
  const given = Buffer.from(match[2]);
  return expected.length === given.length && timingSafeEqual(expected, given) ? code : null;
}

export function freeCodeReference(code: string) {
  return `${FREE_CODE_PROVIDER}:${code}`;
}
