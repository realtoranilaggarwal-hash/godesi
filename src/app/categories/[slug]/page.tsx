import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getCategory, categoryScopeSlugs } from "@/lib/directory";
import { searchBusinesses } from "@/lib/businesses";
import { FeaturedStrip } from "@/components/FeaturedStrip";
import { gradientFor, softFor } from "@/lib/categories";
import { guideFor } from "@/lib/categoryGuides";
import { BusinessCard } from "@/components/BusinessCard";
import { EventCard } from "@/components/EventCard";
import { InlineBanner, SidebarBanners } from "@/components/Banners";
import { RecommendedLinks } from "@/components/RecommendedLinks";
import { CategoryNewsRail } from "@/components/CategoryNewsRail";
import { Card, EmptyState, inputClass } from "@/components/ui";
import { siteUrl } from "@/lib/format";
import { metaDescription } from "@/lib/seo";
import { cleanSpecialties, specialtySet } from "@/lib/specialties";
import { OptionSearchPicker } from "@/components/forms/OptionSearchPicker";
import { VehicleFilters } from "@/components/VehicleFilters";
import { VEHICLE_FEATURES, isVehicleCard, keepKnown } from "@/lib/vehicles";
import { ListingCard } from "@/components/ListingCard";
import {
  LISTING_INCLUDE,
  listingWhere,
  type ListingSection,
} from "@/lib/listings";

/** Directory categories that also have member-posted listings of their own. */
const LISTING_SECTIONS: Record<
  string,
  { section: ListingSection; title: string; href: string }
> = {
  "rooms-roommates": {
    section: "rooms",
    title: "Rooms and roommates posted by members",
    href: "/rooms",
  },
  "real-estate": {
    section: "real-estate",
    title: "Property posted by members",
    href: "/real-estate",
  },
  "buy-sell": {
    section: "marketplace",
    title: "Items for sale posted by members",
    href: "/marketplace",
  },
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const category = await getCategory(params.slug);
  if (!category) return { title: "Category not found" };
  const names = category.children.slice(0, 6).map((child) => child.name);
  return {
    title: `${category.name} in India — Godesi directory`,
    description: metaDescription(
      category.blurb,
      names.length ? `Browse ${names.join(", ")} and more.` : null,
      `Find trusted ${category.name.toLowerCase()} in your city on Godesi — verified desi businesses with photos, reviews, WhatsApp chat and free enquiries.`,
    ),
    alternates: {
      canonical: `${siteUrl()}/categories/${category.slug}`,
      types: {
        "application/rss+xml": `${siteUrl()}/categories/${category.slug}/rss.xml`,
      },
    },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: {
    city?: string;
    q?: string;
    service?: string | string[];
    cert?: string | string[];
    vtype?: string;
    vmake?: string;
    vmodel?: string;
    vfuel?: string;
    vtrans?: string;
    vowner?: string;
    vcond?: string;
    vminyear?: string;
    vmaxmiles?: string;
    vminprice?: string;
    vmaxprice?: string;
    vfeature?: string | string[];
    opt?: string | string[];
  };
}) {
  const category = await getCategory(params.slug);
  if (!category) notFound();

  const scope = categoryScopeSlugs(category);
  const services = specialtySet(category.slug);
  const selectedServices = cleanSpecialties(
    category.slug,
    Array.isArray(searchParams.service)
      ? searchParams.service
      : searchParams.service
        ? [searchParams.service]
        : [],
  );
  const certOptions = services?.certifications?.options ?? [];
  const certParam = Array.isArray(searchParams.cert)
    ? searchParams.cert
    : searchParams.cert
      ? [searchParams.cert]
      : [];
  const selectedCerts = certOptions.filter((option) =>
    certParam.includes(option),
  );
  const optParam = Array.isArray(searchParams.opt)
    ? searchParams.opt
    : searchParams.opt
      ? [searchParams.opt]
      : [];
  /** One filter group per option group, so groups AND but values inside OR. */
  const selectedOptionGroups = (services?.choices ?? []).map((group) =>
    group.options.filter((option) => optParam.includes(option)),
  );
  const selectedOptions = selectedOptionGroups.flat();
  const vehicleCategory = isVehicleCard(category.slug);
  const vehicleFeatures = keepKnown(
    VEHICLE_FEATURES,
    Array.isArray(searchParams.vfeature)
      ? searchParams.vfeature
      : searchParams.vfeature
        ? [searchParams.vfeature]
        : [],
  );
  const positive = (value?: string) => {
    const parsed = Number(value);
    return value && Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
  };
  const vehicleFilters = vehicleCategory
    ? {
        vehicleType: searchParams.vtype || undefined,
        make: searchParams.vmake || undefined,
        model: searchParams.vmodel || undefined,
        fuelType: searchParams.vfuel || undefined,
        transmission: searchParams.vtrans || undefined,
        ownership: searchParams.vowner || undefined,
        condition: searchParams.vcond || undefined,
        minYear: positive(searchParams.vminyear),
        maxMileage: positive(searchParams.vmaxmiles),
        minPrice: positive(searchParams.vminprice),
        maxPrice: positive(searchParams.vmaxprice),
        features: vehicleFeatures,
      }
    : undefined;
  const guide = guideFor(category.parent?.slug ?? category.slug);
  /** Pre-selects this category (and subcategory) in the business card form. */
  const postQuery = new URLSearchParams({
    ...(category.parent
      ? { category: category.parent.slug, subcategory: category.slug }
      : { category: category.slug }),
    type:
      (category.parent?.slug ?? category.slug) === "professionals"
        ? "professional"
        : "business",
  }).toString();
  const memberListings =
    LISTING_SECTIONS[category.parent?.slug ?? category.slug];
  /** On a Buy & sell subcategory, show only the items sold in it. */
  const listingCategory =
    memberListings?.section === "marketplace" && category.parent
      ? category.slug
      : undefined;
  const [businesses, events, listings] = await Promise.all([
    searchBusinesses({
      categorySlugs: scope,
      city: searchParams.city,
      q: searchParams.q,
      specialties: selectedServices,
      certifications: selectedCerts,
      serviceOptionGroups: selectedOptionGroups,
      vehicle: vehicleFilters,
    }),
    db.event.findMany({
      where: {
        status: "APPROVED",
        startsAt: { gte: new Date() },
        categorySlug: { in: scope },
      },
      orderBy: { startsAt: "asc" },
      take: 3,
      include: {
        category: { select: { name: true, icon: true, color: true } },
      },
    }),
    memberListings
      ? db.listing.findMany({
          where: listingWhere(memberListings.section, {
            city: searchParams.city,
            q: searchParams.q,
            category: listingCategory,
          }),
          orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
          include: LISTING_INCLUDE,
          take: 6,
        })
      : Promise.resolve([]),
  ]);

  return (
    <div className="flex gap-6">
      <div className="min-w-0 flex-1 space-y-6">
        <section
          className={`rounded-3xl bg-gradient-to-r ${gradientFor(category.color)} px-5 py-8 text-white sm:px-8`}
        >
          <p className="text-sm text-white/80">
            <Link href="/categories" className="hover:underline">
              All categories
            </Link>
            {category.parent ? (
              <>
                {" / "}
                <Link
                  href={`/categories/${category.parent.slug}`}
                  className="hover:underline"
                >
                  {category.parent.name}
                </Link>
              </>
            ) : null}
          </p>
          <h1 className="mt-1 text-3xl font-black">
            <span aria-hidden>{category.icon}</span> {category.name}
          </h1>
          {category.blurb ? (
            <p className="mt-1 text-white/90">{category.blurb}</p>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href={`/dashboard/profile?${postQuery}`}
              className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-slate-900 hover:bg-white/90"
            >
              ➕ Add your business in this category
            </Link>
            <Link
              href={`/leads/new?category=${category.slug}`}
              className="rounded-xl border border-white/70 px-4 py-2 text-sm font-bold text-white hover:bg-white/10"
            >
              Request a service
            </Link>
            {memberListings?.section === "marketplace" ? (
              <Link
                href="/listings/new?kind=MARKETPLACE"
                className="rounded-xl border border-white/70 px-4 py-2 text-sm font-bold text-white hover:bg-white/10"
              >
                🛍️ Sell an item
              </Link>
            ) : null}
          </div>
        </section>

        <FeaturedStrip
          categorySlugs={scope}
          title={`Featured in ${category.name}`}
        />

        {category.children.length ? (
          <section>
            <h2 className="mb-2 text-lg font-bold">Browse subcategories</h2>
            <div className="flex flex-wrap gap-2">
              {category.children.map((child) => (
                <Link
                  key={child.slug}
                  href={`/categories/${child.slug}`}
                  className={`rounded-full border px-3 py-1.5 text-sm font-medium transition hover:shadow-sm ${softFor(category.color)}`}
                >
                  {child.name}
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        <Card>
          <form className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
            <input
              name="q"
              defaultValue={searchParams.q ?? ""}
              placeholder={`Search in ${category.name}`}
              className={inputClass}
              aria-label="Search"
            />
            <input
              name="city"
              defaultValue={searchParams.city ?? ""}
              placeholder="City"
              className={inputClass}
              aria-label="City"
            />
            <button
              type="submit"
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Search
            </button>

            {vehicleCategory ? (
              <VehicleFilters
                values={{
                  vtype: searchParams.vtype ?? "",
                  vmake: searchParams.vmake ?? "",
                  vmodel: searchParams.vmodel ?? "",
                  vfuel: searchParams.vfuel ?? "",
                  vtrans: searchParams.vtrans ?? "",
                  vowner: searchParams.vowner ?? "",
                  vcond: searchParams.vcond ?? "",
                  vminyear: searchParams.vminyear ?? "",
                  vmaxmiles: searchParams.vmaxmiles ?? "",
                  vminprice: searchParams.vminprice ?? "",
                  vmaxprice: searchParams.vmaxprice ?? "",
                  vfeature: vehicleFeatures,
                }}
              />
            ) : null}

            {services ? (
              <fieldset className="sm:col-span-3">
                <legend className="text-sm font-bold text-slate-900">
                  {services.title}
                </legend>
                {services.optionTabs ? (
                  <div className="mt-2">
                    <OptionSearchPicker
                      name="service"
                      tabs={services.optionTabs}
                      bundles={services.bundles}
                      defaultSelected={selectedServices}
                    />
                  </div>
                ) : (
                  <div className="mt-2 grid gap-x-4 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
                    {services.options.map((option) => (
                      <label
                        key={option}
                        className="flex items-start gap-2 text-sm text-slate-700"
                      >
                        <input
                          type="checkbox"
                          name="service"
                          value={option}
                          defaultChecked={selectedServices.includes(option)}
                          className="mt-0.5 h-4 w-4"
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                )}
                {services.choices?.map((group) => (
                  <div key={group.key} className="mt-3">
                    <p className="text-sm font-bold text-slate-900">
                      {group.title}
                    </p>
                    <div className="mt-2 grid gap-x-4 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
                      {group.options.map((option) => (
                        <label
                          key={option}
                          className="flex items-start gap-2 text-sm text-slate-700"
                        >
                          <input
                            type="checkbox"
                            name="opt"
                            value={option}
                            defaultChecked={selectedOptions.includes(option)}
                            className="mt-0.5 h-4 w-4"
                          />
                          {option}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}

                {services.certifications ? (
                  <>
                    <p className="mt-3 text-sm font-bold text-slate-900">
                      {services.certifications.title}
                    </p>
                    <div className="mt-2 grid gap-x-4 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
                      {services.certifications.options.map((option) => (
                        <label
                          key={option}
                          className="flex items-start gap-2 text-sm text-slate-700"
                        >
                          <input
                            type="checkbox"
                            name="cert"
                            value={option}
                            defaultChecked={selectedCerts.includes(option)}
                            className="mt-0.5 h-4 w-4"
                          />
                          {option}
                        </label>
                      ))}
                    </div>
                  </>
                ) : null}

                {selectedServices.length ||
                selectedCerts.length ||
                selectedOptions.length ? (
                  <Link
                    href={`/categories/${category.slug}`}
                    className="mt-2 inline-block text-xs font-semibold text-indigo-600 hover:underline"
                  >
                    Clear filters
                  </Link>
                ) : null}
              </fieldset>
            ) : null}
          </form>
        </Card>

        <section>
          <h2 className="mb-3 text-lg font-bold">
            {businesses.length} listing{businesses.length === 1 ? "" : "s"}
          </h2>
          {businesses.length ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {businesses.map((business) => (
                <BusinessCard key={business.id} business={business} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No listings here yet"
              body="Be the first business in this category — creating a card is free."
            />
          )}
        </section>

        {guide ? (
          <Card className="space-y-4">
            <div>
              <h2 className="text-lg font-bold">
                How to choose {category.name.toLowerCase()} on Godesi
              </h2>
              <p className="mt-1 text-sm text-slate-600">{guide.intro}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Before you book
                </h3>
                <ul className="mt-2 space-y-1.5 text-sm text-slate-600">
                  {guide.checklist.map((item) => (
                    <li key={item}>✅ {item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Questions to ask
                </h3>
                <ul className="mt-2 space-y-1.5 text-sm text-slate-600">
                  {guide.askVendors.map((item) => (
                    <li key={item}>❓ {item}</li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="text-sm text-slate-600">
              Run a {category.name.toLowerCase()} business?{" "}
              <Link
                href={`/dashboard/profile?${postQuery}`}
                className="font-semibold text-indigo-600 hover:underline"
              >
                Add your free listing
              </Link>{" "}
              and start getting enquiries on WhatsApp.
            </p>
          </Card>
        ) : null}

        {category.slug === "real-estate" ? (
          <Card className="bg-gradient-to-r from-orange-50 to-fuchsia-50">
            <h2 className="font-bold">Godesi property marketplace 🏢</h2>
            <p className="mt-1 text-sm text-slate-700">
              Buy, sell or rent — flats, villas, plots, shops, offices and new
              projects from owners, agents and builders in India and the USA.
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-sm font-semibold">
              <Link
                href="/real-estate/start"
                className="rounded-xl bg-indigo-600 px-3 py-2 text-white hover:bg-indigo-700"
              >
                What do you want to do?
              </Link>
              <Link
                href="/real-estate?kind=PROPERTY_SALE"
                className="rounded-xl border border-slate-300 px-3 py-2 hover:bg-white"
              >
                🔍 Buy
              </Link>
              <Link
                href="/real-estate?kind=PROPERTY_RENT"
                className="rounded-xl border border-slate-300 px-3 py-2 hover:bg-white"
              >
                🔑 Rent
              </Link>
              <Link
                href="/listings/new?kind=PROPERTY_SALE"
                className="rounded-xl border border-slate-300 px-3 py-2 hover:bg-white"
              >
                🏷️ Post a property free
              </Link>
            </div>
          </Card>
        ) : null}

        {memberListings && listings.length ? (
          <section>
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-lg font-bold">{memberListings.title}</h2>
              <Link
                href={
                  listingCategory
                    ? `${memberListings.href}?category=${listingCategory}`
                    : memberListings.href
                }
                className="text-sm font-semibold text-indigo-600 hover:underline"
              >
                See all →
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {listings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  cityBase={memberListings.href}
                />
              ))}
            </div>
          </section>
        ) : null}

        {events.length ? (
          <section>
            <h2 className="mb-3 text-lg font-bold">
              Upcoming {category.name} events
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </section>
        ) : null}
        <RecommendedLinks categorySlug={category.slug} />

        <CategoryNewsRail
          categorySlug={category.slug}
          categoryName={category.name}
          topic={
            (category.parent?.slug ?? category.slug) === "religious-services"
              ? "faith"
              : "general"
          }
        />

        <InlineBanner />
      </div>

      <SidebarBanners
        categorySlug={category.slug}
        parentSlug={category.parent?.slug ?? null}
      />
    </div>
  );
}
