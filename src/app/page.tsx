import Link from "next/link";
import { db } from "@/lib/db";
import { searchBusinesses } from "@/lib/businesses";
import { getCategoryTree } from "@/lib/directory";
import { BusinessTile } from "@/components/BusinessTile";
import { EventCard } from "@/components/EventCard";
import { NewsCard } from "@/components/NewsCard";
import { CategoryFeatured } from "@/components/CategoryFeatured";
import { DjsWikiCard } from "@/components/DjsWikiPromo";
import { AboutGodesi } from "@/components/AboutGodesi";
import { Card } from "@/components/ui";
import { freshNewsCutoff } from "@/lib/news";
import { MemberBubbles } from "@/components/MemberBubbles";
import { SpaSpotlight } from "@/components/SpaSpotlight";
import { ReferEarnTile } from "@/components/ReferEarnTile";
import { WebsiteOfferTile } from "@/components/WebsiteOfferTile";
import { ActivityWall } from "@/components/ActivityWall";
import { CategoryPicker } from "@/components/CategoryPicker";
import { categoryPickerGroups } from "@/components/CategoryNav";
import { publicMemberCount } from "@/lib/membersQueries";
import { HandleClaim } from "@/components/HandleClaim";

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

/** What a claimed name actually gives you, said in four lines. */
const HERO_PROOF: string[] = [
  "Free forever — no card",
  "One name, one page: photo, services, links",
  "QR code for your visiting card",
  "WhatsApp button so customers message you",
];

export default async function HomePage() {
  const [
    categories,
    businesses,
    events,
    news,
    members,
    memberCount,
    spaCount,
  ] = await Promise.all([
    getCategoryTree(),
    searchBusinesses({ take: 6, sort: "recent" }),
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
      take: 44,
      select: {
        id: true,
        name: true,
        username: true,
        avatarUrl: true,
        location: true,
      },
    }),
    publicMemberCount(),
    db.business.count({
      where: {
        status: "APPROVED",
        subcategorySlug: "beauty-lifestyle-spa-and-massage",
      },
    }),
  ]);
  const pickerGroups = await categoryPickerGroups();

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 via-rose-500 to-fuchsia-600 px-5 py-6 text-white sm:px-8 sm:py-8">
        <div className="grid items-center gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/80">
              Free desi page · first come, first served
            </p>
            <h1 className="mt-1 max-w-2xl text-3xl font-black leading-tight sm:text-5xl">
              Get your name:{" "}
              <span className="whitespace-nowrap">godesi.com/you</span>
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-white/90 sm:text-base">
              One short link for everything you do — your work, your shop, your
              WhatsApp, your links. Names go once. Take yours before somebody
              else does.
            </p>

            <div className="mt-4">
              <HandleClaim />
            </div>

            <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-white/90">
              {HERO_PROOF.map((line) => (
                <li key={line}>✓ {line}</li>
              ))}
            </ul>

            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <Link
                href="/add-business"
                className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-900 hover:bg-slate-100"
              >
                Add your business free
              </Link>
              <Link
                href="/why-godesi"
                className="rounded-full border border-white/60 px-3 py-1 text-xs font-semibold text-white hover:bg-white/10"
              >
                Everything you get on GoDesi
              </Link>
              <Link
                href="/people"
                className="rounded-full border border-white/60 px-3 py-1 text-xs font-semibold text-white hover:bg-white/10"
              >
                See members&rsquo; pages
              </Link>
            </div>
          </div>
          <MemberBubbles members={members} total={memberCount} />
        </div>
      </section>

      {/* One bold box instead of a wall of category tiles: the whole taxonomy
          is one click down, and nothing else competes with it. */}
      <section className="rounded-3xl border-2 border-slate-900 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-black">
            Looking for someone? Pick a service 👇
          </h2>
          <Link
            href="/categories"
            className="text-sm font-semibold text-indigo-600 hover:underline"
          >
            All {categories.length} categories →
          </Link>
        </div>
        <CategoryPicker
          groups={pickerGroups}
          quickCount={10}
          label={`Open the full list — ${categories.reduce((sum, category) => sum + category.children.length, 0)} services`}
          big
        />
      </section>

      <CategoryFeatured />

      <DjsWikiCard />

      <div className="space-y-8">
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
                <EventCard key={event.id} event={event} variant="tile" />
              ))}
            </div>
          </section>
        ) : null}

        <AboutGodesi />
      </div>
    </div>
  );
}
