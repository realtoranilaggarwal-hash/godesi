import Link from "next/link";
import { searchBusinesses, listCategories } from "@/lib/businesses";
import { BusinessCard } from "@/components/BusinessCard";
import { Card, LinkButton } from "@/components/ui";

export const dynamic = "force-dynamic";

const HIGHLIGHTS = [
  {
    title: "Digital business card",
    body: "A mobile-first profile with your logo, gallery, website, maps and social links.",
  },
  {
    title: "QR code, ready to print",
    body: "Every profile gets a unique QR code you can download and put on your shop or bill book.",
  },
  {
    title: "WhatsApp in one tap",
    body: "Customers chat with you instantly, and every click is tracked in your dashboard.",
  },
  {
    title: "Lead marketplace",
    body: "Clients post requirements. Premium members unlock contact details and win the job.",
  },
];

export default async function HomePage() {
  const [businesses, categories] = await Promise.all([
    searchBusinesses({ take: 6 }),
    listCategories(),
  ]);

  return (
    <div className="space-y-10">
      <section className="rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-600 px-5 py-10 text-white sm:px-10 sm:py-14">
        <h1 className="max-w-2xl text-3xl font-black leading-tight sm:text-5xl">
          Your business, one link and one QR code away.
        </h1>
        <p className="mt-3 max-w-2xl text-indigo-100">
          Godesi is a digital business card for small businesses — with WhatsApp chat,
          reviews, and a marketplace of buyer requirements.
        </p>

        <form action="/search" className="mt-6 flex max-w-xl flex-col gap-2 sm:flex-row">
          <input
            name="q"
            placeholder="Search plumbers, bakers, printers..."
            className="w-full rounded-xl px-4 py-3 text-sm text-slate-900 outline-none"
            aria-label="Search businesses"
          />
          <button
            type="submit"
            className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-indigo-700 hover:bg-indigo-50"
          >
            Search
          </button>
        </form>

        <div className="mt-6 flex flex-wrap gap-3">
          <LinkButton href="/signup" variant="secondary">
            Create your free card
          </LinkButton>
          <LinkButton
            href="/leads/new"
            variant="secondary"
            className="bg-transparent text-white hover:bg-white/10"
          >
            Post a requirement
          </LinkButton>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {HIGHLIGHTS.map((item) => (
          <Card key={item.title}>
            <h2 className="font-semibold">{item.title}</h2>
            <p className="mt-1 text-sm text-slate-600">{item.body}</p>
          </Card>
        ))}
      </section>

      {categories.length ? (
        <section>
          <h2 className="mb-3 text-lg font-bold">Browse by category</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Link
                key={category}
                href={`/search?category=${encodeURIComponent(category)}`}
                className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm hover:border-indigo-400 hover:text-indigo-600"
              >
                {category}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">Featured businesses</h2>
          <Link href="/search" className="text-sm font-semibold text-indigo-600">
            See all
          </Link>
        </div>
        {businesses.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
    </div>
  );
}
