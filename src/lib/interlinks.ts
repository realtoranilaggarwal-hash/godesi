import { subcategorySlug } from "@/lib/categories";
import { FESTIVALS, festivalSlug } from "@/lib/festivals";

/**
 * Words in member-written descriptions that become links to GoDesi's own pages,
 * e.g. "DJ" -> /dj. Internal links help search engines find and rank those pages.
 */
type Interlink = { terms: string[]; href: string };

const sub = (parent: string, name: string) =>
  `/categories/${subcategorySlug(parent, name)}`;

const INTERLINKS: Interlink[] = [
  { terms: ["DJs", "DJ", "dhol"], href: "/dj" },
  { terms: ["banquet halls", "banquet hall", "venues", "venue"], href: "/venues" },
  { terms: ["weddings", "wedding"], href: "/wedding" },
  { terms: ["pooja", "puja"], href: "/pooja" },
  { terms: ["rishta", "matrimonial"], href: "/rishta" },
  { terms: ["astrologers", "astrologer", "astrology", "kundli", "horoscope"], href: "/astrology" },
  { terms: ["roommates", "roommate"], href: "/rooms" },
  { terms: ["temples", "temple", "gurudwaras", "gurudwara"], href: "/religious" },
  { terms: ["real estate", "realtor"], href: "/real-estate" },
  { terms: ["caterers", "caterer", "catering"], href: sub("food-catering", "Caterers") },
  { terms: ["tiffin"], href: sub("food-catering", "Tiffin & Dabba Service") },
  { terms: ["photographers", "photographer", "photography"], href: sub("events-wedding", "Photographers") },
  { terms: ["videographers", "videographer"], href: sub("events-wedding", "Videographers") },
  { terms: ["mehndi", "henna"], href: sub("events-wedding", "Mehndi Artists") },
  { terms: ["makeup artists", "makeup artist", "bridal makeup"], href: sub("events-wedding", "Makeup Artists") },
  { terms: ["decorators", "decorator", "decoration", "decor"], href: sub("events-wedding", "Decorators & Florists") },
  { terms: ["pandits", "pandit", "purohit"], href: sub("religious-services", "Pandits & Purohits") },
  { terms: ["tax preparation", "tax filing", "CPA"], href: sub("financial-services", "Tax Preparation & Filing") },
  ...FESTIVALS.map((festival) => ({
    terms: [festival.name.replace(/\s*\(.*?\)/g, "")],
    href: `/festivals/${festivalSlug(festival)}`,
  })),
];

const escape = (term: string) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const TERMS = INTERLINKS.flatMap(({ terms, href }) =>
  terms.map((term) => ({ term, href })),
).sort((a, b) => b.term.length - a.term.length);

const HREF_BY_TERM = new Map(TERMS.map(({ term, href }) => [term.toLowerCase(), href]));

const PATTERN = new RegExp(
  `(?<![\\w-])(${TERMS.map(({ term }) => escape(term)).join("|")})(?![\\w-])`,
  "gi",
);

// A space-separated chunk with any of these (or a dot inside a word, like acme.photography)
// is a web address, email or @handle.
const ADDRESS = /[/@=]|:\/\/|www\.|\w\.\w/i;

function inAddress(text: string, start: number, end: number) {
  const before = text.slice(0, start).match(/\S*$/)?.[0] ?? "";
  // Ending punctuation ("Need a DJ?") belongs to the sentence, not an address.
  const after = (text.slice(end).match(/^\S*/)?.[0] ?? "").replace(/[.,!?;:)\]"']+$/, "");
  return ADDRESS.test(before + text.slice(start, end) + after);
}

export type TextPart = string | { text: string; href: string };

/** Links the first mention of each known word, at most `max` links, skipping `exclude` pages. */
export function interlinkText(
  text: string,
  { max = 3, exclude = [] }: { max?: number; exclude?: (string | null | undefined)[] } = {},
): TextPart[] {
  const used = new Set(exclude.filter(Boolean) as string[]);
  const parts: TextPart[] = [];
  let last = 0;
  let links = 0;
  for (const match of Array.from(text.matchAll(PATTERN))) {
    if (links >= max) break;
    const href = HREF_BY_TERM.get(match[0].toLowerCase());
    // "CPA" and "DJ" are only linked in capitals, so "cpa" or "dj" inside other text isn't.
    if (!href || used.has(href)) continue;
    if (match[0].length <= 3 && match[0] !== match[0].toUpperCase()) continue;
    const start = match.index ?? 0;
    if (inAddress(text, start, start + match[0].length)) continue;
    if (start > last) parts.push(text.slice(last, start));
    parts.push({ text: match[0], href });
    last = start + match[0].length;
    used.add(href);
    links += 1;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}
