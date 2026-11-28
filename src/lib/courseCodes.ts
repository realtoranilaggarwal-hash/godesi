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

/**
 * `count` codes derived from `seed` (e.g. a Stripe Checkout session id): the same seed always
 * yields the same codes, so retried webhooks resend the same codes instead of minting new ones.
 */
export function freeCourseCodesFor(seed: string, count: number) {
  return Array.from({ length: count }, (_, index) => {
    const secret = process.env.AUTH_SECRET;
    if (!secret) throw new Error("AUTH_SECRET is not set");
    const digest = createHmac("sha256", secret).update(`bonus:${seed}:${index}`).digest();
    const body = Array.from(digest.subarray(0, 6), (byte) => ALPHABET[byte % ALPHABET.length]).join("");
    return `ANIL-${body}-${signature(body)}`;
  });
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

/** One shared promo code: every member can use it once to unlock one course (and its ebook) free. */
export const SIGNUP_PROMO_CODE = "GODESIFREE";
export const SIGNUP_PROMO_PROVIDER = "signup-promo";

export function isSignupPromoCode(input: string) {
  return input.trim().toUpperCase().replace(/\s+/g, "") === SIGNUP_PROMO_CODE;
}

/** Stored as the enrollment's unique `reference`, so each account can use the promo code once. */
export function signupPromoReference(userId: string) {
  return `${SIGNUP_PROMO_PROVIDER}:${userId}`;
}

export function freeCodeReference(code: string) {
  return `${FREE_CODE_PROVIDER}:${code}`;
}
