import Link from "next/link";
import { db } from "@/lib/db";
import { searchBusinesses } from "@/lib/businesses";
import { getCategoryCounts, getCategoryTree } from "@/lib/directory";
import { BusinessCard } from "@/components/BusinessCard";
import { CategoryTiles } from "@/components/CategoryTiles";
import { EventCard } from "@/components/EventCard";
import { NewsCard } from "@/components/NewsCard";
import { HeaderBanner, SidebarBanners } from "@/components/Banners";
import { Card, LinkButton } from "@/components/ui";

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
      <Link href={href} className="text-sm font-semibold text-indigo-600 hover:underline">
        {linkLabel} →
      </Link>
    </div>
  );
}

export default async function HomePage() {
  const [categories, counts, businesses, events, news] = await Promise.all([
    getCategoryTree(),
    getCategoryCounts(),
    searchBusinesses({ take: 6 }),
    db.event.findMany({
      where: { status: "APPROVED", startsAt: { gte: new Date() } },
      orderBy: { startsAt: "asc" },
      take: 3,
      include: { category: { select: { name: true, icon: true, color: true } } },
    }),
    db.newsItem.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 4,
    }),
  ]);

  return (
    <div className="space-y-8">
      <HeaderBanner />

      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 via-rose-500 to-fuchsia-600 px-5 py-10 text-white sm:px-10 sm:py-14">
        <p className="text-sm font-semibold uppercase tracking-widest text-white/80">
          The desi directory
        </p>
        <h1 className="mt-2 max-w-2xl text-3xl font-black leading-tight sm:text-5xl">
          Find plumbers, pandits, caterers, tutors — and book events near you.
        </h1>
        <p className="mt-3 max-w-2xl text-white/90">
          {categories.length} categories, {categories.reduce((s, c) => s + c.children.length, 0)}{" "}
          subcategories, verified listings, buyer requirements, community events and daily news.
        </p>

        <form action="/search" className="mt-6 flex max-w-2xl flex-col gap-2 sm:flex-row">
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

        <div className="mt-6 flex flex-wrap gap-2">
          <LinkButton href="/add-business" variant="secondary">
            Add your business free
          </LinkButton>
          <Link
            href="/events/new"
            className="rounded-xl border border-white/70 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
          >
            Post an event
          </Link>
          <Link
            href="/leads/new"
            className="rounded-xl border border-white/70 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
          >
            Request a service
          </Link>
        </div>
      </section>

      <div className="flex gap-6">
        <div className="min-w-0 flex-1 space-y-8">
          <section>
            <SectionHeading title="Browse by category" href="/categories" linkLabel="All categories" />
            <CategoryTiles categories={categories.slice(0, 6)} counts={counts} />
          </section>

          <section>
            <SectionHeading title="Featured businesses" href="/search" linkLabel="See all" />
            {businesses.length ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {businesses.map((business) => (
                  <BusinessCard key={business.id} business={business} />
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

          {events.length ? (
            <section>
              <SectionHeading title="Upcoming events 🎟️" href="/events" linkLabel="All events" />
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {events.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </section>
          ) : null}

          {news.length ? (
            <section>
              <SectionHeading title="Desi news 📰" href="/news" linkLabel="All news" />
              <div className="grid gap-3 sm:grid-cols-2">
                {news.map((item) => (
                  <NewsCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          ) : null}

          <section>
            <SectionHeading title="More categories" href="/categories" linkLabel="All categories" />
            <CategoryTiles categories={categories.slice(6)} counts={counts} />
          </section>
        </div>

        <SidebarBanners />
      </div>
    </div>
  );
}
