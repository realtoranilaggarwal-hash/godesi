import { db } from "@/lib/db";
import { searchBusinesses, type BusinessListItem } from "@/lib/businesses";
import { CATEGORY_TREE } from "@/lib/categories";
import { formatEventDate, seatsLeft } from "@/lib/events";
import { formatMoney } from "@/lib/format";

const STOPWORDS = new Set([
  "a", "an", "and", "any", "are", "best", "can", "find", "for", "get", "good",
  "hi", "hello", "how", "i", "in", "is", "it", "looking", "me", "my", "near",
  "need", "of", "on", "or", "please", "show", "some", "the", "to", "want",
  "was", "what", "where", "who", "with", "you", "your",
]);

/** Longest words first: "electrician" is a better query than "pune" for ranking. */
function keywords(text: string) {
  const seen = new Set<string>();
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOPWORDS.has(word) && !seen.has(word) && seen.add(word))
    .sort((a, b) => b.length - a.length)
    .slice(0, 4);
}

export type AssistantSource = { name: string; url: string };

function businessLine(b: BusinessListItem) {
  const rating = b.reviewCount ? `${b.rating.toFixed(1)}★ (${b.reviewCount})` : "no reviews yet";
  const category = [b.categoryName ?? b.category, b.subcategoryName].filter(Boolean).join(" › ");
  return `- ${b.name} — ${category}, ${b.city}, ${rating}, plan ${b.plan}. Link: /b/${b.slug}`;
}

/**
 * Builds the grounding block for the assistant: only real Godesi rows, so the
 * model recommends listings that exist instead of inventing businesses.
 */
export async function buildContext(question: string) {
  const words = keywords(question);

  const results = await Promise.all(
    (words.length ? words : [""]).map((word) =>
      searchBusinesses({ q: word || undefined, take: 8 }),
    ),
  );

  const businesses: BusinessListItem[] = [];
  for (const list of results) {
    for (const item of list) {
      if (!businesses.some((existing) => existing.id === item.id)) businesses.push(item);
    }
  }
  const shortlist = businesses.slice(0, 10);

  const [events, leads] = await Promise.all([
    db.event.findMany({
      where: { status: "APPROVED", startsAt: { gte: new Date() } },
      orderBy: { startsAt: "asc" },
      take: 5,
    }),
    db.lead.count({ where: { status: "OPEN" } }),
  ]);

  const lines = [
    `Categories on Godesi: ${CATEGORY_TREE.map((c) => c.name).join(", ")}.`,
    `Open buyer requirements right now: ${leads} (browse at /leads).`,
    shortlist.length
      ? `Matching listings:\n${shortlist.map(businessLine).join("\n")}`
      : "Matching listings: none found for this question.",
    events.length
      ? `Upcoming events:\n${events
          .map(
            (e) =>
              `- ${e.title} — ${formatEventDate(e.startsAt, e.timeZone)}, ${e.venue}, ${e.city}, ${
                e.price > 0 ? formatMoney(e.price, e.currency) : "free"
              }, ${seatsLeft(e)} seats left. Link: /events/${e.slug}`,
          )
          .join("\n")}`
      : "Upcoming events: none scheduled.",
  ];

  const sources: AssistantSource[] = shortlist
    .slice(0, 4)
    .map((b) => ({ name: b.name, url: `/b/${b.slug}` }));

  return { context: lines.join("\n\n"), sources };
}

export const ASSISTANT_SYSTEM_PROMPT = `You are the Godesi assistant on godesi.com, a multi-category desi directory of small businesses, buyer requirements (leads), community events and news.

Rules:
- Answer only from the GODESI DATA block in the user message. Never invent businesses, events, phone numbers, prices or reviews.
- If the data has no match, say so plainly and suggest the closest category page (e.g. /categories) or /search, and invite the visitor to post a requirement at /leads.
- Recommend at most 3 listings, each as a markdown link using the given /b/... path, with city and rating.
- Site facts you may share: businesses list free and can upgrade at /pricing; buyers post requirements at /leads; advertisers book banners at /advertise; contact details of listings are shown per the listing's plan; WhatsApp chat is open on every listing.
- Never ask for or repeat card details, passwords or OTPs.
- Be warm and brief: 120 words maximum, plain language, no headings.`;
