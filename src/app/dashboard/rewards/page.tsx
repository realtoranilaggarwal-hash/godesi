import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { siteUrl } from "@/lib/format";
import { POINTS, referralStats, wallet } from "@/lib/rewards";
import { Badge, Card } from "@/components/ui";
import { ShareButtons } from "@/components/ShareButtons";
import { RedeemPanel } from "@/components/forms/RedeemPanel";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Referrals & rewards" };

const EARNING_ROWS: [string, number][] = [
  ["A friend signs up with your link", POINTS.REFERRAL_SIGNUP],
  ["You complete your business profile", POINTS.PROFILE_CREATED],
  ["You (or a referral) upgrade to a paid plan", POINTS.PAID_UPGRADE],
  ["You post a listing or an event", POINTS.LISTING_POSTED],
];

export default async function RewardsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard/rewards");
  if (!user.username) redirect("/dashboard/me?needsUsername=1");

  const [balance, stats, entries, redemptions] = await Promise.all([
    wallet(user.id),
    referralStats(user.id),
    db.pointsEntry.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 25,
    }),
    db.redemption.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  const link = `${siteUrl()}/ref/${user.username}`;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Referrals & rewards 🎁</h1>
        <p className="text-sm text-slate-600">
          Invite desi businesses to Godesi and spend the points on ads, featured listings
          or membership.
        </p>
      </div>

      <Card className="space-y-3 bg-gradient-to-r from-orange-50 via-rose-50 to-fuchsia-50">
        <p className="text-sm font-semibold text-slate-700">Your referral link</p>
        <p className="break-all rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-indigo-700">
          {link}
        </p>
        <ShareButtons url={link} title="Join me on Godesi" />
        <p className="text-xs text-slate-500">
          Share it on WhatsApp — you earn points the moment someone signs up, and again
          when they upgrade.
        </p>
      </Card>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {[
          ["Points earned", balance.earned, "bg-emerald-50 text-emerald-700"],
          ["Points used", balance.used, "bg-amber-50 text-amber-800"],
          ["Balance", balance.balance, "bg-indigo-50 text-indigo-700"],
          ["Referrals", stats.referrals, "bg-sky-50 text-sky-700"],
          ["Conversion", `${stats.conversionRate}%`, "bg-fuchsia-50 text-fuchsia-700"],
        ].map(([label, value, tone]) => (
          <div key={String(label)} className={`rounded-2xl p-4 ${tone}`}>
            <p className="text-2xl font-black">{value}</p>
            <p className="text-[11px] font-semibold uppercase tracking-wide opacity-80">
              {label}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-2 font-bold">How to earn</h2>
          <ul className="space-y-2 text-sm">
            {EARNING_ROWS.map(([label, points]) => (
              <li key={label} className="flex items-center justify-between gap-3">
                <span className="text-slate-700">{label}</span>
                <Badge tone="green">+{points}</Badge>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <h2 className="mb-2 font-bold">Spend your points</h2>
          <RedeemPanel balance={balance.balance} />
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-2 font-bold">Activity</h2>
          {entries.length ? (
            <ul className="divide-y divide-slate-100 text-sm">
              {entries.map((entry) => (
                <li key={entry.id} className="flex items-center justify-between gap-3 py-2">
                  <span className="text-slate-600">
                    {entry.note ?? entry.reason.replaceAll("_", " ").toLowerCase()}
                    <span className="block text-xs text-slate-400">
                      {entry.createdAt.toLocaleDateString("en-IN")}
                    </span>
                  </span>
                  <span
                    className={`font-bold ${entry.points > 0 ? "text-emerald-700" : "text-rose-600"}`}
                  >
                    {entry.points > 0 ? "+" : ""}
                    {entry.points}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">
              No points yet — share your link or{" "}
              <Link href="/dashboard/profile" className="font-semibold text-indigo-600">
                finish your profile
              </Link>{" "}
              for {POINTS.PROFILE_CREATED} points.
            </p>
          )}
        </Card>

        <Card>
          <h2 className="mb-2 font-bold">Redemptions</h2>
          {redemptions.length ? (
            <ul className="divide-y divide-slate-100 text-sm">
              {redemptions.map((redemption) => (
                <li
                  key={redemption.id}
                  className="flex items-center justify-between gap-3 py-2"
                >
                  <span className="text-slate-700">{redemption.reward}</span>
                  <Badge tone={redemption.status === "FULFILLED" ? "green" : "amber"}>
                    {redemption.status.toLowerCase()}
                  </Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">Nothing redeemed yet.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
