import Link from "next/link";
import { db } from "@/lib/db";
import { searchBusinesses } from "@/lib/businesses";
import { getCategoryCounts, getCategoryTree } from "@/lib/directory";
import { BusinessTile } from "@/components/BusinessTile";
import { CategoryTiles } from "@/components/CategoryTiles";
import { EventCard } from "@/components/EventCard";
import { NewsCard } from "@/components/NewsCard";
import { HeaderBanner } from "@/components/Banners";
import { FeaturedStrip } from "@/components/FeaturedStrip";
import { AboutGodesi } from "@/components/AboutGodesi";
import { Card } from "@/components/ui";
import { freshNewsCutoff } from "@/lib/news";
import { MemberBubbles } from "@/components/MemberBubbles";
import { SpaSpotlight } from "@/components/SpaSpotlight";
import { ReferEarnTile } from "@/components/ReferEarnTile";
import { MarketplaceTile } from "@/components/MarketplaceTile";
import { ActivityWall } from "@/components/ActivityWall";

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

/** Hero call-to-action chips, newest services included. */
const HERO_ACTIONS: { href: string; label: string }[] = [
  { href: "/events/new", label: "Post an event" },
  { href: "/leads/new", label: "Request a service" },
  { href: "/desi-elite/apply", label: "🏆 Apply for GoDesi Elite" },
  { href: "/live/submit", label: "🎧 Host your radio or TV channel" },
  { href: "/live-radio", label: "🎧 Listen live" },
  { href: "/live-tv", label: "📺 Watch live TV" },
  { href: "/leaderboard", label: "🏅 Top contributors" },
  { href: "/connect", label: "🤝 Meet someone local" },
  { href: "/journalists", label: "🗞️ Become a journalist" },
  { href: "/rewards", label: "🎁 Earn points" },
  { href: "/alumni", label: "🎓 Find batchmates" },
  { href: "/website", label: "🌐 Get a website" },
];

export default async function HomePage() {
  const [
    categories,
    counts,
    businesses,
    events,
    news,
    members,
    memberCount,
    spaCount,
  ] = await Promise.all([
    getCategoryTree(),
    getCategoryCounts(),
    searchBusinesses({ take: 12, sort: "recent" }),
    db.event.findMany({
      where: { status: "APPROVED", startsAt: { gte: new Date() } },
      orderBy: { startsAt: "asc" },
      take: 6,
      include: {
        category: { select: { name: true, icon: true, color: true } },
      },
    }),
    db.newsItem.findMany({
      where: { status: "PUBLISHED", publishedAt: { gte: freshNewsCutoff() } },
      orderBy: { publishedAt: "desc" },
      take: 4,
    }),
    db.user.findMany({
      where: { emailVerifiedAt: { not: null } },
      orderBy: { createdAt: "desc" },
      take: 18,
      select: {
        id: true,
        name: true,
        username: true,
        avatarUrl: true,
        location: true,
      },
    }),
    db.user.count(),
    db.business.count({
      where: {
        status: "APPROVED",
        subcategorySlug: "beauty-lifestyle-spa-and-massage",
      },
    }),
  ]);

  return (
    <div className="space-y-8">
      <HeaderBanner />

      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 via-rose-500 to-fuchsia-600 px-5 py-10 text-white sm:px-10 sm:py-14">
        <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-white/80">
              The desi directory
            </p>
            <h1 className="mt-2 max-w-2xl text-3xl font-black leading-tight sm:text-5xl">
              Find plumbers, pandits, caterers, tutors — and book events near
              you.
            </h1>
            <p className="mt-3 max-w-2xl text-white/90">
              {categories.length} categories,{" "}
              {categories.reduce((s, c) => s + c.children.length, 0)}{" "}
              subcategories, verified listings, buyer requirements, community
              events and daily news.
            </p>

            <form
              action="/search"
              className="mt-6 flex max-w-2xl flex-col gap-2 sm:flex-row"
            >
              <input
                name="q"
                placeholder="What do you need? e.g. electrician, mehndi artist, tiffin"
                className="w-full rounded-xl px-4 py-3 text-sm text-slate-900 outline-none"
                aria-label="Search businesses"
              />
              <input
                name="city"
                placeholder="City"
                className="rounded-xl px-4 py-3 text-sm text-slate-900 outline-none sm:w-40"
                aria-label="City"
              />
              <button
                type="submit"
                className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white hover:bg-slate-800"
              >
                Search
              </button>
            </form>

            <div className="mt-5 flex flex-wrap items-center gap-1.5">
              <Link
                href="/add-business"
                className="rounded-full bg-white px-3.5 py-1.5 text-xs font-bold text-slate-900 hover:bg-slate-100"
              >
                Add your business free
              </Link>
              {HERO_ACTIONS.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="rounded-full border border-white/60 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/10"
                >
                  {action.label}
                </Link>
              ))}
            </div>
          </div>
          <MemberBubbles members={members} total={memberCount} />
        </div>
      </section>

      <FeaturedStrip />

      <div className="space-y-8">
        <section>
          <SectionHeading
            title="Browse by category"
            href="/categories"
            linkLabel="All categories"
          />
          <CategoryTiles
            categories={categories.slice(0, 12)}
            counts={counts}
            dense
          />
        </section>

        <section>
          <SectionHeading
            title="Latest businesses"
            href="/search"
            linkLabel="See all"
          />
          {businesses.length ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
              {businesses.map((business) => (
                <BusinessTile
                  key={business.id}
                  business={business}
                  smallImage
                />
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
                <EventCard key={event.id} event={event} variant="tile" />
              ))}
            </div>
          </section>
        ) : null}

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
            title="More categories"
            href="/categories"
            linkLabel="All categories"
          />
          <CategoryTiles
            categories={categories.slice(12)}
            counts={counts}
            extra={
              <>
                <SpaSpotlight listings={spaCount} />
                <ReferEarnTile />
                <MarketplaceTile />
              </>
            }
            dense
          />
        </section>

        <AboutGodesi />
      </div>
    </div>
  );
}
