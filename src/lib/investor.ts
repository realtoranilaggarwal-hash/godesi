import { createHmac } from "crypto";
import { cookies } from "next/headers";

export const INVESTOR_COOKIE = "godesi_investor";

/** Cookie value that marks an unlocked investor session — the password itself is never stored client-side. */
export function investorCookie() {
  const secret = process.env.AUTH_SECRET ?? "";
  return createHmac("sha256", secret)
    .update(`investor:${process.env.INVESTOR_PASSWORD ?? ""}`)
    .digest("hex");
}

export function investorUnlocked() {
  if (!process.env.INVESTOR_PASSWORD) return false;
  return cookies().get(INVESTOR_COOKIE)?.value === investorCookie();
}
