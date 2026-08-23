import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { gradientFor } from "@/lib/categories";
import {
  WEDDING_GROUPS,
  WEDDING_SLUG,
  weddingServiceName,
  weddingServiceSlug,
} from "@/lib/wedding";
import {
  featuredWeddingVendors,
  weddingCities,
  weddingServiceCounts,
  weddingVendors,
} from "@/lib/weddingQueries";
import { VendorCard } from "@/components/VendorCard";
import { RecommendedLinks } from "@/components/RecommendedLinks";
import { InlineBanner, SidebarBanners } from "@/components/Banners";
import { DjsWikiCard } from "@/components/DjsWikiPromo";
import { HiringChecklist, NeedHelpBox } from "@/components/NeedHelp";
import { Card, EmptyState, LinkButton, inputClass } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Wedding services marketplace",
  description:
    "Wedding planners, photographers, makeup and mehndi artists, DJs, caterers, decorators, mandap, venues, pandits and invitations — compare desi vendors, packages, photos and reviews, then chat on WhatsApp.",
};

const RATINGS = [
  { value: "", label: "Any rating" },
  { value: "4", label: "4★ & up" },
  { value: "3", label: "3★ & up" },
];

const BUDGETS = [
  { value: "", label: "Any budget" },
  { value: "500", label: "Up to 500" },
  { value: "1000", label: "Up to 1,000" },
  { value: "2500", label: "Up to 2,500" },
  { value: "5000", label: "Up to 5,000" },
  { value: "10000", label: "Up to 10,000" },
];

export default async function WeddingPage({
  searchParams,
}: {
  searchParams: {
    city?: string;
    service?: string;
    rating?: string;
    budget?: string;
    q?: string;
  };
}) {
  const { city, service, rating, budget, q } = searchParams;

  const [vendors, featured, requirements, serviceCounts, cities] =
    await Promise.all([
      weddingVendors({
        service,
        city,
        q,
        minRating: rating ? Number(rating) : undefined,
        budget: budget ? Number(budget) : undefined,
      }),
      featuredWeddingVendors(8),
      db.lead.findMany({
        where: {
          status: "OPEN",
          category: { contains: "wedding", mode: "insensitive" },
        },
        orderBy: { createdAt: "desc" },
        take: 3,
        select: { id: true, title: true, city: true, eventDate: true },
      }),
      weddingServiceCounts(),
      weddingCities(),
    ]);

  const activeName = service ? weddingServiceName(service) : undefined;

  return (
    <div className="flex gap-6">
      <div className="min-w-0 flex-1 space-y-6">
        <section
          className={`rounded-3xl bg-gradient-to-r ${gradientFor("rose")} px-5 py-8 text-white sm:px-8`}
        >
          <h1 className="text-3xl font-black">Wedding services 💐</h1>
          <p className="mt-1 max-w-xl text-white/90">
            Planners, photographers, makeup and mehndi artists, DJs, dhol,
            caterers, decorators, mandap, venues, pandits, cars and invitations
            — see photos, packages and prices, then message the vendor on
            WhatsApp.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <LinkButton href="/wedding/requirements/new" variant="secondary">
              Post your wedding requirement
            </LinkButton>
            <Link
              href="/dashboard/profile?category=events-wedding"
              className="rounded-xl border border-white/70 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
            >
              Add your wedding business
            </Link>
          </div>
        </section>

        {/* Say what you need, get quotes back — the shortest route for a couple
            who does not want to browse vendor by vendor. */}
        <Card className="border-rose-200 bg-gradient-to-br from-rose-50 via-white to-amber-50">
          <h2 className="text-center text-lg font-black text-slate-900">
            Express your wedding needs and explore everything you want 💐
          </h2>
          <form
            action="/wedding/requirements/new"
            className="mt-3 flex flex-col gap-2 sm:flex-row sm:justify-center"
          >
            <input
              name="city"
              defaultValue={city ?? ""}
              placeholder="City, state"
              aria-label="Your city"
              className={`${inputClass} sm:w-52`}
            />
            <select
              name="service"
              defaultValue={service ?? ""}
              aria-label="Service you need"
              className={`${inputClass} sm:w-64`}
            >
              <option value="">Enter a service</option>
              {WEDDING_GROUPS.map((group) => (
                <optgroup key={group.title} label={group.title}>
                  {group.items.map((item) => (
                    <option key={item} value={weddingServiceSlug(item)}>
                      {item}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <button
              type="submit"
              className="rounded-xl bg-rose-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-rose-700"
            >
              Get quotes
            </button>
          </form>
          <p className="mt-2 text-center text-xs text-slate-500">
            e.g. wedding decorators, wedding florists &amp; decor, wedding
            invitations
          </p>
        </Card>

        {featured.length ? (
          <section aria-label="Featured wedding vendors">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-lg font-black text-slate-900">
                ⭐ Featured vendors
              </h2>
              <Link
                href="/pricing"
                className="text-sm font-semibold text-rose-600 hover:underline"
              >
                Feature your business →
              </Link>
            </div>
            <div className="no-scrollbar mt-3 flex gap-4 overflow-x-auto pb-2">
              {featured.map((vendor) => (
                <div key={vendor.id} className="w-64 shrink-0">
                  <VendorCard vendor={vendor} />
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <DjsWikiCard />

        {/* One tile per service with its own live count, the way a shopper
            expects to pick a trade — not a wall of small chips. */}
        <section aria-label="Browse wedding services" className="space-y-4">
          <h2 className="text-lg font-black text-slate-900">
            Browse every wedding service
          </h2>
          {WEDDING_GROUPS.map((group) => (
            <div key={group.title}>
              <p className="text-sm font-black text-rose-900">
                {group.icon} {group.title}
              </p>
              <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {group.items.map((item) => {
                  const slug = weddingServiceSlug(item);
                  const active = service === slug;
                  const count = serviceCounts.get(slug) ?? 0;
                  return (
                    <Link
                      key={slug}
                      href={`/wedding?service=${slug}${
                        city ? `&city=${encodeURIComponent(city)}` : ""
                      }`}
                      className={`rounded-2xl border p-3 text-center transition ${
                        active
                          ? "border-rose-600 bg-rose-600 text-white"
                          : "border-rose-100 bg-white hover:border-rose-300 hover:bg-rose-50"
                      }`}
                    >
                      <span className="block text-2xl leading-none">
                        {group.icon}
                      </span>
                      <span className="mt-2 block text-sm font-bold leading-tight">
                        {item}
                      </span>
                      <span
                        className={`mt-1 block text-xs ${
                          active ? "text-white/80" : "text-slate-500"
                        }`}
                      >
                        {count
                          ? `${count} ${count === 1 ? "business" : "businesses"} available`
                          : "Be the first to list"}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </section>

        <Card>
          <form className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <input
              name="q"
              defaultValue={q ?? ""}
              placeholder="Vendor or keyword"
              aria-label="Search wedding vendors"
              className={inputClass}
            />
            <input
              name="city"
              defaultValue={city ?? ""}
              placeholder="City"
              aria-label="City"
              className={inputClass}
            />
            <select
              name="service"
              defaultValue={service ?? ""}
              aria-label="Service"
              className={inputClass}
            >
              <option value="">All wedding services</option>
              {WEDDING_GROUPS.map((group) => (
                <optgroup key={group.title} label={group.title}>
                  {group.items.map((item) => (
                    <option key={item} value={weddingServiceSlug(item)}>
                      {item}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <select
              name="budget"
              defaultValue={budget ?? ""}
              aria-label="Budget"
              className={inputClass}
            >
              {BUDGETS.map((option) => (
                <option key={option.label} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <select
                name="rating"
                defaultValue={rating ?? ""}
                aria-label="Rating"
                className={inputClass}
              >
                {RATINGS.map((option) => (
                  <option key={option.label} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-700"
              >
                Search
              </button>
            </div>
          </form>
        </Card>

        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-lg font-black text-slate-900">
            {activeName ?? "All wedding vendors"}
            <span className="ml-2 text-sm font-semibold text-slate-500">
              {vendors.length} listed
            </span>
          </h2>
          {service || city || rating || budget || q ? (
            <Link
              href="/wedding"
              className="text-sm font-semibold text-slate-500 hover:underline"
            >
              Clear filters
            </Link>
          ) : null}
        </div>

        {vendors.length ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {vendors.map((vendor) => (
              <VendorCard key={vendor.id} vendor={vendor} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No vendors here yet"
            body="Are you a wedding vendor? List your services free, add your photos and packages, and start receiving shaadi enquiries on WhatsApp."
          />
        )}

        <section className="rounded-2xl border border-rose-200 bg-white p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="text-lg font-black text-slate-900">
              💍 Wedding requirements from couples
            </h2>
            <Link
              href="/wedding/requirements"
              className="text-sm font-semibold text-rose-600 hover:underline"
            >
              See all requirements →
            </Link>
          </div>
          {requirements.length ? (
            <ul className="mt-3 space-y-2">
              {requirements.map((lead) => (
                <li key={lead.id} className="text-sm text-slate-700">
                  <Link
                    href="/wedding/requirements"
                    className="font-semibold hover:text-rose-600"
                  >
                    {lead.title}
                  </Link>{" "}
                  <span className="text-slate-500">
                    · {lead.city}
                    {lead.eventDate
                      ? ` · ${lead.eventDate.toLocaleDateString()}`
                      : ""}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-slate-600">
              No open requirements right now — post yours and vendors will reach
              out.
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <LinkButton href="/wedding/requirements/new">
              Post your wedding requirement
            </LinkButton>
            <Link
              href="/dashboard/profile?category=events-wedding"
              className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold hover:bg-slate-50"
            >
              Add your wedding business
            </Link>
          </div>
        </section>

        {cities.length ? (
          <section aria-label="Wedding vendors by city">
            <h2 className="text-lg font-black text-slate-900">
              Vendors by city
            </h2>
            <div className="mt-2 grid grid-cols-2 gap-1 text-sm sm:grid-cols-3 lg:grid-cols-4">
              {cities.map((row) => (
                <Link
                  key={`${row.city}-${row.state ?? ""}`}
                  href={`/wedding?city=${encodeURIComponent(row.city)}${
                    service ? `&service=${service}` : ""
                  }`}
                  className="truncate text-slate-600 hover:text-rose-600 hover:underline"
                >
                  {row.city}
                  {row.state ? `, ${row.state}` : ""} · {row.count}
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        <RecommendedLinks
          categorySlug={service ?? WEDDING_SLUG}
          title="Recommended wedding links"
        />

        <HiringChecklist />

        <InlineBanner />
      </div>

      <aside className="hidden w-[260px] shrink-0 space-y-4 lg:order-first lg:block">
        <NeedHelpBox />
        <SidebarBanners />
      </aside>
    </div>
  );
}
