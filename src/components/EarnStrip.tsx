import Link from "next/link";
import type { User } from "@prisma/client";
import { Card } from "@/components/ui";

/** The pieces a page needs before it is worth sharing. */
function missingPieces(user: User) {
  const gaps: { label: string; href: string }[] = [];
  if (!user.username)
    gaps.push({ label: "Pick your name", href: "/dashboard/me" });
  if (!user.avatarUrl) gaps.push({ label: "Photo", href: "/dashboard/me" });
  if (!user.headline)
    gaps.push({ label: "Headline", href: "/dashboard/me" });
  if (!user.bio) gaps.push({ label: "About you", href: "/dashboard/me" });
  if (!user.location)
    gaps.push({ label: "Your town", href: "/dashboard/me" });
  if (!user.skills.length && !user.experience)
    gaps.push({ label: "Skills or work", href: "/dashboard/me" });
  return gaps;
}

/**
 * The "finish your profile · invite friends · earn points" prompt. Shown on the
 * dashboard and the profile editor so both halves of the loop are one click away.
 */
export function EarnStrip({
  user,
  balance,
  signupPoints,
  profilePoints,
}: {
  user: User;
  balance: number;
  signupPoints: number;
  profilePoints: number;
}) {
  const gaps = missingPieces(user);

  return (
    <Card className="space-y-2 border-indigo-100 bg-gradient-to-r from-indigo-50 via-fuchsia-50 to-orange-50">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-black text-slate-900">
          Finish your profile · Invite friends · Earn rewards 🎁
        </h2>
        <Link
          href="/dashboard/rewards"
          className="rounded-xl bg-white px-3 py-1 text-sm font-bold text-indigo-700"
        >
          {balance} points
        </Link>
      </div>
      <p className="text-xs text-slate-600">
        A complete profile earns {profilePoints} points and every friend who
        joins earns {signupPoints}. Spend them on promotion, a featured listing
        or ads —{" "}
        <Link href="/dashboard/rewards" className="font-semibold underline">
          what points buy
        </Link>
        .
      </p>
      <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
        {gaps.length ? (
          <>
            <span className="text-slate-800">
              {gaps.length} left:
            </span>
            {gaps.map((gap) => (
              <Link
                key={gap.label}
                href={gap.href}
                className="rounded-full border border-indigo-200 bg-white px-2 py-0.5 text-indigo-700 hover:bg-indigo-50"
              >
                {gap.label}
              </Link>
            ))}
          </>
        ) : (
          <span className="text-emerald-700">
            Your profile is complete ✅
          </span>
        )}
        <span className="ml-auto flex gap-1.5">
          <Link
            href="/dashboard/me"
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-slate-700 hover:bg-slate-50"
          >
            Update my profile
          </Link>
          <Link
            href="/dashboard/rewards#invite"
            className="rounded-lg bg-indigo-600 px-2.5 py-1 text-white hover:bg-indigo-700"
          >
            Invite friends
          </Link>
        </span>
      </div>
    </Card>
  );
}
