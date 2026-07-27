import type { Metadata } from "next";
import Link from "next/link";
import { CATEGORY_TREE, gradientFor, subcategorySlug } from "@/lib/categories";
import { searchBusinesses } from "@/lib/businesses";
import { BusinessCard } from "@/components/BusinessCard";
import { InlineBanner, SidebarBanners } from "@/components/Banners";
import { Card, EmptyState, LinkButton, inputClass } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Wedding services marketplace",
  description:
    "Wedding planners, photographers, makeup artists, DJs, caterers, decorators, venues, bridal wear and jewellery — compare desi vendors, packages and reviews.",
};

const WEDDING_SLUG = "events-wedding";

const weddingCategory = CATEGORY_TREE.find((category) => category.slug === WEDDING_SLUG);

export default async function WeddingPage({
  searchParams,
}: {
  searchParams: { city?: string; service?: string };
}) {
  const { city, service } = searchParams;
  const children = weddingCategory?.children ?? [];
  const scope = service
    ? [service]
    : [WEDDING_SLUG, ...children.map((child) => subcategorySlug(WEDDING_SLUG, child))];

  const vendors = await searchBusinesses({ categorySlugs: scope, city, take: 48 });

  return (
    <div className="flex gap-6">
      <div className="min-w-0 flex-1 space-y-6">
        <section
          className={`rounded-3xl bg-gradient-to-r ${gradientFor("rose")} px-5 py-8 text-white sm:px-8`}
        >
          <h1 className="text-3xl font-black">Wedding services 💐</h1>
          <p className="mt-1 max-w-xl text-white/90">
            Planners, photographers, makeup artists, DJs, caterers, decorators, venues,
            bridal wear and jewellery — all in one shaadi marketplace.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <LinkButton href="/leads/new?category=events-wedding" variant="secondary">
              Post your wedding requirement
            </LinkButton>
            <Link
              href="/dashboard/profile"
              className="rounded-xl border border-white/70 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
            >
              List as a vendor
            </Link>
          </div>
        </section>

        <div className="flex flex-wrap gap-2">
          {children.map((child) => {
            const slug = subcategorySlug(WEDDING_SLUG, child);
            const active = service === slug;
            return (
              <Link
                key={slug}
                href={`/wedding?service=${slug}${city ? `&city=${encodeURIComponent(city)}` : ""}`}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  active
                    ? "bg-rose-600 text-white"
                    : "border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
                }`}
              >
                {child}
              </Link>
            );
          })}
          {service ? (
            <Link
              href="/wedding"
              className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Clear
            </Link>
          ) : null}
        </div>

        <Card>
          <form className="grid gap-3 sm:grid-cols-[1fr_auto]">
            {service ? <input type="hidden" name="service" value={service} /> : null}
            <input
              name="city"
              defaultValue={city ?? ""}
              placeholder="City"
              aria-label="City"
              className={inputClass}
            />
            <button
              type="submit"
              className="rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-700"
            >
              Find vendors
            </button>
          </form>
        </Card>

        {vendors.length ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {vendors.map((vendor) => (
              <BusinessCard key={vendor.id} business={vendor} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No vendors listed here yet"
            body="Are you a wedding vendor? List your services free and start receiving shaadi enquiries."
          />
        )}
      <InlineBanner />
      </div>

      <SidebarBanners />
    </div>
  );
}
