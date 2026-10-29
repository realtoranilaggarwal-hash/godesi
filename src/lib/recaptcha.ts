export const RECAPTCHA_SITE_KEY =
  process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? "";

export function recaptchaEnabled() {
  return Boolean(RECAPTCHA_SITE_KEY && process.env.RECAPTCHA_SECRET_KEY);
}

/** Google reCAPTCHA v2 checkbox check. Open when keys aren't configured. */
export async function verifyRecaptcha(token: string): Promise<boolean> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!RECAPTCHA_SITE_KEY || !secret) return true;
  if (!token) return false;
  try {
    const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(token)}`,
      cache: "no-store",
    });
    const json = (await res.json()) as { success?: boolean };
    return Boolean(json.success);
  } catch {
    return false;
  }
}
