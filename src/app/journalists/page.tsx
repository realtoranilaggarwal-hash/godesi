import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import {
  JOURNALIST_LEVELS,
  JOURNALIST_RULES,
  PRESS_CARD_LEVEL,
  journalistStats,
  pressCardEligibility,
  topJournalists,
} from "@/lib/journalists";
import { PressCard } from "@/components/PressCard";
import {
  ClaimPressCardForm,
  JournalistPhoneForm,
} from "@/components/forms/PressCardPanel";
import { POINTS } from "@/lib/rewards";
import { JournalistJoinForm } from "@/components/forms/JournalistJoinForm";
import { JournalistBadge } from "@/components/JournalistBadge";
import { leaveJournalistAction } from "@/app/actions/journalist";
import { SidebarBanners } from "@/components/Banners";
import { Card, EmptyState, LinkButton } from "@/components/ui";
import { gradientFor } from "@/lib/categories";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Become a local journalist",
  description:
    "Cover your desi neighbourhood on Godesi: post local news, earn stars and reward points.",
};

export default async function JournalistsPage() {
  const user = await getCurrentUser();
  const [leaders, stats] = await Promise.all([
    topJournalists(10),
    user ? journalistStats(user.id) : null,
  ]);

  return (
    <div className="flex gap-6">
      <div className="min-w-0 flex-1 space-y-6">
        <section
          className={`rounded-3xl bg-gradient-to-r ${gradientFor("amber")} px-5 py-8 text-white sm:px-8`}
        >
          <h1 className="text-3xl font-black">Become a local journalist 🗞️</h1>
          <p className="mt-2 max-w-2xl text-white/90">
            Know what is happening in your desi neighbourhood — a new temple
            event, a store opening, a community win, a scam warning? Cover it for
            Godesi. Every approved story earns reward points and stars on your
            profile, and your photo and name run with the story.
          </p>
        </section>

        <Card>
          <h2 className="text-lg font-bold">Your desk</h2>
          {user ? (
            stats?.joined ? (
              <div className="mt-3 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <JournalistBadge level={stats.level} beat={stats.beat} />
                  <span className="text-sm text-slate-600">
                    Covering <strong>{stats.beat}</strong>
                  </span>
                </div>
                <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { label: "Approved", value: stats.approved },
                    { label: "In review", value: stats.pending },
                    { label: "Upvotes", value: stats.upvotes },
                    { label: "Editor's picks", value: stats.featured },
                  ].map((cell) => (
                    <div
                      key={cell.label}
                      className="rounded-2xl bg-slate-50 px-3 py-2"
                    >
                      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {cell.label}
                      </dt>
                      <dd className="text-xl font-black text-slate-800">
                        {cell.value}
                      </dd>
                    </div>
                  ))}
                </dl>
                {stats.next ? (
                  <p className="text-sm text-slate-600">
                    {stats.next.stories - stats.approved} more approved{" "}
                    {stats.next.stories - stats.approved === 1
                      ? "story"
                      : "stories"}{" "}
                    to reach {stats.next.stars} {stats.next.title}.
                  </p>
                ) : (
                  <p className="text-sm text-slate-600">
                    You have reached the top level — thank you for covering your
                    community.
                  </p>
                )}
                <div className="rounded-2xl bg-slate-50 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-bold text-slate-700">
                      Trust score
                    </p>
                    <p className="text-sm font-black text-slate-800">
                      {stats.trust.score}/100
                    </p>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className={`h-full rounded-full ${
                        stats.trust.score >= 70
                          ? "bg-emerald-500"
                          : stats.trust.score >= 40
                            ? "bg-amber-500"
                            : "bg-red-500"
                      }`}
                      style={{ width: `${stats.trust.score}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    ✔ {stats.trust.confirmed} confirmed · ⚠{" "}
                    {stats.trust.doubted} doubted · ✖ {stats.trust.fake} flagged
                    fake by readers
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <LinkButton href="/news/report">Report news</LinkButton>
                  <form action={leaveJournalistAction}>
                    <button
                      type="submit"
                      className="text-sm font-semibold text-slate-500 hover:text-slate-700"
                    >
                      Leave the programme
                    </button>
                  </form>
                </div>
                <div className="border-t border-slate-100 pt-3">
                  <p className="text-sm font-semibold text-slate-700">
                    Update your beat
                  </p>
                  <div className="mt-2">
                    <JournalistJoinForm beat={stats.beat} label="Save beat" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-3">
                <p className="text-sm text-slate-600">
                  Want to be a local journalist and post news from your area?
                  Tell us where you are and start posting — no application, no
                  fee.
                </p>
                <div className="mt-3">
                  <JournalistJoinForm />
                </div>
              </div>
            )
          ) : (
            <div className="mt-2 space-y-3">
              <p className="text-sm text-slate-600">
                Sign in to join — it is free and open to every Godesi member.
              </p>
              <LinkButton href="/login?next=/journalists">
                Sign in to join
              </LinkButton>
            </div>
          )}
        </Card>

        {user && stats?.joined ? (
          <Card>
            <h2 className="text-lg font-bold">Godesi press card 🎫</h2>
            <p className="mt-1 text-sm text-slate-600">
              Reach{" "}
              {
                JOURNALIST_LEVELS.find(
                  (level) => level.level === PRESS_CARD_LEVEL,
                )?.title
              }{" "}
              level with a verified account and a clean record, and we issue you
              a numbered Godesi press card — valid for a year, with a QR anyone
              can scan to check it.
            </p>

            {stats.pressCard && !stats.pressCard.expired ? (
              <div className="mt-3 max-w-md">
                <PressCard card={stats.pressCard} />
              </div>
            ) : (
              <div className="mt-3 space-y-4">
                <ul className="grid gap-2 sm:grid-cols-2">
                  {[
                    { label: "Email verified", done: stats.checks.email },
                    { label: "Mobile verified", done: stats.checks.phone },
                    { label: "No fake history", done: stats.checks.cleanRecord },
                    { label: "ID check (optional)", done: stats.checks.kyc },
                  ].map((check) => (
                    <li
                      key={check.label}
                      className={`rounded-xl border px-3 py-2 text-sm font-semibold ${
                        check.done
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-slate-200 text-slate-500"
                      }`}
                    >
                      {check.done ? "✔" : "☐"} {check.label}
                    </li>
                  ))}
                </ul>

                <div className="border-t border-slate-100 pt-3">
                  <JournalistPhoneForm phone={user.phone} />
                </div>

                <div className="border-t border-slate-100 pt-3">
                  <ClaimPressCardForm
                    missing={pressCardEligibility(stats).missing}
                  />
                </div>
              </div>
            )}
          </Card>
        ) : null}

        <Card>
          <h2 className="text-lg font-bold">Stars you can earn ⭐</h2>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {JOURNALIST_LEVELS.map((level) => (
              <li
                key={level.level}
                className="rounded-2xl border border-slate-200 px-3 py-2 text-sm"
              >
                <span className="font-bold">
                  {level.stars} {level.title}
                </span>
                <span className="text-slate-500">
                  {" "}
                  — {level.stories} approved{" "}
                  {level.stories === 1 ? "story" : "stories"}
                </span>
              </li>
            ))}
          </ul>
          <ul className="mt-4 space-y-1 text-sm text-slate-600">
            <li>+{POINTS.NEWS_PUBLISHED} points every time a story is approved</li>
            <li>
              +{POINTS.NEWS_UPVOTED} points when a story reaches 5 net upvotes
            </li>
            <li>
              +{POINTS.NEWS_FEATURED} points if the team picks it as important
              news
            </li>
            <li>+{POINTS.JOURNALIST_LEVEL} points for each new star level</li>
          </ul>
          <p className="mt-3 text-sm text-slate-600">
            Points turn into real perks — featured listings, banner slots or Pro
            membership. See{" "}
            <Link href="/rewards" className="font-semibold text-indigo-600">
              rewards
            </Link>
            .
          </p>
        </Card>

        <Card>
          <h2 className="text-lg font-bold">The ground rules 📋</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {JOURNALIST_RULES.map((rule) => (
              <li key={rule} className="flex gap-2">
                <span aria-hidden>•</span>
                <span>{rule}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 rounded-2xl bg-amber-50 px-3 py-2 text-xs text-amber-900">
            Godesi is not the publisher of member stories and does not verify
            every claim. Stories are reviewed before they appear and the Godesi
            team may edit, unpublish or delete any story at any time. See our{" "}
            <Link href="/terms" className="font-semibold underline">
              terms
            </Link>
            .
          </p>
        </Card>

        <Card>
          <h2 className="text-lg font-bold">Top contributors 🏆</h2>
          {leaders.length ? (
            <ol className="mt-3 divide-y divide-slate-100">
              {leaders.map((leader, index) => (
                <li
                  key={leader.id}
                  className="flex items-center gap-3 py-2 text-sm"
                >
                  <span className="w-5 text-right font-black text-slate-400">
                    {index + 1}
                  </span>
                  {leader.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={leader.avatarUrl}
                      alt={leader.name ?? "Godesi journalist"}
                      className="h-8 w-8 rounded-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 to-indigo-500 text-xs font-bold text-white">
                      {leader.name.slice(0, 1).toUpperCase()}
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    {leader.username ? (
                      <Link
                        href={`/${leader.username}`}
                        className="font-semibold hover:text-indigo-600"
                      >
                        {leader.name}
                      </Link>
                    ) : (
                      <span className="font-semibold">{leader.name}</span>
                    )}
                    {leader.beat ? (
                      <span className="block truncate text-xs text-slate-500">
                        {leader.beat}
                      </span>
                    ) : null}
                  </span>
                  {leader.pressCard ? (
                    <span
                      title="Holds a Godesi press card"
                      className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-bold text-white"
                    >
                      🎫 PRESS
                    </span>
                  ) : null}
                  <JournalistBadge level={leader.level} />
                  <span className="w-16 text-right text-xs font-bold text-slate-500">
                    {leader.approved}{" "}
                    {leader.approved === 1 ? "story" : "stories"}
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <EmptyState
              title="No contributors yet"
              body="Be the first local journalist on Godesi — join above and post a story."
            />
          )}
        </Card>
      </div>

      <SidebarBanners />
    </div>
  );
}
