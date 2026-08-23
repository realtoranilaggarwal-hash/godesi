import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { POINTS } from "@/lib/rewards";
import { topContributors } from "@/lib/rewardsQueries";
import { Card, EmptyState } from "@/components/ui";
import { ContributionScore } from "@/components/ContributionScore";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Top contributors | Godesi",
  description:
    "The members who add the most to the Godesi community — referrals, listings, reviews and news.",
  alternates: { canonical: "/leaderboard" },
};

const MEDALS = ["🥇", "🥈", "🥉"];

export default async function LeaderboardPage() {
  const contributors = await topContributors(25);

  return (
    <div className="space-y-4">
      <Card className="border-indigo-200 bg-gradient-to-br from-amber-50 via-white to-indigo-50">
        <h1 className="text-2xl font-black sm:text-3xl">🏅 Top contributors</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-700">
          Godesi points recognise the people who build the community — inviting
          members, listing businesses, reviewing honestly and reporting local
          news. Points are a recognition and rewards programme only; they are
          not money and carry no cash value.
        </p>
        <div className="mt-3 grid gap-2 text-xs sm:grid-cols-4">
          <p className="rounded-xl bg-white/70 p-2">
            <strong>+{POINTS.REFERRAL_SIGNUP}</strong> a friend signs up
          </p>
          <p className="rounded-xl bg-white/70 p-2">
            <strong>+{POINTS.LISTING_POSTED}</strong> post a listing
          </p>
          <p className="rounded-xl bg-white/70 p-2">
            <strong>+{POINTS.REVIEW_POSTED}</strong> write a review
          </p>
          <p className="rounded-xl bg-white/70 p-2">
            <strong>+1 per $1</strong> spent with Godesi
          </p>
        </div>
      </Card>

      {contributors.length ? (
        <Card className="divide-y divide-slate-100">
          {contributors.map((member, index) => (
            <div key={member.id} className="flex items-center gap-3 py-3">
              <span className="w-8 shrink-0 text-center text-lg font-black text-slate-500">
                {MEDALS[index] ?? index + 1}
              </span>
              {member.avatarUrl ? (
                <Image
                  src={member.avatarUrl}
                  alt={member.name}
                  width={44}
                  height={44}
                  className="h-11 w-11 shrink-0 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-lg font-black text-indigo-700">
                  {member.name.charAt(0).toUpperCase()}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-slate-900">
                  {member.username ? (
                    <Link
                      href={`/${member.username}`}
                      className="hover:underline"
                    >
                      {member.name}
                    </Link>
                  ) : (
                    member.name
                  )}
                  {member.location ? (
                    <span className="ml-2 font-normal text-slate-500">
                      {member.location}
                    </span>
                  ) : null}
                </p>
                <ContributionScore
                  earned={member.points}
                  plan={member.plan}
                  compact
                />
              </div>
            </div>
          ))}
        </Card>
      ) : (
        <EmptyState
          title="No contributors yet"
          body="Invite a friend, post a listing or review a business to get on the board."
        />
      )}

      <Card>
        <p className="text-sm text-slate-700">
          Want to climb the board?{" "}
          <Link href="/dashboard/rewards" className="font-bold underline">
            Your points wallet →
          </Link>{" "}
          shows what you have earned, what you spent, and what you can spend it
          on: featuring a listing, unlocking a requirement&apos;s contact
          details or buying an ad.
        </p>
      </Card>
    </div>
  );
}
