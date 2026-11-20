import { headers } from "next/headers";
import { db } from "@/lib/db";

/** Fewer GoDesi results than this and the page shows Google's results too. */
export const WEB_RESULTS_BELOW = 3;

const BOT_UA = /bot|crawl|spider|slurp|preview|fetch|curl|wget|python|headless/i;

/**
 * Remember a search GoDesi couldn't answer well so staff can add the missing
 * businesses. Never throws: a failed write must not break the search page.
 */
export async function recordSearchMiss(input: {
  query: string;
  city?: string;
  page: "search" | "find" | "ask";
  results: number;
}): Promise<void> {
  const query = input.query.trim().toLowerCase().replace(/\s+/g, " ");
  if (query.length < 2 || query.length > 80) return;
  if (BOT_UA.test(headers().get("user-agent") ?? "")) return;
  const city = (input.city ?? "").trim().toLowerCase().slice(0, 60);
  try {
    await db.searchMiss.upsert({
      where: { query_city_page: { query, city, page: input.page } },
      create: { query, city, page: input.page, lastResults: input.results },
      update: {
        count: { increment: 1 },
        lastResults: input.results,
        lastAt: new Date(),
      },
    });
  } catch {
    // Two simultaneous first searches can race on the unique key; one row is enough.
  }
}
