import Link from "next/link";
import { db } from "@/lib/db";
import { currentUserId } from "@/lib/auth";
import { setMorningEmailAction } from "@/app/actions/rewards";

/** "Get this every morning" box: sign-in link for visitors, on/off switch for members. */
export async function MorningEmailSignup() {
  const userId = await currentUserId();
  const member = userId
    ? await db.user.findUnique({
        where: { id: userId },
        select: { morningEmailAt: true },
      })
    : null;
  const on = Boolean(member?.morningEmailAt);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-indigo-200 bg-indigo-50 p-4 text-sm">
      <div>
        <p className="font-bold text-slate-900">☀️ Get this every morning</p>
        <p className="text-slate-600">
          One free email a day: panchang, the Moon&apos;s rashi, the deal of the
          day and events coming up. Stop it any time.
        </p>
      </div>
      {member ? (
        <form action={setMorningEmailAction}>
          <input type="hidden" name="on" value={on ? "no" : "yes"} />
          <button
            className={`rounded-xl px-4 py-2 font-bold ${
              on
                ? "bg-emerald-100 text-emerald-700"
                : "bg-indigo-600 text-white hover:bg-indigo-700"
            }`}
          >
            {on ? "✓ You're signed up — stop it" : "Email me every morning"}
          </button>
        </form>
      ) : (
        <Link
          href="/signup?next=/astrology/panchang"
          className="rounded-xl bg-indigo-600 px-4 py-2 font-bold text-white hover:bg-indigo-700"
        >
          Join free to get it
        </Link>
      )}
    </div>
  );
}
