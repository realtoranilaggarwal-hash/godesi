import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { cachedQuery } from "@/lib/cache";
import { listingWhere, priceLabel } from "@/lib/listings";
import { LinkButton } from "@/components/ui";

export const metadata: Metadata = {
  title: "Desi Classifieds USA: free ads, rooms, jobs",
  description:
    "Free desi classifieds in the USA: buy and sell, rooms and roommates, mini jobs, gigs and desi services. Post a free ad and get WhatsApp messages from buyers.",
  alternates: { canonical: "/classifieds" },
};

const LISTING_FIELDS = {
  slug: true,
  title: true,
  city: true,
  price: true,
  currency: true,
  perMonth: true,
} as const;

/** One cached read per 10 minutes serves every visitor and crawler. */
const classifiedRows = cachedQuery("classifieds-hub", 600, async () => {
  const [marketplace, rooms, jobs, gigs] = await Promise.all([
    db.listing.findMany({
      where: listingWhere("marketplace", {}),
      orderBy: { createdAt: "desc" },
      take: 8,
      select: LISTING_FIELDS,
    }),
    db.listing.findMany({
      where: listingWhere("rooms", {}),
      orderBy: { createdAt: "desc" },
      take: 8,
      select: LISTING_FIELDS,
    }),
    db.job.count({ where: { status: "OPEN" } }),
    db.gig.findMany({
      where: { status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: { slug: true, title: true, priceMinor: true },
    }),
  ]);
  return { marketplace, rooms, jobs, gigs };
});

type Row = { href: string; title: string; meta: string };

function Section({
  title,
  blurb,
  rows,
  moreHref,
  moreLabel,
  postHref,
}: {
  title: string;
  blurb: string;
  rows: Row[];
  moreHref: string;
  moreLabel: string;
  postHref: string;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-xl font-black text-slate-900">{title}</h2>
        <Link href={postHref} className="text-sm font-semibold text-rose-600 hover:underline">
          Post free →
        </Link>
      </div>
      <p className="mt-1 text-sm text-slate-600">{blurb}</p>
      {rows.length ? (
        <ul className="mt-3 divide-y divide-slate-100">
          {rows.map((row) => (
            <li key={row.href} className="flex items-baseline justify-between gap-3 py-2">
              <Link href={row.href} className="min-w-0 truncate font-semibold text-slate-800 hover:text-rose-600">
                {row.title}
              </Link>
              <span className="shrink-0 text-xs text-slate-500">{row.meta}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-slate-500">Nothing posted yet. Be the first!</p>
      )}
      <Link href={moreHref} className="mt-3 inline-block text-sm font-semibold text-indigo-600 hover:underline">
        {moreLabel} →
      </Link>
    </section>
  );
}

export default async function ClassifiedsPage() {
  const { marketplace, rooms, jobs, gigs } = await classifiedRows();
  const listingRow = (row: (typeof marketplace)[number]): Row => ({
    href: `/listings/${row.slug}`,
    title: row.title,
    meta: [row.city, priceLabel(row)].filter(Boolean).join(" · "),
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <section className="rounded-3xl bg-gradient-to-br from-rose-600 via-orange-500 to-amber-500 p-6 text-white sm:p-8">
        <p className="text-xs font-bold uppercase tracking-widest text-white/80">Classifieds</p>
        <h1 className="mt-1 text-3xl font-black sm:text-4xl">Desi classifieds in the USA</h1>
        <p className="mt-2 max-w-2xl text-sm text-white/90">
          Free ads for the desi community: buy and sell, rooms and roommates,
          mini jobs and gigs. Posting is free, and buyers message you directly
          on WhatsApp. No middleman, no listing fee.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <LinkButton href="/listings/new?kind=MARKETPLACE" variant="secondary">
            Post a free ad
          </LinkButton>
          <LinkButton href="/add-business" variant="secondary">
            List your business free
          </LinkButton>
        </div>
      </section>

      <div className="grid gap-5 md:grid-cols-2">
        <Section
          title="🛍️ Buy & sell"
          blurb="Jewellery, sarees and ethnic wear, furniture, electronics, homemade food and kids' things."
          rows={marketplace.map(listingRow)}
          moreHref="/marketplace"
          moreLabel="All buy & sell ads"
          postHref="/listings/new?kind=MARKETPLACE"
        />
        <Section
          title="🛏️ Rooms & roommates"
          blurb="Rooms for rent and roommates wanted, near desi neighbourhoods, temples and train stations."
          rows={rooms.map(listingRow)}
          moreHref="/rooms"
          moreLabel="All rooms"
          postHref="/listings/new?kind=ROOM_OFFERED"
        />
        <Section
          title="💼 Mini jobs"
          blurb={`${jobs} open ${jobs === 1 ? "job" : "jobs"} from GoDesi members: nanny, cooking, cleaning, tutoring, sales callers, drivers and event help.`}
          rows={[]}
          moreHref="/jobs"
          moreLabel="See jobs"
          postHref="/jobs/new"
        />
        <Section
          title="🧑‍💻 Gigs"
          blurb="Fixed-price services from desi experts: kundli reading, resume review, logo design, tax help and tutoring."
          rows={gigs.map((gig) => ({
            href: `/gigs/${gig.slug}`,
            title: gig.title,
            meta: `$${Math.round(gig.priceMinor / 100)}`,
          }))}
          moreHref="/gigs"
          moreLabel="All gigs"
          postHref="/gigs"
        />
      </div>

      <section className="flex flex-col items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-900">📣 Post your classified ad free</h2>
          <p className="text-sm text-slate-700">
            Selling something, renting a room or hiring? Post it in 2 minutes. Buyers message you on WhatsApp.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <LinkButton href="/listings/new?kind=MARKETPLACE">Sell an item</LinkButton>
          <LinkButton href="/listings/new?kind=ROOM_OFFERED" variant="secondary">Rent a room</LinkButton>
          <LinkButton href="/jobs/new" variant="secondary">Post a job</LinkButton>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-700 shadow-sm">
        <h2 className="text-lg font-black text-slate-900">More free desi listings</h2>
        <ul className="mt-2 grid gap-2 sm:grid-cols-2">
          <li><Link className="font-semibold text-indigo-600 hover:underline" href="/real-estate">Homes for sale and rent</Link></li>
          <li><Link className="font-semibold text-indigo-600 hover:underline" href="/search">Desi business directory</Link></li>
          <li><Link className="font-semibold text-indigo-600 hover:underline" href="/events">Desi events near you</Link></li>
          <li><Link className="font-semibold text-indigo-600 hover:underline" href="/deals">Coupons and deals</Link></li>
          <li><Link className="font-semibold text-indigo-600 hover:underline" href="/dj">Desi DJs and dhol</Link></li>
          <li><Link className="font-semibold text-indigo-600 hover:underline" href="/desi-websites">Best desi websites</Link></li>
        </ul>
      </section>
    </div>
  );
}
