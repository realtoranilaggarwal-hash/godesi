import type { Metadata } from "next";
import { Card } from "@/components/ui";
import { TravelSearch } from "@/components/travel/TravelSearch";
import { TRAVEL_WHITELABEL } from "@/lib/travel";

export const metadata: Metadata = {
  title: "GoDesi Travel — cheap flights & hotels",
  description:
    "Search cheap flights and hotels on GoDesi Travel — compare fares from hundreds of airlines and booking sites to India and worldwide.",
  alternates: { canonical: "/travel" },
};

export default function TravelPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <section className="rounded-3xl bg-gradient-to-br from-indigo-600 via-sky-600 to-cyan-500 p-6 text-white sm:p-8">
        <p className="text-xs font-bold uppercase tracking-widest text-white/70">
          GoDesi Travel
        </p>
        <h1 className="mt-1 text-3xl font-black sm:text-4xl">
          Flights &amp; hotels
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-white/90">
          Find cheap flights to India and anywhere else, plus hotel deals —
          prices compared across hundreds of airlines and booking sites.
          Results open on our own GoDesi Travel site.
        </p>
      </section>

      <Card className="p-5 sm:p-6">
        <TravelSearch />
      </Card>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          {
            title: "Every airline compared",
            body: "One search checks hundreds of airlines and online agencies, so the lowest fare to Delhi, Mumbai or Ahmedabad shows up first.",
          },
          {
            title: "Flexible dates help",
            body: "Flying mid-week or shifting a few days often drops the price a lot — try a couple of date combos before you book.",
          },
          {
            title: "Book on GoDesi Travel",
            body: "Results and booking happen on travel.godesi.com, our travel site powered by a flight & hotel search partner.",
          },
        ].map((item) => (
          <Card key={item.title} className="p-5">
            <h2 className="text-sm font-bold text-slate-900">{item.title}</h2>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">
              {item.body}
            </p>
          </Card>
        ))}
      </section>

      <p className="text-center text-sm text-slate-500">
        Direct link:{" "}
        <a
          href={TRAVEL_WHITELABEL}
          className="font-semibold text-indigo-700 underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          travel.godesi.com
        </a>
      </p>
    </div>
  );
}
