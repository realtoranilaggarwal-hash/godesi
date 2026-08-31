import Link from "next/link";
import type { User } from "@prisma/client";
import { Card } from "@/components/ui";

/** The pieces a page needs before it is worth sharing. */
function missingPieces(user: User) {
  const gaps: { label: string; href: string }[] = [];
  if (!user.username)
    gaps.push({ label: "Pick your godesi.com/name", href: "/dashboard/me" });
  if (!user.avatarUrl) gaps.push({ label: "Add a photo", href: "/dashboard/me" });
  if (!user.headline)
    gaps.push({ label: "Write your one-line headline", href: "/dashboard/me" });
  if (!user.bio) gaps.push({ label: "Say what you do", href: "/dashboard/me" });
  if (!user.location)
    gaps.push({ label: "Add your town", href: "/dashboard/me" });
  if (!user.skills.length && !user.experience)
    gaps.push({ label: "Add your skills or work", href: "/dashboard/me" });
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
    <Card className="space-y-3 border-indigo-100 bg-gradient-to-r from-indigo-50 via-fuchsia-50 to-orange-50">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-black text-slate-900">
          Finish your profile · Invite your friends · Earn rewards 🎁
        </h2>
        <span className="rounded-xl bg-white px-3 py-1 text-sm font-bold text-indigo-700">
          {balance} points
        </span>
      </div>

      <p className="text-sm text-slate-700">
        Points spend on business promotion, a featured listing, sidebar ads, a
        month of Pro membership, promoting a Connect meet-up and the GoDesi Elite
        review — see{" "}
        <Link href="/dashboard/rewards" className="font-semibold underline">
          what points buy
        </Link>
        . A complete profile earns {profilePoints}, and every friend who joins
        earns you {signupPoints}.
      </p>

      {gaps.length ? (
        <div className="space-y-1">
          <p className="text-sm font-semibold text-slate-800">
            {gaps.length} thing{gaps.length === 1 ? "" : "s"} left on your
            profile:
          </p>
          <ul className="flex flex-wrap gap-2 text-xs font-semibold">
            {gaps.map((gap) => (
              <li key={gap.label}>
                <Link
                  href={gap.href}
                  className="inline-block rounded-xl border border-indigo-200 bg-white px-2 py-1 text-indigo-700 hover:bg-indigo-50"
                >
                  {gap.label} →
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-sm font-semibold text-emerald-700">
          Your profile is complete ✅ — now invite your friends.
        </p>
      )}

      <div className="flex flex-wrap gap-2 text-sm font-bold">
        <Link
          href="/dashboard/me"
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-700 hover:bg-slate-50"
        >
          Update my profile
        </Link>
        <Link
          href="/dashboard/rewards#invite"
          className="rounded-xl bg-indigo-600 px-3 py-2 text-white hover:bg-indigo-700"
        >
          Invite friends by email
        </Link>
      </div>
    </Card>
  );
}
