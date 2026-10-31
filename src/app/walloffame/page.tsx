import type { Metadata } from "next";
import Link from "next/link";
import { pixelWallBlocks } from "@/lib/banners";
import { getCurrentUser } from "@/lib/auth";
import { wallet } from "@/lib/rewardsQueries";
import { wallCreditMinor } from "@/lib/adOrders";
import { requestCurrency } from "@/lib/currency";
import { db } from "@/lib/db";
import { Alert } from "@/components/ui";
import { PixelWall } from "@/components/PixelWall";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "GoDesi Wall of Fame — 10,000 desi bricks, $10 a brick",
  description:
    "The desi Million Dollar Homepage: drag a box over the wall, upload your banner and own the spot forever — $10 a desi brick, each a visible 10x10 mini banner. The more you buy, the higher you rank.",
  alternates: { canonical: "/walloffame" },
};

const TOTAL_PX = 1_000_000;
const PRICE = 0.1; // $0.10 a pixel — $10 per 10x10 brick
const BRICK_USD = 10;

const STEPS = [
  {
    icon: "🧱",
    title: "Drag & pick your bricks",
    body: `10,000 desi bricks at $${BRICK_USD} a brick — each a crisp 10x10 mini banner you can actually see. Drag a whole block and dominate the wall. The green free zone is $0.`,
  },
  {
    icon: "🏆",
    title: "Early birds sit higher",
    body: "Spots are first come, best placed — and the vendor list ranks by desi bricks owned, so the bigger your buy the higher you sit.",
  },
  {
    icon: "📣",
    title: "Get seen everywhere",
    body: "Your art stretches over every desi brick you bought, clickable by every visitor — the desi million-dollar homepage.",
  },
];

export default async function WallOfFamePage({
  searchParams,
}: {
  searchParams: { paid?: string; error?: string; free?: string };
}) {
  const blocks = await pixelWallBlocks();
  const user = await getCurrentUser();
  const hasFreeBlock = user
    ? !!(await db.adOrder.findFirst({
        where: { userId: user.id, wallBlockId: { not: null }, provider: "free" },
        select: { id: true },
      }))
    : false;
  const pointsBalance = user ? (await wallet(user.id)).balance : 0;
  // Preview credit in dollars (or ₹): each dollar covers 10 px of the wall.
  const currency = requestCurrency();
  const creditUsd = user
    ? (await wallCreditMinor(user.id, currency)) /
      (currency === "INR" ? 8500 : 100)
    : 0;

  const taken = blocks.reduce((sum, block) => sum + block.w * block.h, 0);

  /** Vendor list: one row per member — all their blocks merged, ranked by
   * total desi bricks. Category + points come from their card and wallet. */
  const vendors = new Map<
    string,
    {
      userId: string | null;
      name: string;
      href: string;
      pixels: number;
      desc: string | null;
    }
  >();
  for (const block of blocks) {
    if (block.status !== "ACTIVE") continue;
    const name = block.advertiser?.name ?? block.title;
    const key = block.advertiserId ?? `${name}|${block.linkUrl}`;
    const entry =
      vendors.get(key) ?? {
        userId: block.advertiserId,
        name,
        href: block.linkUrl,
        pixels: 0,
        desc: null,
      };
    entry.pixels += block.w * block.h;
    if (!entry.desc && block.description) entry.desc = block.description;
    vendors.set(key, entry);
  }

  const vendorIds = Array.from(vendors.values())
    .map((v) => v.userId)
    .filter((id): id is string => !!id);
  const [cards, pointsByUser] = await Promise.all([
    db.business.findMany({
      where: { ownerId: { in: vendorIds } },
      select: { ownerId: true, category: true },
    }),
    db.pointsEntry.groupBy({
      by: ["userId"],
      where: { userId: { in: vendorIds } },
      _sum: { points: true },
    }),
  ]);
  const categoryByUser = new Map(
    cards.map((card) => [card.ownerId, card.category]),
  );
  const walletByUser = new Map(
    pointsByUser.map((row) => [row.userId, row._sum.points ?? 0]),
  );

  const board = Array.from(vendors.values())
    .map((vendor) => ({
      ...vendor,
      category: vendor.userId
        ? (categoryByUser.get(vendor.userId) ?? "Founding member")
        : null,
      points: vendor.userId ? (walletByUser.get(vendor.userId) ?? 0) : null,
    }))
    .sort((a, b) => b.pixels - a.pixels)
    .slice(0, 50);

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500 via-rose-500 to-fuchsia-600 px-5 py-8 text-white sm:px-8">
        <div className="grid items-center gap-6 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/80">
              🏆 The GoDesi Wall of Fame
            </p>
            <h1 className="mt-2 text-3xl font-black sm:text-4xl">
              10,000 bricks. $10 a brick. Yours for life 🧱
            </h1>
            <p className="mt-3 text-white/90">
              The desi Million Dollar Homepage: one payment and your brick stays
              on the wall for life — no renewals, ever. Drag a box over the
              board, upload your banner and book today —{" "}
              {Math.floor(taken / 100).toLocaleString()} of{" "}
              {Math.floor(TOTAL_PX / 100).toLocaleString()} bricks taken so far.
            </p>
            <p className="mt-2 text-sm font-bold text-amber-100">
              Free right now — grab a brick in the green free zone or use the
              code <b>FREE4</b> for one brick anywhere (free bricks go live
              after a quick review). Members can also spend 100 points for a
              brick, and every ad dollar converts to wall credit.
            </p>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/wall-hero.jpg"
            alt="Desi community building the GoDesi.com wall, brick by brick"
            className="w-full rounded-2xl border-4 border-white/30 shadow-2xl"
          />
        </div>
      </section>

      {searchParams.paid ? (
        <Alert tone="success">
          🎉 Payment received — your desi bricks are live on the wall!
        </Alert>
      ) : null}
      {searchParams.error === "cancelled" ? (
        <Alert>
          Checkout was cancelled — your desi bricks were not booked.
        </Alert>
      ) : null}
      {searchParams.free ? (
        <Alert tone="success">
          🎉 Free brick booked — it shows on the wall after a quick review
          (usually same day). Welcome to the Wall of Fame!
        </Alert>
      ) : null}

      <section className="rounded-3xl border border-emerald-200 bg-emerald-50/70 p-4 sm:p-5">
        <h2 className="text-base font-black text-slate-900">
          🎁 Three ways to get a free brick
        </h2>
        <ol className="mt-2 grid gap-2 text-sm text-slate-700 sm:grid-cols-3">
          <li className="rounded-xl bg-white/80 px-3 py-2">
            <b>1 · Free zone</b> — one free 10x10 brick per member in the green
            band at the bottom of the board.
          </li>
          <li className="rounded-xl bg-white/80 px-3 py-2">
            <b>2 · Code FREE4</b> — one free brick anywhere on the board.
            Share it — it&apos;s public.
          </li>
          <li className="rounded-xl bg-white/80 px-3 py-2">
            <b>3 · 100 points</b> — members trade 100 points for a brick
            anywhere{user ? ` (you have ${pointsBalance.toLocaleString()} pts)` : ""}.
            New members start with 50 — earn more by posting, reviewing, referring.
          </li>
        </ol>
        {user && !hasFreeBlock ? (
          <p className="mt-2 text-xs font-bold text-emerald-800">
            You haven&apos;t claimed your free brick yet — drag a box on the board
            and pick any of the three ways above.
          </p>
        ) : null}
      </section>

      <PixelWall
        blocks={blocks}
        priceUsd={PRICE}
        hasFreeBlock={hasFreeBlock}
        creditUsd={creditUsd}
        pointsBalance={pointsBalance}
        signedIn={!!user}
      />

      {board.length ? (
        <section className="rounded-3xl border border-amber-200 bg-white p-4 sm:p-5">
          <h2 className="text-lg font-black text-slate-900">
            🏅 The Wall of Fame — vendor list
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Ranked by desi bricks owned — buy more, climb higher.
          </p>
          <ol className="mt-3 divide-y divide-slate-100">
            {board.map((vendor, index) => (
              <li key={`${vendor.name}-${vendor.href}`}>
                <a
                  href={vendor.href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 px-2 py-2.5 transition hover:bg-amber-50"
                >
                  <span className="w-8 text-lg font-black text-slate-400">
                    {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}.`}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate font-bold text-slate-900">
                        {vendor.name}
                      </span>
                      {vendor.category ? (
                        <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                          {vendor.category}
                        </span>
                      ) : null}
                    </span>
                    {vendor.desc ? (
                      <span className="mt-0.5 line-clamp-2 block text-xs font-normal text-slate-500">
                        {vendor.desc}
                      </span>
                    ) : null}
                  </span>
                  <span className="flex shrink-0 flex-col items-end gap-1">
                    <span className="rounded-full bg-amber-200/70 px-2.5 py-0.5 text-xs font-black text-amber-800">
                      {Math.floor(vendor.pixels / 100).toLocaleString()} bricks
                    </span>
                    {vendor.points !== null ? (
                      <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-[10px] font-black text-indigo-700">
                        {vendor.points.toLocaleString()} pts
                      </span>
                    ) : null}
                  </span>
                  <span className="shrink-0 text-sm font-semibold text-indigo-600">
                    Visit →
                  </span>
                </a>
              </li>
            ))}
          </ol>
        </section>
      ) : (
        <section className="rounded-3xl border border-dashed border-amber-300 bg-amber-50/50 p-5 text-center">
          <p className="text-sm font-semibold text-amber-800">
            🥇 No vendors yet — be the first name on the Wall of Fame list.
          </p>
        </section>
      )}

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
