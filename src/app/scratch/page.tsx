import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { wallet } from "@/lib/rewardsQueries";
import {
  GIFT_CLAIM_LABELS,
  SCRATCH_DAILY_LIMIT,
  giftSelect,
  liveGiftWhere,
  scratchCost,
} from "@/lib/scratch";
import { ScratchGame } from "@/components/ScratchGame";
import { Badge, Card, LinkButton } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Scratch & win",
  description:
    "Trade your GoDesi points for a scratch card and win free gifts from local desi businesses or bonus points.",
};

export default async function ScratchPage() {
  const user = await getCurrentUser();
  const [cost, gifts, balance, prizes] = await Promise.all([
    scratchCost(),
    db.scratchGift.findMany({
      where: liveGiftWhere(),
      select: giftSelect,
      orderBy: { createdAt: "desc" },
      take: 24,
    }),
    user ? wallet(user.id).then((w) => w.balance) : 0,
    user
      ? db.scratchCard.findMany({
          where: { userId: user.id, prize: "gift" },
          orderBy: { createdAt: "desc" },
          take: 20,
          include: { gift: { select: giftSelect } },
        })
      : [],
  ]);
  const open = gifts.filter((gift) => gift.wonCount < gift.quantity);

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="rounded-3xl bg-gradient-to-br from-amber-500 via-rose-500 to-fuchsia-600 p-5 text-white">
        <h1 className="text-3xl font-black">🎟️ Scratch &amp; win</h1>
        <p className="mt-1 text-white/90">
          Trade {cost} points for a scratch card. Win free gifts from local desi
          businesses or bonus points. Up to {SCRATCH_DAILY_LIMIT} cards a day.
        </p>
      </div>

      <Card className="space-y-3">
        {user ? (
          <>
            <p className="text-center text-sm text-slate-600">
              You have <b>{balance} points</b>.
            </p>
            <ScratchGame cost={cost} balance={balance} />
          </>
        ) : (
          <div className="text-center">
            <p className="mb-2 text-slate-700">
              Log in to scratch your first card.
            </p>
            <LinkButton href="/login?next=/scratch">Log in</LinkButton>{" "}
            <LinkButton href="/signup?next=/scratch" variant="secondary">
              Join free
            </LinkButton>
          </div>
        )}
      </Card>

      {prizes.length ? (
        <Card className="space-y-2">
          <h2 className="text-lg font-bold">🎁 My prizes</h2>
          {prizes.map((card) => (
            <div
              key={card.id}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 p-3 text-sm"
            >
              <div className="min-w-0 flex-1">
                <p className="font-semibold">
                  {card.gift?.title ?? "Gift"} ·{" "}
                  {card.gift ? (
                    <Link
                      href={`/b/${card.gift.business.slug}`}
                      className="text-indigo-700 underline"
                    >
                      {card.gift.business.name}
                    </Link>
                  ) : null}
                </p>
                <p className="text-xs text-slate-500">
                  {card.gift ? GIFT_CLAIM_LABELS[card.gift.claimHow] : null}
                </p>
              </div>
              <span className="rounded-lg bg-slate-100 px-2 py-1 font-mono font-bold tracking-widest">
                {card.code}
              </span>
              <Badge tone={card.redeemedAt ? "green" : "amber"}>
                {card.redeemedAt ? "Collected" : "To collect"}
              </Badge>
            </div>
          ))}
        </Card>
      ) : null}

      <Card className="space-y-2">
        <h2 className="text-lg font-bold">Prizes you can win now</h2>
        {open.length ? (
          <ul className="grid gap-2 sm:grid-cols-2">
            {open.map((gift) => (
              <li
                key={gift.id}
                className="rounded-xl border border-slate-200 p-3 text-sm"
              >
                <p className="font-semibold">🎁 {gift.title}</p>
                <p className="text-xs text-slate-500">
                  <Link href={`/b/${gift.business.slug}`} className="underline">
                    {gift.business.name}
                  </Link>
                  {gift.business.city ? ` · ${gift.business.city}` : ""} ·{" "}
                  {gift.quantity - gift.wonCount} left
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-600">
            Vendor gifts are on their way — bonus points are up for grabs
            meanwhile.
          </p>
        )}
        <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
          🏪 Own a business?{" "}
          <Link href="/dashboard/gifts" className="font-bold underline">
            Offer a free gift
          </Link>{" "}
          and winners come to your store, visit your website or review you on
          GoDesi.
        </p>
      </Card>
    </div>
  );
}
