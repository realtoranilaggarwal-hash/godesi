/**
 * IndexNow tells Bing, Yandex, Seznam, Naver and Yep about new or changed pages
 * the moment they appear, instead of waiting for a crawl. The key is public by
 * design: it is served from /<key>.txt so the engines can verify we own the
 * domain. Google does not take IndexNow — it reads the sitemap in robots.txt.
 */
import { db } from "@/lib/db";
import { newsPath } from "@/lib/newsLinks";

export const INDEXNOW_KEY = "d1c3c0ca36429eaba3ccfe190f8eea6d";

const ENDPOINT = "https://api.indexnow.org/indexnow";
const HOST = "godesi.com";

/**
 * Streams a single page the moment it is published or edited. Search engines
 * prefer this to batching the whole sitemap: the change is indexed sooner and
 * neither side gets a burst of traffic.
 */
export async function pingIndexNow(path: string) {
  const url = path.startsWith("http") ? path : `https://${HOST}${path}`;
  if (!url.startsWith(`https://${HOST}`)) return;
  const endpoint = `${ENDPOINT}?url=${encodeURIComponent(url)}&key=${INDEXNOW_KEY}&keyLocation=${encodeURIComponent(
    `https://${HOST}/${INDEXNOW_KEY}.txt`,
  )}`;
  try {
    await fetch(endpoint, { cache: "no-store" });
  } catch {
    // Indexing is best-effort; never fail the member's save because of it.
  }
}

/** Fire-and-forget variant for server actions that must not wait on the network. */
export function pingIndexNowInBackground(path: string) {
  void pingIndexNow(path);
}

/**
 * Safety net for anything a publish hook missed: streams only the pages that
 * changed since the last run, one at a time, instead of resubmitting the whole
 * sitemap in one batch.
 */
export async function streamRecentChanges(since: Date) {
  const [businesses, listings, events, worship, elite, posts, reports] =
    await Promise.all([
      db.business.findMany({
        where: { status: "APPROVED", updatedAt: { gte: since } },
        select: { slug: true },
      }),
      db.listing.findMany({
        where: { status: "APPROVED", updatedAt: { gte: since } },
        select: { slug: true },
      }),
      db.event.findMany({
        where: { status: "APPROVED", updatedAt: { gte: since } },
        select: { slug: true },
      }),
      db.worshipPlace.findMany({
        where: { status: "APPROVED", updatedAt: { gte: since } },
        select: { slug: true },
      }),
      db.eliteEntry.findMany({
        where: { status: "PUBLISHED", updatedAt: { gte: since } },
        select: { slug: true },
      }),
      db.blogPost.findMany({
        where: { published: true, updatedAt: { gte: since } },
        select: { slug: true },
      }),
      db.newsItem.findMany({
        where: {
          status: "PUBLISHED",
          submittedById: { not: null },
          publishedAt: { gte: since },
        },
        select: { id: true, title: true },
      }),
    ]);

  const paths = [
    ...businesses.map((row) => `/b/${row.slug}`),
    ...listings.map((row) => `/listings/${row.slug}`),
    ...events.map((row) => `/events/${row.slug}`),
    ...worship.map((row) => `/religious/${row.slug}`),
    ...elite.map((row) => `/desi-elite/${row.slug}`),
    ...posts.map((row) => `/blog/${row.slug}`),
    ...reports.map((row) => newsPath(row)),
  ];

  for (const path of paths) await pingIndexNow(path);
  return { submitted: paths.length };
}
