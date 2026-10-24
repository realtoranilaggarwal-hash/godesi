import type { Metadata } from "next";
import Link from "next/link";
import { wallBanners } from "@/lib/banners";
import { AD_PLACEMENTS } from "@/lib/ads";
import { LinkButton } from "@/components/ui";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "The GoDesi Wall — own a square on desi's biggest board",
  description:
    "Book your spot on the GoDesi Wall. One tile puts your logo in front of every visitor — and every tile you book also rotates into the banner rail across the whole site. More spots, more of you.",
  alternates: { canonical: "/wall" },
};

const TOTAL_SPOTS = AD_PLACEMENTS.WALL.slots;

/** Rainbow cell cycle so empty spots still read as a festive board. */
const EMPTY_TINTS = [
  "border-amber-300 bg-amber-50 text-amber-700",
  "border-rose-300 bg-rose-50 text-rose-700",
  "border-orange-300 bg-orange-50 text-orange-700",
  "border-emerald-300 bg-emerald-50 text-emerald-700",
  "border-sky-300 bg-sky-50 text-sky-700",
  "border-violet-300 bg-violet-50 text-violet-700",
  "border-fuchsia-300 bg-fuchsia-50 text-fuchsia-700",
  "border-teal-300 bg-teal-50 text-teal-700",
];

const STEPS = [
  {
    icon: "🧱",
    title: "Pick your spots",
    body: "One spot = one tile on the wall. Book a single tile or a whole block — prices on the ads page.",
  },
  {
    icon: "👀",
    title: "Get seen on the wall",
    body: "Your logo sits on the wall for every visitor — in booking order, so early spots sit top-left.",
  },
  {
    icon: "📣",
    title: "Get seen everywhere",
    body: "Every tile you book also rotates into the small-banner rail on every page of GoDesi. More spots = more of you.",
  },
];

export default async function WallPage() {
  const banners = await wallBanners();
  const taken = Math.min(banners.length, TOTAL_SPOTS);

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500 via-rose-500 to-fuchsia-600 px-5 py-8 text-white sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-white/80">
          The GoDesi Wall
        </p>
        <h1 className="mt-2 text-3xl font-black sm:text-4xl">
          Own a square on desi&apos;s biggest board 🧱
        </h1>
        <p className="mt-3 max-w-2xl text-white/90">
          Like the famous million-dollar wall — desi style. Every tile is a
          business that booked its spot. Yours can be next:{" "}
          {taken} of {TOTAL_SPOTS} spots taken so far.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <LinkButton href="/pricing" variant="secondary">
            Book your spot — pricing
          </LinkButton>
          <Link
            href="/search"
            className="rounded-xl border border-white/60 px-4 py-2 text-sm font-semibold hover:bg-white/10"
          >
            Browse businesses
          </Link>
        </div>
      </section>

      <section
        aria-label="The wall"
        className="rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-rose-50 p-4 sm:p-6"
      >
        <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-6 sm:gap-2 md:grid-cols-8 lg:grid-cols-12">
          {Array.from({ length: TOTAL_SPOTS }).map((_, index) => {
            const banner = banners[index];
            if (banner) {
              return (
                <a
                  key={banner.id}
                  href={`/api/banners/${banner.id}/click`}
                  target="_blank"
                  rel="noreferrer sponsored"
                  title={banner.title}
                  className="group relative aspect-[8/5] overflow-hidden rounded-lg border-2 border-amber-300 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={banner.imageUrl}
                    alt={banner.title}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </a>
              );
            }
            const tint = EMPTY_TINTS[index % EMPTY_TINTS.length];
            return (
              <Link
                key={`open-${index}`}
                href="/pricing"
                title={`Spot ${index + 1} — book it on the ads page`}
                className={`flex aspect-[8/5] items-center justify-center rounded-lg border-2 border-dashed text-center text-[9px] font-bold uppercase tracking-wide opacity-70 transition hover:opacity-100 hover:shadow-sm ${tint}`}
              >
                <span>
                  {index + 1}
                  <span className="mt-0.5 hidden font-semibold normal-case tracking-normal sm:block">
                    Your logo
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </section>

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
    </div>
  );
}
