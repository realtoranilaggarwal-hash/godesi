import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCategoryTree } from "@/lib/directory";
import { gradientFor } from "@/lib/categories";
import { Card } from "@/components/ui";
import { PostingSidebar } from "@/components/PostingSidebar";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Post your business or service",
  description:
    "Add a business, a professional profile, an event, a property or a requirement.",
};

const PROFESSIONALS_SLUG = "professionals";

type PostType =
  | "business"
  | "professional"
  | "event"
  | "property"
  | "marketplace"
  | "requirement"
  | "report"
  | "worship"
  | "connect";

const TYPES: {
  id: PostType;
  label: string;
  icon: string;
  blurb: string;
  gradient: string;
  /** Types with a single form skip step 2 and go straight there. */
  href?: string;
  cta: string;
}[] = [
  {
    id: "business",
    label: "Business",
    icon: "🏪",
    blurb: "Shop, restaurant, agency or service company",
    gradient: "from-orange-500 to-rose-500",
    cta: "Start",
  },
  {
    id: "professional",
    label: "Professional",
    icon: "🎓",
    blurb: "Real estate agent, attorney, accountant, consultant…",
    gradient: "from-cyan-500 to-sky-500",
    cta: "Start",
  },
  {
    id: "event",
    label: "Event",
    icon: "🎟️",
    blurb: "Mela, concert, workshop or community meet",
    gradient: "from-fuchsia-500 to-pink-500",
    cta: "Start",
  },
  {
    id: "property",
    label: "Property / Room",
    icon: "🏢",
    blurb: "Sell, rent or share a home or a room",
    gradient: "from-emerald-500 to-teal-500",
    cta: "Start",
  },
  {
    id: "marketplace",
    label: "Buy & Sell",
    icon: "🛍️",
    blurb: "Jewellery, clothes, furniture, electronics or anything else",
    gradient: "from-lime-500 to-emerald-600",
    href: "/listings/new?kind=MARKETPLACE",
    cta: "Sell something",
  },
  {
    id: "requirement",
    label: "Requirement",
    icon: "📋",
    blurb: "Tell vendors what you need and get quotes",
    gradient: "from-indigo-500 to-violet-500",
    cta: "Post a requirement",
  },
  {
    id: "report",
    label: "News / Report",
    icon: "📰",
    blurb: "Report local news from your area as a Godesi journalist",
    gradient: "from-amber-500 to-orange-600",
    cta: "Report news",
  },
  {
    id: "worship",
    label: "Temple / Place of worship",
    icon: "🛕",
    blurb: "Temple, gurudwara, mosque or church in your city",
    gradient: "from-yellow-500 to-amber-600",
    href: "/religious/new",
    cta: "Add a place",
  },
  {
    id: "connect",
    label: "Connect",
    icon: "🤝",
    blurb: "Meet desi friends nearby — walks, chai, cricket, study groups",
    gradient: "from-sky-500 to-indigo-600",
    href: "/connect/new",
    cta: "Create a profile",
  },
];

const PROPERTY_KINDS = [
  { kind: "PROPERTY_SALE", label: "Property for sale", icon: "🏠" },
  { kind: "PROPERTY_RENT", label: "Property for rent", icon: "🔑" },
  { kind: "ROOM_OFFERED", label: "Room available", icon: "🛏️" },
  { kind: "ROOM_WANTED", label: "Looking for a room", icon: "🔎" },
  { kind: "MARKETPLACE", label: "Something to sell", icon: "🛍️" },
];

function Step({
  n,
  total,
  title,
}: {
  n: number;
  total: number;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
      <span className="rounded-full bg-slate-900 px-2 py-0.5 text-xs text-white">
        Step {n} of {total}
      </span>
      <span>{title}</span>
    </div>
  );
}

function Tile({
  href,
  icon,
  label,
  blurb,
  gradient,
  cta = "Continue",
}: {
  href: string;
  icon: string;
  label: string;
  blurb?: string;
  gradient?: string;
  /** Every tile says what tapping it does — the card alone reads as decoration. */
  cta?: string;
}) {
  return (
    <Link
      href={href}
      className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <span
        className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r ${
          gradient ?? "from-slate-700 to-slate-900"
        } text-lg`}
        aria-hidden
      >
        {icon}
      </span>
      <p className="mt-2 font-bold text-slate-900">{label}</p>
      {blurb ? <p className="text-sm text-slate-600">{blurb}</p> : null}
      {/* Pushed down so every card in a row ends on the same line. */}
      <span className="mt-auto pt-3">
        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-600 px-3 py-1 text-xs font-bold text-white">
          {cta} →
        </span>
      </span>
    </Link>
  );
}

/**
 * Guided "post anything" flow: pick what you are posting, pick the category,
 * then land on the existing form with the category already selected.
 */
export default async function PostPage({
  searchParams,
}: {
  searchParams: { type?: string; category?: string };
}) {
  const selected = TYPES.find((item) => item.id === searchParams.type);
  // Types with one obvious form have no second step.
  if (selected?.href) redirect(selected.href);
  const type = selected?.id;
  if (type === "report") redirect("/news/report");

  const categories = await getCategoryTree();

  return (
    <div className="flex justify-center gap-6">
      <div className="min-w-0 max-w-4xl flex-1 space-y-4">
        <div>
          <h1 className="text-2xl font-bold">Post on Godesi ✨</h1>
          <p className="text-sm text-slate-600">
            Free to post. Two quick steps and your listing is live for the
            community.
          </p>
        </div>

        {!type ? (
          <Card className="space-y-3">
            <Step n={1} total={2} title="What are you posting?" />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {TYPES.map((item) => (
                <Tile
                  key={item.id}
                  href={item.href ?? `/post?type=${item.id}`}
                  icon={item.icon}
                  label={item.label}
                  blurb={item.blurb}
                  gradient={item.gradient}
                  cta={item.cta}
                />
              ))}
            </div>
            <p className="text-sm text-slate-500">
              Know what you want?{" "}
              <Link
                href="/dashboard/profile"
                className="font-semibold text-indigo-600 hover:underline"
              >
                Go straight to my business card form
              </Link>{" "}
              ·{" "}
              <Link
                href="/listings/new"
                className="font-semibold text-indigo-600 hover:underline"
              >
                new listing
              </Link>{" "}
              ·{" "}
              <Link
                href="/events/new"
                className="font-semibold text-indigo-600 hover:underline"
              >
                new event
              </Link>
            </p>
          </Card>
        ) : (
          <Card className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Step
                n={2}
                total={2}
                title={
                  type === "property"
                    ? "What kind of listing?"
                    : "Pick the category"
                }
              />
              <Link
                href="/post"
                className="text-sm font-semibold text-indigo-600 hover:underline"
              >
                ← Change type
              </Link>
            </div>

            {type === "property" ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {PROPERTY_KINDS.map((item) => (
                  <Tile
                    key={item.kind}
                    href={`/listings/new?kind=${item.kind}`}
                    icon={item.icon}
                    label={item.label}
                    cta="Post this"
                    gradient="from-emerald-500 to-teal-500"
                  />
                ))}
              </div>
            ) : type === "professional" ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {(
                  categories.find((item) => item.slug === PROFESSIONALS_SLUG)
                    ?.children ?? []
                ).map((child) => (
                  <Tile
                    key={child.slug}
                    href={`/dashboard/profile?type=professional&category=${PROFESSIONALS_SLUG}&subcategory=${child.slug}`}
                    icon="🎓"
                    label={child.name}
                    cta="Create my profile"
                    gradient="from-cyan-500 to-sky-500"
                  />
                ))}
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {categories.map((category) => (
                  <Tile
                    key={category.slug}
                    href={
                      type === "event"
                        ? `/events/new?category=${category.slug}`
                        : type === "requirement"
                          ? `/leads/new?category=${category.slug}`
                          : `/dashboard/profile?type=business&category=${category.slug}`
                    }
                    icon={category.icon}
                    label={category.name}
                    cta={
                      type === "event"
                        ? "Create event"
                        : type === "requirement"
                          ? "Post requirement"
                          : "Create my card"
                    }
                    gradient={gradientFor(category.color)}
                  />
                ))}
              </div>
            )}

            {type === "event" || type === "requirement" ? (
              <p className="text-sm text-slate-500">
                Not sure?{" "}
                <Link
                  href={type === "event" ? "/events/new" : "/leads/new"}
                  className="font-semibold text-indigo-600 hover:underline"
                >
                  Skip and pick it in the form
                </Link>
                .
              </p>
            ) : null}
          </Card>
        )}
      </div>

      <PostingSidebar />
    </div>
  );
}
