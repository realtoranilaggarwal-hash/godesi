import type { Metadata } from "next";
import Link from "next/link";
import { popularCities } from "@/lib/cities";
import { siteUrl } from "@/lib/format";
import { Card, EmptyState } from "@/components/ui";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Desi cities on Godesi — news, businesses and events by place",
  description:
    "Pick your city and see everything desi in it: community news reported by members, local businesses and professionals, upcoming events, property and rooms, temples and places of worship.",
  alternates: { canonical: `${siteUrl()}/city` },
};

export default async function CitiesPage() {
  const cities = await popularCities(120);

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-indigo-600 to-fuchsia-600 text-white">
        <h1 className="text-2xl font-black">📍 Desi cities</h1>
        <p className="mt-1 text-sm text-white/90">
          Everything posted in one place — news, businesses, events, rentals and
          temples.
        </p>
      </Card>

      {cities.length ? (
        <Card>
          <ul className="flex flex-wrap gap-2">
            {cities.map((city) => (
              <li key={city.slug}>
                <Link
                  href={`/city/${city.slug}`}
                  className="inline-block rounded-xl bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-indigo-100 hover:text-indigo-700"
                >
                  {city.city}{" "}
                  <span className="text-xs text-slate-400">{city.count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      ) : (
        <EmptyState
          title="No cities yet"
          body="Cities appear here as members post businesses, events and news."
        />
      )}
    </div>
  );
}
