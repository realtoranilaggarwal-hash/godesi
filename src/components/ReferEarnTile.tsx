import Link from "next/link";

const PERKS = ["Invite friends", "Earn points", "Free upgrades"];

/** Fills a spare cell in the category grid with the referral programme. */
export function ReferEarnTile() {
  return (
    <Link
      href="/rewards"
      className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-center gap-3 bg-gradient-to-r from-fuchsia-500 to-indigo-500 px-3 py-2 text-white">
        <span className="text-xl" aria-hidden>
          🎁
        </span>
        <div className="min-w-0">
          <p className="text-sm font-bold leading-tight">Refer &amp; earn</p>
          <p className="text-[11px] text-white/80">
            Get rewarded for promoting Godesi
          </p>
        </div>
      </div>
      <div className="p-3">
        <div className="flex flex-wrap gap-1.5">
          {PERKS.map((perk) => (
            <span
              key={perk}
              className="rounded-full border border-fuchsia-200 bg-fuchsia-50 px-2 py-0.5 text-xs text-fuchsia-700"
            >
              {perk}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
