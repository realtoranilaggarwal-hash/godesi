import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { toggleGiftAction } from "@/app/actions/scratch";
import { GIFT_CLAIM_LABELS } from "@/lib/scratch";
import { GiftForm, RedeemCodeForm } from "@/components/forms/GiftForms";
import { Badge, Card, EmptyState, LinkButton } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Free gifts for scratch & win" };

export default async function DashboardGiftsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard/gifts");

  const business = await db.business.findUnique({
    where: { ownerId: user.id },
    include: {
      scratchGifts: {
        orderBy: { createdAt: "desc" },
        include: {
          cards: {
            orderBy: { createdAt: "desc" },
            take: 50,
            include: { user: { select: { name: true } } },
          },
        },
      },
    },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold">🎁 Offer free gifts</h1>
        <p className="text-sm text-slate-600">
          Want new customers? Offer a free gift that GoDesi members can win on{" "}
          <Link
            href="/scratch"
            className="font-semibold text-indigo-700 underline"
          >
            Scratch &amp; win
          </Link>
          . Winners collect it by visiting your store, your website or reviewing
          you on GoDesi. Free to list.
        </p>
      </div>

      {business ? (
        <>
          <Card>
            <GiftForm />
          </Card>
          <Card className="space-y-2">
            <h2 className="font-bold">A winner is here? Check their code</h2>
            <RedeemCodeForm />
          </Card>
          {business.scratchGifts.map((gift) => (
            <Card key={gift.id} className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold">
                    {gift.title}{" "}
                    <Badge tone={gift.active ? "green" : "slate"}>
                      {gift.active ? "In the prize pool" : "Paused"}
                    </Badge>
                  </p>
                  <p className="text-xs text-slate-500">
                    {GIFT_CLAIM_LABELS[gift.claimHow]} · {gift.wonCount} of{" "}
                    {gift.quantity} won
                  </p>
                </div>
                <form action={toggleGiftAction}>
                  <input type="hidden" name="id" value={gift.id} />
                  <button className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold hover:bg-slate-50">
                    {gift.active ? "Pause" : "Resume"}
                  </button>
                </form>
              </div>
              {gift.cards.length ? (
                <ul className="divide-y divide-slate-100 text-sm">
                  {gift.cards.map((card) => (
                    <li
                      key={card.id}
                      className="flex items-center justify-between py-1"
                    >
                      <span>
                        {card.user.name} ·{" "}
                        <span className="font-mono">{card.code}</span>
                      </span>
                      <span className="text-xs text-slate-500">
                        {card.redeemedAt ? "✅ Collected" : "Not collected yet"}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </Card>
          ))}
        </>
      ) : (
        <EmptyState
          title="Create your business card first"
          body="Gifts show with your business name, address and link."
          action={
            <LinkButton href="/dashboard/profile">Create my card</LinkButton>
          }
        />
      )}
    </div>
  );
}
