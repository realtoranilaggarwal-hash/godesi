import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { getCategoryTree } from "@/lib/directory";
import { EventCard } from "@/components/EventCard";
import { InlineBanner, SidebarBanners } from "@/components/Banners";
import { Card, EmptyState, LinkButton, inputClass } from "@/components/ui";
import { gradientFor } from "@/lib/categories";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Events & tickets",
  description:
    "Melas, workshops, weddings expos, satsangs and community events near you — book tickets instantly.",
};

export default async function EventsPage({
  searchParams,
}: {
  searchParams: { city?: string; category?: string; when?: string };
}) {
  const { city, category, when } = searchParams;
  const categories = await getCategoryTree();
  const scope = category
    ? [
        category,
        ...(categories.find((item) => item.slug === category)?.children.map((c) => c.slug) ?? []),
      ]
    : undefined;

  const events = await db.event.findMany({
    where: {
      status: "APPROVED",
      ...(when === "past" ? { startsAt: { lt: new Date() } } : { startsAt: { gte: new Date() } }),
      ...(city ? { city: { contains: city, mode: "insensitive" } } : {}),
      ...(scope ? { categorySlug: { in: scope } } : {}),
    },
    orderBy: { startsAt: when === "past" ? "desc" : "asc" },
    take: 48,
    include: { category: { select: { name: true, icon: true, color: true } } },
  });

  return (
    <div className="flex gap-6">
      <div className="min-w-0 flex-1 space-y-6">
        <section
          className={`rounded-3xl bg-gradient-to-r ${gradientFor("rose")} px-5 py-8 text-white sm:px-8`}
        >
          <h1 className="text-3xl font-black">Events & tickets 🎟️</h1>
          <p className="mt-1 max-w-xl text-white/90">
            Melas, workshops, expos, satsangs and weddings — book a seat in seconds and get a
            QR ticket on your phone.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <LinkButton href="/events/new" variant="secondary">
              Post your event
            </LinkButton>
            <Link
              href={when === "past" ? "/events" : "/events?when=past"}
              className="rounded-xl border border-white/70 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
            >
              {when === "past" ? "Upcoming events" : "Past events"}
            </Link>
          </div>
        </section>

        <Card>
          <form className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
            <input
              name="city"
              defaultValue={city ?? ""}
              placeholder="City"
              className={inputClass}
              aria-label="City"
            />
            <select
              name="category"
              defaultValue={category ?? ""}
              className={inputClass}
              aria-label="Category"
            >
              <option value="">All categories</option>
              {categories.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.icon} {item.name}
                </option>
              ))}
            </select>
            {when ? <input type="hidden" name="when" value={when} /> : null}
            <button
              type="submit"
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Filter
            </button>
          </form>
        </Card>

        {events.length ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No events here yet"
            body="Be the first to list one — posting an event is free."
          />
        )}

        <p className="text-sm text-slate-500">
          Organising something?{" "}
          <Link href="/events/new" className="font-semibold text-indigo-600">
            Publish your event
          </Link>{" "}
          and sell tickets with QR check-in.
        </p>
      <InlineBanner />
      </div>

      <SidebarBanners />
    </div>
  );
}
