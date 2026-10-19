import Link from "next/link";
import { db } from "@/lib/db";
import { SPIN_TIME_ZONE } from "@/lib/spin";
import { DealForm } from "@/components/forms/DealForm";
import { OfferCountdown } from "@/components/OfferCountdown";
import { Card } from "@/components/ui";

/** Midnight tonight in New York, when the today-only offer ends. */
function endOfNewYorkDay(now = new Date()) {
  const local = new Date(
    now.toLocaleString("en-US", { timeZone: SPIN_TIME_ZONE }),
  );
  const offset = now.getTime() - local.getTime();
  const midnight = new Date(local);
  midnight.setHours(24, 0, 0, 0);
  return new Date(midnight.getTime() + offset);
}

/** The live public half-off code for the 5-year package, if one has uses left. */
async function packageCode() {
  const coupon = await db.coupon.findFirst({
    where: {
      scope: "BUNDLE",
      active: true,
      publicOffer: true,
      discountKind: "PERCENT",
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    orderBy: { createdAt: "desc" },
    select: {
      code: true,
      amount: true,
      maxRedemptions: true,
      timesRedeemed: true,
    },
  });
  if (!coupon) return null;
  if (
    coupon.maxRedemptions !== null &&
    coupon.timesRedeemed >= coupon.maxRedemptions
  ) {
    return null;
  }
  return coupon;
}

/**
 * Shown once, right after a business saves its card: add an offer now, offer a
 * scratch gift, and a today-only price on the 5-year package.
 */
export async function BusinessNextSteps() {
  const offer = await packageCode();
  return (
    <Card className="space-y-4 border-indigo-200">
      <h2 className="text-lg font-black">
        🚀 Next steps — get customers this week
      </h2>
      <details open className="rounded-xl border border-slate-200 p-3">
        <summary className="cursor-pointer font-bold">
          1. Add a discount code or coupon{" "}
          <span className="font-normal text-slate-500">
            — e.g. 10% off for GoDesi members
          </span>
        </summary>
        <p className="mb-3 mt-1 text-sm text-slate-600">
          It shows on your card, on godesi.com/deals and on the home page.
        </p>
        <DealForm />
      </details>
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 p-3">
        <div>
          <p className="font-bold">2. Offer a free gift on Scratch &amp; win</p>
          <p className="text-sm text-slate-600">
            Members win it and come to your store, visit your website or review
            you.
          </p>
        </div>
        <Link
          href="/dashboard/gifts"
          className="rounded-xl bg-amber-500 px-3 py-2 text-sm font-bold text-white hover:bg-amber-600"
        >
          Offer a gift
        </Link>
      </div>
      {offer ? (
        <div className="space-y-2 rounded-xl bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-orange-500 p-4 text-white">
          <p className="text-xs font-bold uppercase tracking-widest text-white/80">
            3. Today only — ends in{" "}
            <OfferCountdown endsAt={endOfNewYorkDay().toISOString()} />
          </p>
          <p className="text-xl font-black">
            The 5-year complete package, {offer.amount}% off
          </p>
          <p className="text-sm text-white/90">
            Featured for 5 years plus a GoDesi Elite interview, with code{" "}
            <b className="rounded bg-white/20 px-1.5 font-mono">{offer.code}</b>{" "}
            already applied. This offer is shown once — it won&apos;t appear
            again after you leave this page.
          </p>
          <Link
            href="/upgrade?offer=today"
            className="inline-block rounded-xl bg-white px-4 py-2 text-sm font-bold text-indigo-700 hover:bg-indigo-50"
          >
            Claim today&apos;s price →
          </Link>
        </div>
      ) : null}
    </Card>
  );
}
