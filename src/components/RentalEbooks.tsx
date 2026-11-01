const BOOKS = [
  { slug: "protect-your-property-from-squatters", title: "Protect Your Property from Squatters", subtitle: "Keep vacant homes, rentals and Airbnbs safe, and what to do if someone moves in", color: "#c2410c", audience: "NJ owners & landlords" },
  { slug: "protect-yourself-from-deed-fraud", title: "Stop Deed & Title Fraud", subtitle: "Protect your home and land from forged deeds, seller impersonation and fake mortgages", color: "#0e7490", audience: "NJ homeowners" },
  { slug: "why-you-must-hire-a-realtor", title: "Why You Must Hire a Realtor®", subtitle: "What a licensed NJ Realtor does for sellers, buyers and landlords, and what going alone costs", color: "#4f46e5", audience: "Sellers, buyers & landlords" },
];

const BASE = "https://www.vdorental.com";

export default function RentalEbooks({ heading = "Free ebooks for NJ property owners" }: { heading?: string }) {
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-bold">{heading}</h2>
        <a href={`${BASE}/ebooks`} className="text-sm font-semibold text-indigo-600 hover:underline">See all free ebooks →</a>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {BOOKS.map((b) => (
          <a key={b.slug} href={`${BASE}/ebooks/${b.slug}`} className="group block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/covers/${b.slug}.svg`} alt={`${b.title} ebook cover`} width={600} height={800} className="aspect-[3/4] w-full rounded-lg shadow-lg transition group-hover:-translate-y-1 group-hover:shadow-xl" />
            <p className="mt-2 text-sm font-semibold text-indigo-700 group-hover:underline">Read free →</p>
          </a>
        ))}
      </div>
      <p className="text-xs text-slate-500">Written by Anil Aggarwal, Broker Manager &amp; Realtor® with Vylla Home (NJ Lic #1753579). Education only, not legal or tax advice.</p>
    </section>
  );
}
