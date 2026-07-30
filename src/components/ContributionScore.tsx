import Link from "next/link";
import { contributionBar } from "@/lib/rewards";

const BADGES: Record<string, { label: string; className: string }> = {
  PREMIUM: {
    label: "🏆 Elite",
    className: "bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950",
  },
  PRO: { label: "💎 Premium", className: "bg-blue-600 text-white" },
  FREE: { label: "Member", className: "bg-slate-200 text-slate-700" },
};

/**
 * Contribution Score: how much a member has added to Godesi, from their lifetime
 * points. Shown on profiles beside their membership badge.
 */
export function ContributionScore({
  earned,
  plan,
  compact = false,
}: {
  earned: number;
  plan: string;
  compact?: boolean;
}) {
  const badge = BADGES[plan] ?? BADGES.FREE;
  const width = contributionBar(earned);

  return (
    <div className={compact ? "space-y-1" : "space-y-1.5"}>
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="font-bold text-slate-700">
          Contribution Score{" "}
          <span className="text-indigo-600">{earned.toLocaleString()}</span>
        </span>
        <span
          className={`rounded-full px-2 py-0.5 text-[11px] font-black ${badge.className}`}
        >
          {badge.label}
        </span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={width}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Contribution score"
        className="h-2 w-full overflow-hidden rounded-full bg-slate-200"
      >
        <div
          style={{ width: `${width}%` }}
          className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-indigo-500 to-fuchsia-500"
        />
      </div>
      {compact ? null : (
        <p className="text-[11px] text-slate-500">
          Earned by referring members, posting listings, reviewing businesses and
          supporting Godesi.{" "}
          <Link href="/leaderboard" className="font-semibold underline">
            Top contributors →
          </Link>
        </p>
      )}
    </div>
  );
}
