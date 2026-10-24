import type { Metadata } from "next";
import Link from "next/link";
import { pixelWallBlocks } from "@/lib/banners";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Alert } from "@/components/ui";
import { PixelWall } from "@/components/PixelWall";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "GoDesi Wall of Fame — a million pixels, $1 a pixel",
  description:
    "The desi Million Dollar Homepage: drag a box over a million pixels, upload your banner and own the spot forever — $1 a pixel, 4 pixels minimum. The more you buy, the higher you rank.",
  alternates: { canonical: "/walloffame" },
};

const TOTAL_PX = 1_000_000;
const PRICE = 1;

const STEPS = [
  {
    icon: "🧱",
    title: "Drag & pick your bricks",
    body: `250,000 bricks of 4 pixels each at $${PRICE * 4} a brick — drag a whole block and dominate the wall. The green free zone is $0.`,
  },
  {
    icon: "🏆",
    title: "Early birds sit higher",
    body: "Spots are first come, best placed — and the vendor list ranks by pixels owned, so the bigger your buy the higher you sit.",
  },
  {
    icon: "📣",
    title: "Get seen everywhere",
    body: "Your art stretches over every pixel you bought, clickable by every visitor — the desi million-dollar homepage.",
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
        where: { userId: user.id, wallBlockId: { not: null }, amountMinor: 0 },
        select: { id: true },
      }))
    : false;

  const taken = blocks.reduce((sum, block) => sum + block.w * block.h, 0);

  /** Vendor list: rank by total pixels owned (more paid = higher). */
  const vendors = new Map<string, { name: string; href: string; pixels: number }>();
  for (const block of blocks) {
    const name = block.advertiser?.name ?? block.title;
    const key = `${name}|${block.linkUrl}`;
    const entry = vendors.get(key) ?? { name, href: block.linkUrl, pixels: 0 };
    entry.pixels += block.w * block.h;
    vendors.set(key, entry);
  }
  const board = Array.from(vendors.values())
    .sort((a, b) => b.pixels - a.pixels)
    .slice(0, 50);

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500 via-rose-500 to-fuchsia-600 px-5 py-8 text-white sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-white/80">
          🏆 The GoDesi Wall of Fame
        </p>
        <h1 className="mt-2 text-3xl font-black sm:text-4xl">
          250,000 bricks. ${PRICE * 4} a brick. Own your spot 🧱
        </h1>
        <p className="mt-3 max-w-2xl text-white/90">
          The desi Million Dollar Homepage: drag a box over the board, upload
          your banner and book today —{" "}
          {Math.floor(taken / 4).toLocaleString()} of{" "}
          {Math.floor(TOTAL_PX / 4).toLocaleString()} bricks taken so far.
          <span className="font-black"> Free right now</span> — grab a spot in
          the green free zone or enter the code <b>godesi.com</b> at checkout.
          Early birds get the best spots, and the biggest buyers sit on top of
          the vendor list.
        </p>
      </section>

      {searchParams.paid ? (
        <Alert tone="success">
          🎉 Payment received — your pixels are live on the wall!
        </Alert>
      ) : null}
      {searchParams.error === "cancelled" ? (
        <Alert>Checkout was cancelled — your pixels were not booked.</Alert>
      ) : null}
      {searchParams.free ? (
        <Alert tone="success">
          🎉 Your free block is live on the wall — welcome to the Wall of Fame!
        </Alert>
      ) : null}

      <PixelWall blocks={blocks} priceUsd={PRICE} hasFreeBlock={hasFreeBlock} />

      {board.length ? (
        <section className="rounded-3xl border border-amber-200 bg-white p-4 sm:p-5">
          <h2 className="text-lg font-black text-slate-900">
            🏅 The Wall of Fame — vendor list
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Ranked by pixels owned — buy more, climb higher.
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
                  <span className="min-w-0 flex-1 truncate font-bold text-slate-900">
                    {vendor.name}
                  </span>
                  <span className="shrink-0 rounded-full bg-amber-200/70 px-2.5 py-0.5 text-xs font-black text-amber-800">
                    {vendor.pixels.toLocaleString()} px
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
