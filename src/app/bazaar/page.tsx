import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { db } from "@/lib/db";
import { cityNames } from "@/lib/cities";
import { newsPath } from "@/lib/newsLinks";
import { siteUrl } from "@/lib/format";
import { Card } from "@/components/ui";

export const dynamic = "force-dynamic";

/**
 * Oak Tree Bazaar — the directory for the Oak Tree Road desi shopping strip in
 * Iselin NJ. Also served as the front page of oaktreebazaar.com (see
 * middleware.ts), so every section links into the main GoDesi site.
 */
async function loadBazaar() {
  const names = await cityNames("iselin");
  if (!names.length) return null;
  const where = { city: { in: names } };

  const [businesses, events, listings, deals, reports] = await Promise.all([
    db.business.findMany({
      where: { status: "APPROVED", ...where },
      orderBy: [{ category: "asc" }, { name: "asc" }],
      take: 1000,
      select: {
        slug: true,
        name: true,
        category: true,
        categorySlug: true,
        subcategorySlug: true,
      },
    }),
    db.event.findMany({
      where: { status: "APPROVED", startsAt: { gte: new Date() }, ...where },
      orderBy: { startsAt: "asc" },
      take: 12,
      select: { slug: true, title: true, startsAt: true, venue: true },
    }),
    db.listing.findMany({
      where: { status: "APPROVED", ...where },
      orderBy: { createdAt: "desc" },
      take: 12,
      select: { slug: true, title: true, kind: true, categorySlug: true },
    }),
    db.deal.findMany({
      where: {
        active: true,
        OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }],
        business: { status: "APPROVED", ...where },
      },
      orderBy: { createdAt: "desc" },
      take: 12,
      select: {
        id: true,
        title: true,
        code: true,
        business: { select: { slug: true, name: true } },
      },
    }),
    db.newsItem.findMany({
      where: { status: "PUBLISHED", ...where },
      orderBy: { publishedAt: "desc" },
      take: 8,
      select: {
        id: true,
        title: true,
        publishedAt: true,
        source: true,
      },
    }),
  ]);

  return { businesses, events, listings, deals, reports };
}

export async function generateMetadata(): Promise<Metadata> {
  const host = (headers().get("host") ?? "").toLowerCase();
  const canonical = host.includes("oaktreebazaar.com")
    ? "https://oaktreebazaar.com/"
    : `${siteUrl()}/bazaar`;
  return {
    title: "Oak Tree Bazaar — Oak Tree Road, Iselin NJ | Desi shops, food & events",
    description:
      "The directory for Oak Tree Bazaar on Oak Tree Road, Iselin NJ: Indian shops, restaurants, jewellers, groceries, services, events and deals on New Jersey's desi shopping street.",
    keywords: [
      "oak tree bazaar",
      "oak tree road iselin",
      "oak tree road",
      "oak tree street",
      "oaktreestreets",
      "oak tree road bazaar",
      "indian shops iselin nj",
      "desi bazaar new jersey",
      "oak tree road shops",
      "iselin desi",
    ],
    alternates: { canonical },
    // Search Console ownership check for oaktreebazaar.com (this page is its
    // homepage via the middleware rewrite).
    verification: {
      google: "fZSiKxMGxySpt25Ql9DU3yaAYnaovzW488oWFbfoMFY",
    },
  };
}

function Section({
  title,
  href,
  children,
}: {
  title: string;
  href?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-black">{title}</h2>
        {href ? (
          <Link
            href={href}
            className="text-xs font-semibold text-indigo-600 hover:underline"
          >
            See all on GoDesi →
          </Link>
        ) : null}
      </div>
      {children}
    </Card>
  );
}

const FAQ = [
  {
    q: "What is Oak Tree Bazaar?",
    a: "Oak Tree Bazaar is the free online directory for Oak Tree Road in Iselin, New Jersey — the desi shopping street packed with Indian restaurants, sweet shops, jewellers, sari stores, groceries and services. Browse every business on the strip, see upcoming events and grab store deals, all on GoDesi.",
  },
  {
    q: "Where is Oak Tree Road?",
    a: "Oak Tree Road runs through Iselin and Edison in Middlesex County, New Jersey. The stretch between Route 27 and Route 1 is the heart of NJ's Indian shopping district — often called Oak Tree Street or the Oak Tree Bazaar.",
  },
  {
    q: "How do I list my Oak Tree Road business?",
    a: "Add a free business card on GoDesi — it takes two minutes and your shop appears in the Iselin directory, on Oak Tree Bazaar, in search, and on your own digital card you can share by QR. Claim an existing listing if yours is already listed.",
  },
  {
    q: "Where do I find events on Oak Tree Road?",
    a: "Street festivals, garba nights, store sales and community events on and around Oak Tree Road are listed in the Events section above — including events posted under #oaktreestreets. Tickets and details link through to the organizer's page.",
  },
];

export default async function BazaarPage() {
  const data = await loadBazaar();
  const businesses = data?.businesses ?? [];
  const events = data?.events ?? [];
  const listings = data?.listings ?? [];
  const deals = data?.deals ?? [];
  const reports = data?.reports ?? [];

  const grouped = businesses.reduce<Record<string, typeof businesses>>(
    (groups, business) => {
      (groups[business.category] ??= []).push(business);
      return groups;
    },
    {},
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Card className="bg-gradient-to-br from-orange-600 to-rose-600 text-white">
        <p className="text-xs font-bold uppercase tracking-widest text-white/80">
          Iselin · Edison · New Jersey
        </p>
        <h1 className="mt-1 text-3xl font-black">🛍️ Oak Tree Bazaar</h1>
        <p className="mt-2 max-w-2xl text-sm text-white/90">
          Every desi shop, restaurant, jeweller, service and event on and around
          Oak Tree Road, Iselin — New Jersey&apos;s Indian shopping street.
          Free listings, live deals and community events, powered by GoDesi.
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-sm font-bold">
          <Link
            href="/add-business"
            className="rounded-xl bg-white px-3 py-2 text-orange-700"
          >
            List your business free
          </Link>
          <Link
            href="/city/iselin"
            className="rounded-xl border border-white/40 px-3 py-2"
          >
            Full Iselin hub
          </Link>
        </div>
      </Card>

      {deals.length ? (
        <Section title="💰 Deals on the strip" href="/deals">
          <ul className="divide-y divide-slate-100">
            {deals.map((deal) => (
              <li key={deal.id} className="py-2">
                <Link
                  href={`/business/${deal.business.slug}`}
                  className="font-semibold text-slate-900 hover:text-indigo-600"
                >
                  {deal.title}
                </Link>
                <p className="text-xs text-slate-500">
                  {deal.business.name}
                  {deal.code ? ` · code ${deal.code}` : ""}
                </p>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {events.length ? (
        <Section title="🎟️ Upcoming events on Oak Tree Road" href="/events">
          <ul className="divide-y divide-slate-100">
            {events.map((event) => (
              <li key={event.slug} className="py-2">
                <Link
                  href={`/events/${event.slug}`}
                  className="font-semibold text-slate-900 hover:text-indigo-600"
                >
                  {event.title}
                </Link>
                <p className="text-xs text-slate-500">
                  {event.startsAt.toDateString()} · {event.venue}
                </p>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {businesses.length ? (
        <Section
          title={`🪔 Shops & services on and around Oak Tree Road (${businesses.length})`}
          href="/city/iselin"
        >
          {Object.entries(grouped).map(([category, group]) => {
            const first = group[0];
            const filter = first.subcategorySlug
              ? `sub=${first.subcategorySlug}`
              : `category=${first.categorySlug}`;
            const shown = group.slice(0, 30);
            return (
              <div key={category} className="py-2 first:pt-0 last:pb-0">
                <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  <Link
                    href={`/search?city=Iselin&${filter}`}
                    className="hover:text-indigo-600 hover:underline"
                  >
                    {category}
                  </Link>
                  <span className="ml-1 font-normal">({group.length})</span>
                </h3>
                <ul className="mt-1.5 grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                  {shown.map((business) => (
                    <li key={business.slug}>
                      <Link
                        href={`/business/${business.slug}`}
                        title={business.name}
                        className="block truncate rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-orange-300 hover:text-orange-700"
                      >
                        {business.name}
                      </Link>
                    </li>
                  ))}
                  {group.length > shown.length ? (
                    <li>
                      {/* Overflow must open the whole category, not just the
                          first row's subcategory — siblings would vanish. */}
                      <Link
                        href={`/search?city=Iselin&category=${first.categorySlug}`}
                        className="block rounded-lg border border-dashed border-slate-300 px-2.5 py-1.5 text-sm font-semibold text-indigo-600 hover:border-indigo-400"
                      >
                        +{group.length - shown.length} more
                      </Link>
                    </li>
                  ) : null}
                </ul>
              </div>
            );
          })}
        </Section>
      ) : null}

      {listings.length ? (
        <Section
          title="🏠 Property, rooms and buy & sell"
          href="/marketplace"
        >
          <ul className="divide-y divide-slate-100">
            {listings.map((listing) => (
              <li key={listing.slug} className="py-2">
                <Link
                  href={`/listings/${listing.slug}`}
                  className="font-semibold text-slate-900 hover:text-indigo-600"
                >
                  {listing.title}
                </Link>
                <p className="text-xs text-slate-500">
                  {listing.categorySlug ?? listing.kind}
                </p>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {reports.length ? (
        <Section title="📰 News from the area" href="/news">
          <ul className="divide-y divide-slate-100">
            {reports.map((report) => (
              <li key={report.id} className="py-2">
                <Link
                  href={newsPath(report)}
                  className="font-semibold text-slate-900 hover:text-indigo-600"
                >
                  {report.title}
                </Link>
                <p className="text-xs text-slate-500">
                  {report.source} · {report.publishedAt.toDateString()}
                </p>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      <Card>
        <h2 className="text-lg font-black">About Oak Tree Bazaar</h2>
        <div className="mt-2 space-y-3">
          {FAQ.map((item) => (
            <details
              key={item.q}
              className="rounded-lg border border-slate-200 px-3 py-2"
            >
              <summary className="cursor-pointer text-sm font-bold text-slate-800">
                {item.q}
              </summary>
              <p className="mt-1.5 text-sm text-slate-600">{item.a}</p>
            </details>
          ))}
        </div>
      </Card>
    </div>
  );
}
