/**
 * Keeps Connect strictly platonic: adult, escort and hook-up wording is rejected
 * outright rather than moderated later, which also keeps the section AdSense-safe.
 */
const BLOCKED = [
  "porn",
  "pornhub",
  "sex",
  "sexy",
  "sexting",
  "nude",
  "nudes",
  "naked",
  "escort",
  "escorts",
  "hooker",
  "hookup",
  "hook up",
  "onlyfans",
  "callgirl",
  "call girl",
  "callboy",
  "call boy",
  "massage service",
  "erotic",
  "xxx",
  "nsfw",
  "fuck",
  "fucking",
  "bitch",
  "randi",
  "chudai",
  "boobs",
  "dick",
  "penis",
  "vagina",
  "horny",
  "milf",
  "one night stand",
  "sugar daddy",
  "sugar baby",
  "physical relationship",
  "no strings attached",
];

const SEPARATORS = /[\s._\-*+]+/g;

/** Returns the first blocked term found, so the member can be told what to fix. */
export function findBlockedTerm(text: string) {
  const flat = ` ${text.toLowerCase().replace(SEPARATORS, " ").replace(/\s+/g, " ")} `;
  const squashed = flat.replace(/ /g, "");

  return (
    BLOCKED.find((term) =>
      term.includes(" ")
        ? flat.includes(` ${term} `) || squashed.includes(term.replace(/ /g, ""))
        : new RegExp(`\\b${term}\\b`).test(flat) || squashed.includes(term),
    ) ?? null
  );
}

export function containsBlockedTerm(text: string) {
  return findBlockedTerm(text) !== null;
}

const PHONE = "\\+?\\d[\\d\\s().-]{5,}\\d";
const EMAIL = "[\\w.+-]+@[\\w-]+\\.[a-z]{2,}";
const LINK = "(?:https?://|www\\.)\\S+";
/** Ten digits is a full number; shorter runs are prices, years and door numbers. */
const PHONE_DIGITS = 9;

function digits(value: string) {
  return value.replace(/\D/g, "").length;
}

function findPhone(text: string) {
  return (
    text
      .match(new RegExp(PHONE, "g"))
      ?.find((match) => digits(match) >= PHONE_DIGITS) ?? null
  );
}

/** Contact details in free text bypass our WhatsApp field and invite abuse. */
export function containsContactDetails(text: string) {
  return contactDetailKind(text) !== null;
}

/** Names what a member typed so the error message can be specific. */
export function contactDetailKind(text: string) {
  if (new RegExp(EMAIL, "i").test(text)) return "email address" as const;
  if (new RegExp(LINK, "i").test(text)) return "link" as const;
  if (findPhone(text)) return "phone number" as const;
  return null;
}

const HIDDEN = "[hidden]";

/**
 * Free listings promise WhatsApp-only contact, so phone numbers, emails and links
 * typed into descriptions are masked when the copy is rendered publicly.
 */
export function maskContactDetails(text: string) {
  return text
    .replace(new RegExp(EMAIL, "gi"), HIDDEN)
    .replace(new RegExp(LINK, "gi"), HIDDEN)
    .replace(new RegExp(PHONE, "g"), (match) =>
      digits(match) >= PHONE_DIGITS ? HIDDEN : match,
    );
}
