import Link from "next/link";
import { db } from "@/lib/db";
import { Card } from "@/components/ui";
import { elitePromptAction } from "@/app/actions/elite";
import { ELITE_STATUS_LABELS } from "@/lib/elite";

/**
 * Asks members once whether they want GoDesi Elite recognition, then keeps
 * showing their application status instead.
 */
export async function ElitePrompt({
  userId,
  answered,
}: {
  userId: string;
  answered?: string | null;
}) {
  const entry = await db.eliteEntry.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  if (entry) {
    return (
      <Card className="border-amber-200 bg-amber-50">
        <p className="text-sm font-bold text-amber-900">
          🏆 GoDesi Elite — {ELITE_STATUS_LABELS[entry.status]}
        </p>
        {entry.status === "PUBLISHED" ? (
          <Link
            href={`/desi-elite/${entry.slug}`}
            className="mt-1 inline-block text-sm font-semibold text-amber-900 underline"
          >
            View your Elite profile →
          </Link>
        ) : (
          <p className="mt-1 text-xs text-amber-900">
            Our team contacts you about the interview — watch your email and
            WhatsApp.
          </p>
        )}
      </Card>
    );
  }

  if (answered) return null;

  return (
    <Card className="border-amber-200 bg-gradient-to-br from-amber-50 via-white to-rose-50">
      <p className="text-sm font-bold text-slate-900">
        🏆 Do you want to be featured in GoDesi Elite?
      </p>
      <p className="mt-1 text-xs text-slate-600">
        Recognition for desi founders, professionals and community leaders —
        reviewed, interviewed and published with your video.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link
          href="/desi-elite/apply"
          className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-bold text-white"
        >
          Yes, nominate myself
        </Link>
        <Link
          href="/desi-elite/apply?nominate=other"
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-800"
        >
          Nominate someone else
        </Link>
        <form action={elitePromptAction}>
          <input type="hidden" name="answer" value="LATER" />
          <button
            type="submit"
            className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-500 hover:underline"
          >
            Not now
          </button>
        </form>
      </div>
    </Card>
  );
}
