import Link from "next/link";
import { db } from "@/lib/db";
import { searchBusinesses } from "@/lib/businesses";
import { BusinessTile } from "@/components/BusinessTile";
import { EventCard } from "@/components/EventCard";
import { NewsCard } from "@/components/NewsCard";
import { CategoryFeatured } from "@/components/CategoryFeatured";
import { CategoryTree } from "@/components/CategoryTree";
import { SmallBanners } from "@/components/Banners";
import { DjsWikiCard } from "@/components/DjsWikiPromo";
import { AboutGodesi } from "@/components/AboutGodesi";
import { Card } from "@/components/ui";
import { freshNewsCutoff } from "@/lib/news";
import { SpaSpotlight } from "@/components/SpaSpotlight";
import { ReferEarnTile } from "@/components/ReferEarnTile";
import { WebsiteOfferTile } from "@/components/WebsiteOfferTile";
import { ActivityWall } from "@/components/ActivityWall";
import { categoryPickerGroups } from "@/components/CategoryNav";
import { MarketTape } from "@/components/MarketTape";
import { DailyStars } from "@/components/DailyStars";
import { planRank } from "@/lib/plans";
import { newestMembers } from "@/lib/membersQueries";
import { MemberTile } from "@/components/MemberTile";
import { RecentStrip } from "@/components/RecentStrip";
import { DealsStrip } from "@/components/DealsStrip";
import { CONTENT_TTL, cachedQuery } from "@/lib/cache";
import { DealOfTheDayBar } from "@/components/DealOfTheDay";
import { PanchangCard } from "@/components/PanchangCard";
import { ChatterHomeBox } from "@/components/chatter/ChatterHomeBox";
import { RishtaHomeBox } from "@/components/RishtaHomeBox";
import { visitorPanchang } from "@/lib/panchangGeo";

export const dynamic = "force-dynamic";

function SectionHeading({
  title,
  href,
  linkLabel,
}: {
  title: string;
  href: string;
  linkLabel: string;
}) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 className="text-xl font-black">{title}</h2>
      <Link
        href={href}
        className="text-sm font-semibold text-indigo-600 hover:underline"
      >
        {linkLabel} →
      </Link>
    </div>
  );
}

/** Every visitor (and crawler) sees the same shelves, so they are read once a minute. */
const homeEvents = cachedQuery("home-events", CONTENT_TTL, () =>
  db.event.findMany({
    where: { status: "APPROVED", startsAt: { gte: new Date() } },
    orderBy: { startsAt: "asc" },
    take: 24,
    include: {
      category: { select: { name: true, icon: true, color: true } },
      tiers: { select: { price: true } },
      organizer: { select: { plan: true } },
    },
  }),
);

const homeNews = cachedQuery("home-news", CONTENT_TTL, () =>
  db.newsItem.findMany({
    where: { status: "PUBLISHED", publishedAt: { gte: freshNewsCutoff() } },
    orderBy: { publishedAt: "desc" },
    take: 4,
  }),
);

const homeSpaCount = cachedQuery("home-spa-count", CONTENT_TTL, () =>
  db.business.count({
    where: {
      status: "APPROVED",
      subcategorySlug: "beauty-lifestyle-spa-and-massage",
    },
  }),
);

const homeMembers = cachedQuery("home-members", CONTENT_TTL, () =>
  newestMembers(12, { withPage: true }),
);

/** Free public crypto Fear & Greed index (alternative.me), refetched every 30 min. */
const cryptoFearGreed = cachedQuery("crypto-fng", 1800, async () => {
  try {
    const res = await fetch("https://api.alternative.me/fng/?limit=1", {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    const row = (await res.json())?.data?.[0];
    return row
      ? { value: String(row.value), label: String(row.value_classification) }
      : null;
  } catch {
    return null;
  }
});

export default async function HomePage() {
  const [businesses, eventRows, newsRows, spaCount, memberRows, fng] =
    await Promise.all([
      searchBusinesses({ take: 8, sort: "recent" }),
      homeEvents(),
      homeNews(),
      homeSpaCount(),
      homeMembers(),
      cryptoFearGreed(),
    ]);
  // Cached rows come back JSON-serialised, so dates are strings again.
  const upcoming = eventRows.map((event) => ({
    ...event,
    startsAt: new Date(event.startsAt),
    endsAt: event.endsAt ? new Date(event.endsAt) : null,
  }));
  const news = newsRows.map((item) => ({
    ...item,
    publishedAt: new Date(item.publishedAt),
  }));
  const newMembers = memberRows.map((member) => ({
    ...member,
    createdAt: new Date(member.createdAt),
  }));
  const pickerGroups = await categoryPickerGroups();
  const today = visitorPanchang();
  const isFeaturedEvent = (event: (typeof upcoming)[number]) =>
    event.featured || planRank(event.organizer.plan) > 0;
  const events = [...upcoming]
    .sort((a, b) => Number(isFeaturedEvent(b)) - Number(isFeaturedEvent(a)))
    .slice(0, 6);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-3">
          <RecentStrip />

          <ChatterHomeBox />

          <section className="overflow-hidden rounded-3xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-amber-50 px-4 py-4 text-slate-900 shadow-sm sm:px-5">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-baseline gap-3">
                <h1 className="text-sm font-medium text-slate-600">
                  📈 Markets today · live
                </h1>
                <Link
                  href="/markets"
                  className="text-xs font-medium text-indigo-600 underline hover:text-indigo-800"
                >
                  Full markets page →
                </Link>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <Link
                  href="/claim"
                  className="rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white hover:bg-slate-700"
                >
                  Claim godesi.com/yourname
                </Link>
                <Link
                  href="/travel"
                  className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
                >
                  ✈️ Travel deals
                </Link>
                <Link
                  href="/games"
                  className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
                >
                  🎮 Games
                </Link>
                {fng ? (
                  <Link
                    href="/crypto-fear-greed"
                    className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
                  >
                    😬 Crypto mood: {fng.value} · {fng.label}
                  </Link>
                ) : null}
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-1">
              <MarketTape />
            </div>
            {today.panchang ? (
              <div className="mt-3">
                <DailyStars
                  panchang={today.panchang}
                  place={today.label}
                />
              </div>
            ) : null}
          </section>

          <div className="grid gap-3 lg:grid-cols-2 [&>*]:min-w-0">
            <DealOfTheDayBar />
            {today.panchang ? (
              <PanchangCard
                panchang={today.panchang}
                place={today.label}
                compact
              />
            ) : null}
          </div>
        </div>
        <aside className="relative hidden xl:block">
          <div className="absolute inset-0 overflow-y-auto">
            <CategoryTree groups={pickerGroups} />
          </div>
        </aside>
      </div>

      {newMembers.length ? (
        <section>
          <SectionHeading
            title="Newest members 👋"
            href="/people"
            linkLabel="All members"
          />
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {newMembers.map((member, index) => (
              <div
                key={member.id}
                className={index >= 6 ? "hidden sm:block" : ""}
              >
                <MemberTile member={member} compact />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <RishtaHomeBox />

      <DealsStrip />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <CategoryFeatured />
        <aside className="relative hidden xl:block">
          <div className="absolute inset-0">
            <SmallBanners embedded fill tree={false} show={5} />
          </div>
        </aside>
      </div>

      <div className="space-y-8">
        <div className="grid gap-3 lg:grid-cols-2 [&>*]:min-w-0">
          <DjsWikiCard />
          <section className="flex flex-col justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
            <p>
              <span className="font-bold">
                ⚠️ Mouldy sweets, kept deposit, unpaid wages?
              </span>{" "}
              Step-by-step: who to call and what to photograph — US &amp;
              Canada.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/complaints"
                className="rounded-xl bg-rose-600 px-3 py-1.5 font-bold text-white hover:bg-rose-700"
              >
                How to file a complaint
              </Link>
              <Link
                href="/news/report?topic=consumer"
                className="rounded-xl border border-rose-300 bg-white px-3 py-1.5 font-bold text-rose-700 hover:bg-rose-100"
              >
                Post a consumer alert
              </Link>
            </div>
          </section>
        </div>
        <div className="grid gap-6 lg:grid-cols-3 [&>*]:min-w-0">
          {news.length ? (
            <section className="lg:col-span-2">
              <SectionHeading
                title="Desi news 📰"
                href="/news"
                linkLabel="All news"
              />
              <p className="mb-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
                🗞️ Are you a journalist, or have news to share? Post it and your
                story shows right here.{" "}
                <Link href="/news/report" className="font-bold underline">
                  Share news
                </Link>{" "}
                ·{" "}
                <Link href="/journalists" className="font-bold underline">
                  Become a journalist
                </Link>
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {news.map((item) => (
                  <NewsCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          ) : null}

          <ActivityWall
            limit={16}
            className={news.length ? "" : "lg:col-span-3"}
          />
        </div>

        <section>
          <SectionHeading
            title="Latest businesses"
            href="/search"
            linkLabel="See all"
          />
          {businesses.length ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {businesses.map((business) => (
                <BusinessTile key={business.id} business={business} />
              ))}
            </div>
          ) : (
            <Card>
              <p className="text-sm text-slate-600">
                No approved listings yet.{" "}
                <Link href="/signup" className="font-semibold text-indigo-600">
                  Be the first to create one.
                </Link>
              </p>
            </Card>
          )}
        </section>

        <div className="grid gap-3 sm:grid-cols-3">
          <SpaSpotlight listings={spaCount} />
          <ReferEarnTile />
          <WebsiteOfferTile />
        </div>

        <Card className="border-amber-200 bg-gradient-to-br from-amber-50 via-white to-rose-50">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-slate-900">
                🏆 GoDesi Elite
              </h2>
              <p className="text-sm text-slate-700">
                Recognition for desi founders, professionals and community
                leaders — apply or nominate someone who deserves it.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/desi-elite"
                className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-bold text-white"
              >
                Elite directory
              </Link>
              <Link
                href="/desi-elite/apply"
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-800"
              >
                Apply for GoDesi Elite
              </Link>
            </div>
          </div>
        </Card>

        {events.length ? (
          <section>
            <SectionHeading
              title="Upcoming events 🎟️"
              href="/events"
              linkLabel="All events"
            />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
              {events.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  variant="tile"
                  featured={isFeaturedEvent(event)}
                />
              ))}
            </div>
          </section>
        ) : null}

        <AboutGodesi />
      </div>
    </div>
  );
}
