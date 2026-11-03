import type { Metadata } from "next";
import Link from "next/link";
import { searchBusinesses } from "@/lib/businesses";
import { BusinessCard } from "@/components/BusinessCard";
import { DJ_CATEGORY_SLUGS, DjsWikiBanner } from "@/components/DjsWikiPromo";
import { LinkButton } from "@/components/ui";
import { resultsAreThin, robotsFor } from "@/lib/thinContent";

const CITIES = ["Edison", "Jersey City", "Iselin", "Parsippany", "New York", "Queens", "Philadelphia"];

export async function generateMetadata(): Promise<Metadata> {
  const djs = await searchBusinesses({ categorySlugs: DJ_CATEGORY_SLUGS });
  return {
    title: "Desi DJs near you: Indian DJ, dhol and sound",
    description:
      "Find a desi DJ for your wedding, sangeet or party: Indian and Bollywood DJs, dhol players, live bands and sound rentals. Compare and enquire free on GoDesi.",
    alternates: { canonical: "/dj" },
    robots: robotsFor(resultsAreThin(djs.length)),
  };
}

export default async function DjPage() {
  const djs = await searchBusinesses({ categorySlugs: DJ_CATEGORY_SLUGS });

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="rounded-3xl bg-gradient-to-br from-fuchsia-600 via-purple-600 to-indigo-600 p-6 text-white sm:p-8">
        <p className="text-xs font-bold uppercase tracking-widest text-white/80">DJs &amp; music</p>
        <h1 className="mt-1 text-3xl font-black sm:text-4xl">Desi DJs near you</h1>
        <p className="mt-2 max-w-2xl text-sm text-white/90">
          Indian and Bollywood DJs, dhol players, live bands, singers, anchors
          and sound rentals for weddings, sangeet, mehndi, baraat, birthdays and
          garba nights. Message them on WhatsApp or send a free enquiry.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <LinkButton href="/wedding/requirements/new" variant="secondary">
            Get DJ quotes free
          </LinkButton>
          <LinkButton href="/wedding/vendors" variant="secondary">
            Are you a DJ? List free
          </LinkButton>
        </div>
      </section>

      <div className="flex flex-wrap gap-2 text-sm">
        <span className="font-semibold text-slate-600">DJs by city:</span>
        {CITIES.map((city) => (
          <Link
            key={city}
            href={`/categories/events-wedding-dj-and-sound?city=${encodeURIComponent(city)}`}
            className="rounded-full border border-slate-200 bg-white px-3 py-1 font-semibold text-slate-700 hover:border-fuchsia-400"
          >
            {city}
          </Link>
        ))}
      </div>

      {djs.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {djs.slice(0, 60).map((business) => (
            <BusinessCard key={business.id} business={business} />
          ))}
        </div>
      ) : (
        <p className="text-slate-600">No DJs listed yet. Be the first!</p>
      )}

      <DjsWikiBanner />

      <section className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-700 shadow-sm">
        <h2 className="text-lg font-black text-slate-900">Booking a desi DJ: quick tips</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Book 6 to 9 months ahead for wedding season (October to March and May to July).</li>
          <li>Ask if dhol, lights, a dance floor and an MC are included or extra.</li>
          <li>Share your must-play Bollywood, Punjabi and garba songs, and a do-not-play list.</li>
          <li>Check the venue&apos;s sound and end-time rules before you sign.</li>
        </ul>
        <p className="mt-3">
          Planning the whole wedding? See <Link href="/wedding" className="font-semibold text-indigo-600 hover:underline">desi wedding vendors</Link> and{" "}
          <Link href="/classifieds" className="font-semibold text-indigo-600 hover:underline">desi classifieds</Link>.
        </p>
      </section>
    </div>
  );
}
