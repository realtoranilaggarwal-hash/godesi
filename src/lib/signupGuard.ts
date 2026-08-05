import { db } from "@/lib/db";

/**
 * Bot signups were arriving as random-string names on Gmail dot aliases, which
 * look like separate people but land in one mailbox. Everything here runs at
 * signup so those accounts are never created, rather than cleaned up later.
 */

/** Gmail ignores dots and anything after "+", so both fold to one mailbox. */
const DOTLESS_DOMAINS = new Set(["gmail.com", "googlemail.com"]);

/** Throwaway inboxes; a member who needs one is not building a business here. */
const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com",
  "guerrillamail.com",
  "guerrillamail.info",
  "sharklasers.com",
  "10minutemail.com",
  "tempmail.com",
  "temp-mail.org",
  "yopmail.com",
  "trashmail.com",
  "dispostable.com",
  "getnada.com",
  "maildrop.cc",
  "fakeinbox.com",
  "throwawaymail.com",
  "mohmal.com",
  "emailondeck.com",
  "spam4.me",
  "grr.la",
  "moakt.com",
  "tempr.email",
  "mailnesia.com",
  "inboxbear.com",
  "byom.de",
  "discard.email",
]);

/** One mailbox per person: dots and +tags stripped where the provider ignores them. */
export function canonicalEmail(email: string) {
  const clean = email.trim().toLowerCase();
  const at = clean.lastIndexOf("@");
  if (at < 1) return clean;

  const domain = clean.slice(at + 1);
  let local = clean.slice(0, at);
  const plus = local.indexOf("+");
  if (plus > 0) local = local.slice(0, plus);
  if (DOTLESS_DOMAINS.has(domain)) local = local.replace(/\./g, "");

  return `${local}@${domain}`;
}

/**
 * Plenty of real people have one dot in their Gmail address. Sprinkling three
 * or more, or adding a +tag, is how one mailbox is stretched into many
 * accounts, so only that counts as a signal.
 */
export function heavilyAliased(email: string) {
  const clean = email.trim().toLowerCase();
  const at = clean.lastIndexOf("@");
  if (at < 1) return false;
  const local = clean.slice(0, at);
  const domain = clean.slice(at + 1);
  if (!DOTLESS_DOMAINS.has(domain)) return local.includes("+");
  return local.includes("+") || (local.match(/\./g) ?? []).length >= 3;
}

export function isDisposableEmail(email: string) {
  const domain = email.split("@")[1] ?? "";
  return DISPOSABLE_DOMAINS.has(domain);
}

/**
 * Machine-generated handles like "AxkNteMPTEVwhfLnlwf" have no spaces, flip
 * case mid-word and run long stretches without a vowel. Real names — including
 * single-word and transliterated Indian names — do none of those.
 */
export function looksMachineGenerated(name: string) {
  const trimmed = name.trim();
  if (trimmed.length < 10) return false;
  if (/\s/.test(trimmed)) return false;
  if (!/^[A-Za-z]+$/.test(trimmed)) return false;

  const vowelRatio =
    (trimmed.match(/[aeiouy]/gi) ?? []).length / trimmed.length;
  const caseFlips = (trimmed.match(/[a-z][A-Z]/g) ?? []).length;
  const longConsonantRun = /[^aeiouy]{5,}/i.test(trimmed);

  return caseFlips >= 2 || vowelRatio < 0.28 || longConsonantRun;
}

export type SignupVerdict = { ok: true } | { ok: false; reason: string };

/** Signups from one address, so a script cannot open accounts in a loop. */
const IP_LIMIT = 3;
const IP_WINDOW_MINUTES = 60;

export async function screenSignup({
  name,
  email,
  ip,
  trap,
}: {
  name: string;
  email: string;
  ip: string | null;
  /** Hidden field no human fills in; anything in it is a bot. */
  trap: string;
}): Promise<SignupVerdict> {
  if (trap.trim()) return { ok: false, reason: "Signup could not be verified." };

  if (isDisposableEmail(email)) {
    return {
      ok: false,
      reason: "Please use a permanent email address, not a temporary one.",
    };
  }

  if (looksMachineGenerated(name)) {
    return {
      ok: false,
      reason: "Please enter your real name as you want it shown on Godesi.",
    };
  }

  const canonical = canonicalEmail(email);
  const twin = await db.user.findFirst({
    where: { OR: [{ email }, { emailCanonical: canonical }] },
    select: { id: true },
  });
  if (twin) {
    return { ok: false, reason: "An account with this email already exists." };
  }

  if (ip) {
    const since = new Date(Date.now() - IP_WINDOW_MINUTES * 60_000);
    const recent = await db.user.count({
      where: { signupIp: ip, createdAt: { gte: since } },
    });
    if (recent >= IP_LIMIT) {
      return {
        ok: false,
        reason:
          "Too many accounts were created from this connection. Try again later or email support.",
      };
    }
  }

  return { ok: true };
}

/**
 * Accounts already in the database that carry the bot signature, so the members
 * desk can list them for one-click removal.
 */
export function spamSignals(user: {
  name: string;
  email: string;
  emailVerifiedAt: Date | null;
}) {
  const signals: string[] = [];
  if (looksMachineGenerated(user.name)) signals.push("Random-looking name");
  if (heavilyAliased(user.email))
    signals.push("Dotted or tagged alias of another address");
  if (isDisposableEmail(user.email)) signals.push("Disposable email domain");
  if (!user.emailVerifiedAt) signals.push("Email never verified");
  return signals;
}

/** Enough signals to be worth showing under "suspected spam". */
export function looksLikeSpam(user: {
  name: string;
  email: string;
  emailVerifiedAt: Date | null;
}) {
  const signals = spamSignals(user);
  const strong = signals.filter(
    (signal) => signal !== "Email never verified",
  ).length;
  return strong > 0 && !user.emailVerifiedAt;
}
