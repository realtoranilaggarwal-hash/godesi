import Link from "next/link";
import { DealForm } from "@/components/forms/DealForm";
import { Card } from "@/components/ui";

/** Shown right after a business saves its card: add an offer now, then a scratch gift. */
export function BusinessNextSteps() {
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
    </Card>
  );
}
