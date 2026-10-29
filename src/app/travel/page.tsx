import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui";
import { TravelSearch } from "@/components/travel/TravelSearch";
import { TravelWidget } from "@/components/travel/TravelWidget";
import { TRAVEL_WHITELABEL } from "@/lib/travel";
import { TRAVEL_PARTNER_GROUPS } from "@/lib/travelPartners";
import { TRAVEL_GUIDES } from "@/lib/travelGuides";

export const metadata: Metadata = {
  title: "GoDesi Travel — cheap flights & hotels",
  description:
    "Search cheap flights and hotels on GoDesi Travel — compare fares from hundreds of airlines and booking sites to India and worldwide. Plus eSIMs, airport transfers, car rentals and tours.",
  alternates: { canonical: "/travel" },
};

const COMMUNITY_SERVICES = [
  { label: "Travel agents", href: "/categories/travel-travel-agents" },
  { label: "Carpool & rideshare", href: "/categories/travel-carpool-and-rideshare" },
  { label: "Taxi & cab services", href: "/categories/travel-taxi-and-cab-services" },
  { label: "Tempo traveller & bus", href: "/categories/travel-tempo-traveller-and-bus" },
  { label: "Hotels & resorts", href: "/categories/travel-hotels-and-resorts" },
  { label: "Homestays", href: "/categories/travel-homestays" },
  { label: "Visa & passport help", href: "/categories/travel-visa-and-passport" },
  { label: "Pilgrimage tours", href: "/categories/travel-pilgrimage-tours" },
  { label: "Car rentals", href: "/categories/travel-car-rentals" },
];

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

      <Card className="p-4 sm:p-5">
        <h2 className="mb-3 text-base font-bold text-slate-900">
          💺 Live fares to Delhi
        </h2>
        <TravelWidget variant="ticker" />
      </Card>

      <Card className="p-4 sm:p-5">
        <h2 className="mb-3 text-base font-bold text-slate-900">
          🛫 New York → Delhi flight schedule
        </h2>
        <TravelWidget variant="schedule" />
      </Card>

      <Card className="p-4 sm:p-5">
        <TravelWidget />
      </Card>

      <Card className="p-4 sm:p-5">
        <h2 className="mb-3 text-base font-bold text-slate-900">
          🗺️ Cheap flight deals on the map
        </h2>
        <TravelWidget variant="map" />
      </Card>

      <Card className="space-y-2 border-sky-200 bg-sky-50/60 p-4 sm:p-5">
        <h2 className="text-base font-bold text-slate-900">
          ✈️ Partner flight offers
        </h2>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <a
            href="https://www.dpbolvw.net/click-100712969-15754452"
            target="_top"
            rel="noopener noreferrer nofollow sponsored"
            className="text-sm font-semibold text-sky-900 underline decoration-sky-300 hover:text-indigo-700"
          >
            Flight deals you'll want on your radar
          </a>
          <a
            href="https://www.dpbolvw.net/click-100712969-15746170"
            target="_top"
            rel="noopener noreferrer nofollow sponsored"
            className="text-sm font-semibold text-sky-900 underline decoration-sky-300 hover:text-indigo-700"
          >
            Sale ends Jan 31: Book now for huge savings
          </a>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://www.tqlkg.com/image-100712969-15754452"
          width="1"
          height="1"
          alt=""
          aria-hidden
          className="inline-block h-px w-px"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://www.ftjcfx.com/image-100712969-15746170"
          width="1"
          height="1"
          alt=""
          aria-hidden
          className="inline-block h-px w-px"
        />
      </Card>

      <section className="space-y-5">
        <div className="text-center">
          <h2 className="text-xl font-black text-slate-900">
            More ways to travel &amp; save
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            eSIMs, airport pickups, car rentals and tours from our travel
            partners.
          </p>
        </div>
        {TRAVEL_PARTNER_GROUPS.map((group) => (
          <Card key={group.title} className="space-y-3">
            <h3 className="text-base font-bold text-slate-900">
              {group.emoji} {group.title}
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {group.partners.map((partner) => (
                <a
                  key={partner.name}
                  href={partner.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex gap-3 rounded-xl border border-slate-200 p-3 transition hover:border-indigo-300 hover:bg-indigo-50/50"
                >
                  <span className="text-2xl">{partner.emoji}</span>
                  <span>
                    <span className="block text-sm font-bold text-slate-900">
                      {partner.name}
                    </span>
                    <span className="mt-0.5 block text-xs leading-relaxed text-slate-600">
                      {partner.blurb}
                    </span>
                  </span>
                </a>
              ))}
            </div>
          </Card>
        ))}
      </section>

      <Card className="p-4 sm:p-5">
        <h2 className="mb-3 text-base font-bold text-slate-900">
          🗽 Popular tours &amp; activities
        </h2>
        <TravelWidget variant="tours" />
      </Card>

      <Card className="space-y-3">
        <h2 className="text-base font-bold text-slate-900">
          🧑‍🤝‍🧑 Travel services from the community
        </h2>
        <p className="text-sm text-slate-600">
          Desi travel agents, cab drivers, visa help and homestays near you —
          browse the Travel &amp; Transport listings or post your own service
          free.
        </p>
        <div className="flex flex-wrap gap-2">
          {COMMUNITY_SERVICES.map((service) => (
            <Link
              key={service.label}
              href={service.href}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
            >
              {service.label}
            </Link>
          ))}
        </div>
        <p className="text-xs text-slate-500">
          Offer travel services?{" "}
          <Link
            href="/signup"
            className="font-semibold text-indigo-700 underline"
          >
            List your business free
          </Link>{" "}
          and show up here.
        </p>
      </Card>

      <section className="space-y-3">
        <div className="flex items-end justify-between">
          <h2 className="text-xl font-black text-slate-900">Travel guides</h2>
          <Link
            href="/travel/guides"
            className="text-sm font-semibold text-indigo-700 hover:underline"
          >
            All guides →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {TRAVEL_GUIDES.map((guide) => (
            <Link key={guide.slug} href={`/travel/guides/${guide.slug}`}>
              <Card className="h-full transition hover:border-indigo-300 hover:shadow-md">
                <div className="text-2xl">{guide.emoji}</div>
                <h3 className="mt-2 text-sm font-bold text-slate-900">
                  {guide.title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  {guide.description}
                </p>
                <p className="mt-2 text-[11px] font-semibold text-indigo-600">
                  {guide.minutes} min read →
                </p>
              </Card>
            </Link>
          ))}
        </div>
      </section>

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
