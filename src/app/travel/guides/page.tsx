import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui";
import { TRAVEL_GUIDES } from "@/lib/travelGuides";

export const metadata: Metadata = {
  title: "Travel guides — GoDesi Travel",
  description:
    "Practical travel guides for the Desi community — cheap flights to India, eSIMs, airport pickups and flight compensation.",
  alternates: { canonical: "/travel/guides" },
};

export default function TravelGuidesPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <section className="rounded-3xl bg-gradient-to-br from-indigo-600 via-sky-600 to-cyan-500 p-6 text-white sm:p-8">
        <p className="text-xs font-bold uppercase tracking-widest text-white/70">
          GoDesi Travel
        </p>
        <h1 className="mt-1 text-3xl font-black sm:text-4xl">Travel guides</h1>
        <p className="mt-2 max-w-2xl text-sm text-white/90">
          Plain, practical guides for trips to India and beyond — booking cheap
          flights, staying connected, getting picked up at the airport and what
          airlines owe you when things go wrong.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        {TRAVEL_GUIDES.map((guide) => (
          <Link key={guide.slug} href={`/travel/guides/${guide.slug}`}>
            <Card className="h-full transition hover:border-indigo-300 hover:shadow-md">
              <div className="text-2xl">{guide.emoji}</div>
              <h2 className="mt-2 text-base font-bold text-slate-900">
                {guide.title}
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">
                {guide.description}
              </p>
              <p className="mt-3 text-xs font-semibold text-indigo-600">
                {guide.minutes} min read →
              </p>
            </Card>
          </Link>
        ))}
      </section>

      <p className="text-center text-sm text-slate-500">
        Ready to book?{" "}
        <Link href="/travel" className="font-semibold text-indigo-700 underline">
          Search flights &amp; hotels
        </Link>
      </p>
    </div>
  );
}
