import type { Metadata } from "next";
import Link from "next/link";
import { wallAvailability } from "@/lib/banners";
import { AD_PLACEMENTS } from "@/lib/ads";
import { Alert } from "@/components/ui";
import { WallBoard } from "@/components/WallBoard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "GoDesi Wall of Fame — $1 a brick, book your spot today",
  description:
    "Drag and pick your bricks on the GoDesi Wall of Fame — $1 a brick, yours for good. Every brick also rotates into the banner rail on every page. Early birds get the best spots.",
  alternates: { canonical: "/walloffame" },
};

const TOTAL = AD_PLACEMENTS.WALL.slots;
const PRICE = AD_PLACEMENTS.WALL.priceUsd;

const STEPS = [
  {
    icon: "🧱",
    title: "Drag & pick your bricks",
    body: `Every brick is $${PRICE} — grab one to be listed, or drag a whole block and dominate the wall.`,
  },
  {
    icon: "🏆",
    title: "Early birds sit higher",
    body: "Bricks are booked in pick order and the vendor list ranks by bricks owned — the more you buy, the higher you sit.",
  },
  {
    icon: "📣",
    title: "Get seen everywhere",
    body: "Every brick you own also rotates into the small-banner rail on every page of GoDesi. More bricks = more of you all over.",
  },
];

export default async function WallOfFamePage({
  searchParams,
}: {
  searchParams: { paid?: string; error?: string };
}) {
  const banners = await wallAvailability();
  const byPosition = new Map(banners.map((b) => [b.position, b]));

  const bricks = Array.from({ length: TOTAL }, (_, i) => {
    const n = i + 1;
    const banner = byPosition.get(n);
    if (!banner) return { n, state: "free" as const };
    return {
      n,
      state: banner.status === "ACTIVE" ? ("live" as const) : ("reserved" as const),
      title: banner.title,
      imageUrl: banner.imageUrl,
      linkUrl: banner.linkUrl,
      bannerId: banner.id,
    };
  });

  const taken = bricks.filter((brick) => brick.state !== "free").length;

  /** Vendor leaderboard: rank by bricks owned (more paid = higher). */
  const vendors = new Map<string, { name: string; href: string; count: number }>();
  for (const banner of banners) {
    const name = banner.advertiser?.name ?? banner.title;
    const key = `${name}|${banner.linkUrl}`;
    const entry = vendors.get(key) ?? { name, href: banner.linkUrl, count: 0 };
    entry.count += 1;
    vendors.set(key, entry);
  }
  const board = Array.from(vendors.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500 via-rose-500 to-fuchsia-600 px-5 py-8 text-white sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-white/80">
          🏆 The GoDesi Wall of Fame
        </p>
        <h1 className="mt-2 text-3xl font-black sm:text-4xl">
          $1 a brick. Drag, pick, book — your spot is yours 🧱
        </h1>
        <p className="mt-3 max-w-2xl text-white/90">
          Desi-style million-dollar wall: drag across the free bricks below,
          upload your banner and book today.{" "}
          {taken} of {TOTAL} bricks already taken — early birds get the best
          spots, and every brick also shows in the banner rail across GoDesi.
        </p>
      </section>

      {searchParams.paid ? (
        <Alert tone="success">
          🎉 Payment received — your bricks are booked! They go live on the wall
          as soon as we approve the artwork (usually same day).
        </Alert>
      ) : null}
      {searchParams.error === "cancelled" ? (
        <Alert>Checkout was cancelled — your bricks were not booked.</Alert>
      ) : null}

      <WallBoard bricks={bricks} priceUsd={PRICE} />

      {board.length ? (
        <section className="rounded-3xl border border-amber-200 bg-white p-4 sm:p-5">
          <h2 className="text-lg font-black text-slate-900">
            🏅 Wall of Fame — the vendors on the board
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Ranked by bricks owned — buy more, climb higher.
          </p>
          <ol className="mt-3 grid gap-2 sm:grid-cols-2">
            {board.map((vendor, index) => (
              <li key={`${vendor.name}-${vendor.href}`}>
                <a
                  href={vendor.href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-gradient-to-r from-amber-50 to-rose-50 px-3 py-2 transition hover:-translate-y-0.5 hover:shadow-sm"
                >
                  <span className="text-lg font-black text-slate-400">
                    {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`}
                  </span>
                  <span className="min-w-0 flex-1 truncate font-bold text-slate-900">
                    {vendor.name}
                  </span>
                  <span className="shrink-0 rounded-full bg-amber-200/70 px-2 py-0.5 text-xs font-black text-amber-800">
                    {vendor.count} 🧱
                  </span>
                </a>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-3">
        {STEPS.map((step) => (
          <div
            key={step.title}
            className="rounded-2xl border border-rose-100 bg-gradient-to-b from-white to-rose-50/60 p-4 shadow-sm"
          >
            <p className="text-2xl">{step.icon}</p>
            <p className="mt-1 font-bold text-slate-900">{step.title}</p>
            <p className="mt-1 text-sm text-slate-600">{step.body}</p>
          </div>
        ))}
      </section>

      <p className="text-center text-sm text-slate-500">
        Prefer a bigger banner instead?{" "}
        <Link href="/advertise" className="font-semibold text-indigo-600 hover:underline">
          See all ad options →
        </Link>
      </p>
    </div>
  );
}
