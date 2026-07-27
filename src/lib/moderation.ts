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

/** Contact details in free text bypass our WhatsApp field and invite abuse. */
export function containsContactDetails(text: string) {
  return (
    /\b\d[\d\s().-]{7,}\b/.test(text) ||
    /\b[\w.+-]+@[\w-]+\.[a-z]{2,}\b/i.test(text) ||
    /\b(?:https?:\/\/|www\.)\S+/i.test(text)
  );
}
