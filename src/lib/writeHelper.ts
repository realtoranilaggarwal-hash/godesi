/**
 * Shared prompt builder for the "help me write this" button. The same brief is
 * shown to the member (to paste into ChatGPT) and sent to our own AI, so the
 * copy stays consistent whether or not AI drafting is switched on.
 */
export const WRITE_KINDS = [
  "business",
  "listing",
  "event",
  "requirement",
  "profile",
  "worship",
  "photos",
] as const;

export type WriteKind = (typeof WRITE_KINDS)[number];

export type WriteContext = Record<string, string>;

function contextLines(context: WriteContext) {
  const lines = Object.entries(context)
    .filter(([, value]) => value && value.trim())
    .map(([label, value]) => `- ${label}: ${value.trim()}`);
  return lines.length ? lines.join("\n") : "- (no details filled in yet)";
}

const INTROS: Record<WriteKind, string> = {
  business:
    "Write an 'About us' description for a small business listing on Godesi, a directory for the desi (South Asian) community.",
  listing:
    "Write a description for a classified listing on Godesi, a marketplace for the desi (South Asian) community.",
  event:
    "Write a description for a community event listing on Godesi, a desi (South Asian) community site.",
  requirement:
    "Write a short brief describing what I need, to post as a requirement on Godesi so local businesses can quote.",
  profile:
    "Write a short personal 'about me' for my public profile on Godesi, a desi (South Asian) community site.",
  worship:
    "Write a short description of a temple, gurudwara, mosque or church for a community directory.",
  photos:
    "I have no photos yet for my listing. Tell me exactly which photos to take and how to shoot them with a phone.",
};

const RULES: Record<WriteKind, string> = {
  business:
    "3 short paragraphs at most, under 120 words in total. Say what we do, who we help and what makes us easy to deal with. Friendly and factual — do not invent prices, awards, years in business or certifications.",
  listing:
    "Under 100 words. Cover condition or specifics, why I am posting it and what a buyer should know. Do not invent details I have not given.",
  event:
    "Under 100 words. Say what the event is, who it suits, what to expect and why to come. No invented ticket prices or line-ups.",
  requirement:
    "Under 80 words. State what I need, where, roughly when, and what I want the provider to include in their quote. No contact details.",
  profile:
    "Under 80 words, first person, warm and specific about what I do and what I am looking for in the community.",
  worship:
    "Under 90 words, respectful and factual. Mention what visitors can expect and the community it serves.",
  photos:
    "Give me a numbered list of 6 to 8 photos to take, each with one line on framing and lighting, then one line on what to avoid. Practical phone-camera advice only.",
};

export function writeBrief(kind: WriteKind, context: WriteContext) {
  return [
    INTROS[kind],
    "",
    "Details:",
    contextLines(context),
    "",
    `Rules: ${RULES[kind]}`,
    "Return only the finished text, with no preamble and no headings.",
  ].join("\n");
}
