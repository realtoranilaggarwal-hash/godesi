import Link from "next/link";
import { DealCard } from "@/components/DealCard";
import { StoreOfferCard } from "@/components/StoreOfferCard";
import { Card } from "@/components/ui";
import { formatEventDate } from "@/lib/events";
import type { KeywordResults } from "@/lib/keywordSearch";

type Section = "deals" | "events" | "news" | "posts" | "chatter";

/** Deals, coupons, events and stories that mention what the visitor searched. */
export function KeywordMatches({
  term,
  results,
  show,
}: {
  term: string;
  results: KeywordResults;
  show: Section[];
}) {
  const deals = show.includes("deals") ? results.deals : [];
  const offers = show.includes("deals") ? results.storeOffers : [];
  const events = show.includes("events") ? results.events : [];
  const news = show.includes("news") ? results.news : [];
  const posts = show.includes("posts") ? results.posts : [];
  const chatter = show.includes("chatter") ? results.chatter : [];

  return (
    <>
      {chatter.length ? (
        <Card>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-lg font-bold">
              💬 On GoDesi Chatter about “{term}”
            </h2>
            <Link
              href={`/chatter?tag=${encodeURIComponent(term.replace(/^#/, "").toLowerCase())}`}
              className="text-xs font-semibold text-indigo-700 underline"
            >
              See all on Chatter
            </Link>
          </div>
          <ul className="mt-2 divide-y divide-slate-100">
            {chatter.map((post) => (
              <li key={post.id} className="py-2">
                <Link
                  href={`/chatter/${post.id}`}
                  className="text-sm text-slate-800 hover:underline"
                >
                  {post.excerpt}
                </Link>
                <p className="text-xs text-slate-500">— {post.author}</p>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
      {deals.length || offers.length ? (
        <section className="space-y-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-lg font-bold">🏷️ Deals for “{term}”</h2>
            <Link
              href="/dashboard/deals"
              className="text-xs font-semibold text-indigo-700 underline"
            >
              Have a deal? Post it free
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {deals.map((deal) => (
              <DealCard key={deal.id} {...deal} />
            ))}
            {offers.map((offer) => (
              <StoreOfferCard key={offer.id} offer={offer} />
            ))}
          </div>
          {offers.length ? (
            <p className="text-xs text-slate-500">
              🛒 Store coupons are paid links: GoDesi may earn a commission when
              you buy, at no extra cost to you.
            </p>
          ) : null}
        </section>
      ) : null}

      {events.length ? (
        <Card>
          <h2 className="text-lg font-bold">📅 Events for “{term}”</h2>
          <ul className="mt-2 divide-y divide-slate-100">
            {events.map((event) => (
              <li key={event.id} className="py-2">
                <Link
                  href={`/events/${event.slug}`}
                  className="text-sm font-semibold text-indigo-700 hover:underline"
                >
                  {event.title}
                </Link>
                <p className="text-xs text-slate-500">
                  {formatEventDate(event.startsAt, event.timeZone)} ·{" "}
                  {event.city}
                </p>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      {news.length || posts.length ? (
        <Card>
          <h2 className="text-lg font-bold">📰 On GoDesi about “{term}”</h2>
          <ul className="mt-2 divide-y divide-slate-100">
            {news.map((item) => (
              <li key={item.id} className="py-2">
                <Link
                  href={`/news/${item.id}`}
                  className="text-sm font-semibold text-indigo-700 hover:underline"
                >
                  {item.title}
                </Link>
                <p className="text-xs text-slate-500">
                  News · {item.source} ·{" "}
                  {new Date(item.publishedAt).toLocaleDateString("en-US")}
                </p>
              </li>
            ))}
            {posts.map((post) => (
              <li key={post.slug} className="py-2">
                <Link
                  href={`/blog/${post.slug}`}
                  className="text-sm font-semibold text-indigo-700 hover:underline"
                >
                  {post.title}
                </Link>
                <p className="line-clamp-1 text-xs text-slate-500">
                  Blog{post.excerpt ? ` · ${post.excerpt}` : ""}
                </p>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </>
  );
}
