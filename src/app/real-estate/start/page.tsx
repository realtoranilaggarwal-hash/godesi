import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui";
import {
  PROPERTY_GROUPS,
  PROPERTY_GROUP_EMOJI,
  PROPERTY_GROUP_LABELS,
  PROPERTY_TYPES,
} from "@/lib/property";

export const metadata: Metadata = {
  title: "Buy, sell or rent property — start here",
  description:
    "Tell us what you want to do and Godesi takes you straight there: buy a home, rent one, sell yours or list property as an owner, agent or builder.",
  alternates: { canonical: "/real-estate/start" },
};

const INTENTS = [
  {
    id: "buy",
    emoji: "🔍",
    title: "Buy property",
    body: "Homes, shops and plots for sale — filter by city, budget, BHK and amenities.",
    tone: "from-indigo-500 to-violet-600",
  },
  {
    id: "rent",
    emoji: "🔑",
    title: "Rent property",
    body: "Flats, PGs and offices to rent, with deposit, furnishing and tenant rules up front.",
    tone: "from-emerald-500 to-teal-600",
  },
  {
    id: "sell",
    emoji: "🏷️",
    title: "Sell property",
    body: "List your home, shop or plot for sale. Free, and buyers reach you on WhatsApp.",
    tone: "from-orange-500 to-rose-600",
  },
  {
    id: "list",
    emoji: "🏢",
    title: "List for rent",
    body: "Owners, agents and builders: put a rental on Godesi in a couple of minutes.",
    tone: "from-fuchsia-500 to-pink-600",
  },
] as const;

/** Step 2 for the two selling flows: which branch of the property tree. */
function GroupChoice({ kind, heading }: { kind: string; heading: string }) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-black">{heading}</h1>
        <p className="text-sm text-slate-600">
          Pick the closest one — the form then asks only what matters for it.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {PROPERTY_GROUPS.map((group) => (
          <Link
            key={group}
            href={`/listings/new?kind=${kind}&group=${group}`}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md"
          >
            <p className="text-3xl">{PROPERTY_GROUP_EMOJI[group]}</p>
            <p className="mt-1 font-bold">{PROPERTY_GROUP_LABELS[group]}</p>
            <p className="mt-1 text-sm text-slate-600">
              {PROPERTY_TYPES[group]
                .slice(0, 4)
                .map((type) => type.label)
                .join(" · ")}
            </p>
          </Link>
        ))}
      </div>
      <p className="text-sm text-slate-500">
        <Link href="/real-estate/start" className="font-semibold text-indigo-600">
          ← Back
        </Link>
      </p>
    </div>
  );
}

export default function PropertyStartPage({
  searchParams,
}: {
  searchParams: { do?: string };
}) {
  const intent = searchParams.do;
  if (intent === "buy") redirect("/real-estate?kind=PROPERTY_SALE");
  if (intent === "rent") redirect("/real-estate?kind=PROPERTY_RENT");
  if (intent === "sell")
    return (
      <div className="mx-auto max-w-3xl">
        <GroupChoice kind="PROPERTY_SALE" heading="What are you selling?" />
      </div>
    );
  if (intent === "list")
    return (
      <div className="mx-auto max-w-3xl">
        <GroupChoice kind="PROPERTY_RENT" heading="What are you renting out?" />
      </div>
    );

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <section className="rounded-3xl bg-gradient-to-r from-orange-500 via-rose-500 to-fuchsia-600 px-5 py-8 text-white sm:px-8">
        <h1 className="text-3xl font-black">What do you want to do?</h1>
        <p className="mt-1 text-white/90">
          Godesi property — homes, shops, plots and new projects across India and
          the USA, listed by owners, agents and builders in our community.
        </p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        {INTENTS.map((option) => (
          <Link
            key={option.id}
            href={`/real-estate/start?do=${option.id}`}
            className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div
              className={`flex items-center gap-3 bg-gradient-to-r ${option.tone} px-4 py-3 text-white`}
            >
              <span className="text-2xl">{option.emoji}</span>
              <span className="text-lg font-bold">{option.title}</span>
            </div>
            <p className="p-4 text-sm text-slate-600">{option.body}</p>
          </Link>
        ))}
      </div>

      <Card>
        <h2 className="font-bold">Also on Godesi property</h2>
        <ul className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
          <li>
            <Link href="/real-estate?nri=1" className="font-semibold text-indigo-600">
              🌏 NRI property listings
            </Link>
          </li>
          <li>
            <Link href="/real-estate?deal=1" className="font-semibold text-indigo-600">
              📈 Investment deals
            </Link>
          </li>
          <li>
            <Link href="/rooms" className="font-semibold text-indigo-600">
              🛏️ Rooms, PG and flatmates
            </Link>
          </li>
          <li>
            <Link
              href="/real-estate?by=AGENT"
              className="font-semibold text-indigo-600"
            >
              ✅ Desi verified agents
            </Link>
          </li>
        </ul>
      </Card>
    </div>
  );
}
