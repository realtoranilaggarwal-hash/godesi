import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { gradientFor } from "@/lib/categories";
import {
  WEDDING_GROUPS,
  WEDDING_SLUG,
  featuredWeddingVendors,
  weddingServiceName,
  weddingServiceSlug,
  weddingVendors,
} from "@/lib/wedding";
import { VendorCard } from "@/components/VendorCard";
import { RecommendedLinks } from "@/components/RecommendedLinks";
import { InlineBanner, SidebarBanners } from "@/components/Banners";
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

  const [vendors, featured, requirements] = await Promise.all([
    weddingVendors({
      service,
      city,
      q,
      minRating: rating ? Number(rating) : undefined,
      budget: budget ? Number(budget) : undefined,
    }),
    featuredWeddingVendors(8),
    db.lead.findMany({
      where: { status: "OPEN", category: { contains: "wedding", mode: "insensitive" } },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { id: true, title: true, city: true, eventDate: true },
    }),
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
            Planners, photographers, makeup and mehndi artists, DJs, dhol, caterers,
            decorators, mandap, venues, pandits, cars and invitations — see photos,
            packages and prices, then message the vendor on WhatsApp.
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

        <section aria-label="Browse wedding services" className="space-y-3">
          <h2 className="text-lg font-black text-slate-900">Browse by service</h2>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {WEDDING_GROUPS.map((group) => (
              <div
                key={group.title}
                className="rounded-2xl border border-rose-100 bg-rose-50/50 p-3"
              >
                <p className="text-sm font-black text-rose-900">
                  {group.icon} {group.title}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {group.items.map((item) => {
                    const slug = weddingServiceSlug(item);
                    const active = service === slug;
                    return (
                      <Link
                        key={slug}
                        href={`/wedding?service=${slug}${
                          city ? `&city=${encodeURIComponent(city)}` : ""
                        }`}
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          active
                            ? "bg-rose-600 text-white"
                            : "border border-rose-200 bg-white text-rose-700 hover:bg-rose-100"
                        }`}
                      >
                        {item}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
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
              No open requirements right now — post yours and vendors will reach out.
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
