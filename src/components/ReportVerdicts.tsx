import Link from "next/link";
import { verifyReportAction } from "@/app/actions/reports";

export type VerdictCounts = {
  confirmed: number;
  doubted: number;
  fake: number;
};

const BUTTONS = [
  {
    verdict: "CONFIRMED",
    label: "✔ Confirm",
    key: "confirmed",
    active: "border-emerald-400 bg-emerald-50 text-emerald-700",
  },
  {
    verdict: "DOUBTED",
    label: "⚠ Doubt",
    key: "doubted",
    active: "border-amber-400 bg-amber-50 text-amber-700",
  },
  {
    verdict: "FAKE",
    label: "✖ Report fake",
    key: "fake",
    active: "border-red-400 bg-red-50 text-red-700",
  },
] as const;

/**
 * Readers vouch for or challenge a member report. The counts are public so a
 * story nobody will stand behind is obvious at a glance.
 */
export function ReportVerdicts({
  newsId,
  counts,
  mine,
  canVote,
  isAuthor,
}: {
  newsId: string;
  counts: VerdictCounts;
  mine: "CONFIRMED" | "DOUBTED" | "FAKE" | null;
  canVote: boolean;
  isAuthor: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 p-3">
      <p className="text-sm font-bold text-slate-700">
        Does this match what you know?
      </p>
      <p className="text-xs text-slate-500">
        Godesi does not witness these reports — the community checks them.
      </p>

      <div className="mt-2 flex flex-wrap gap-2">
        {BUTTONS.map((button) => {
          const count = counts[button.key];
          const label = `${button.label} · ${count}`;
          const base =
            "rounded-xl border px-3 py-1.5 text-sm font-semibold transition";

          if (isAuthor) {
            return (
              <span
                key={button.verdict}
                className={`${base} border-slate-200 text-slate-400`}
                title="You filed this report"
              >
                {label}
              </span>
            );
          }

          if (!canVote) {
            return (
              <Link
                key={button.verdict}
                href={`/login?next=/news/${newsId}`}
                className={`${base} border-slate-200 text-slate-600 hover:bg-slate-50`}
              >
                {label}
              </Link>
            );
          }

          return (
            <form key={button.verdict} action={verifyReportAction}>
              <input type="hidden" name="id" value={newsId} />
              <input type="hidden" name="verdict" value={button.verdict} />
              <button
                type="submit"
                className={`${base} ${
                  mine === button.verdict
                    ? button.active
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {label}
              </button>
            </form>
          );
        })}
      </div>
    </div>
  );
}
