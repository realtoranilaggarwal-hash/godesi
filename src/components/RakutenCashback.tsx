export const RAKUTEN_REFERRAL = "https://www.rakuten.com/r/GODESI11?eeid=28187";

export function RakutenCashback() {
  return (
    <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-violet-200 bg-violet-50 p-4">
      <div className="max-w-xl">
        <p className="font-bold text-slate-900">
          💜 Get cash back on your online shopping{" "}
          <span className="ml-1 rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-600">
            Referral link
          </span>
        </p>
        <p className="mt-1 text-sm text-slate-600">
          Join Rakuten free and earn cash back at thousands of stores like
          Walmart, Target, Macy&apos;s and Expedia. New members can get a
          welcome bonus.
        </p>
      </div>
      <a
        href={RAKUTEN_REFERRAL}
        target="_blank"
        rel="noopener noreferrer nofollow sponsored"
        className="rounded-xl bg-violet-700 px-4 py-2 text-sm font-bold text-white hover:bg-violet-800"
      >
        Join Rakuten free →
      </a>
      <p className="w-full text-xs text-slate-500">
        GoDesi earns a referral bonus when you join with this link. Rakuten
        sets the cash-back rates and bonus rules, and they can change.
      </p>
    </section>
  );
}
