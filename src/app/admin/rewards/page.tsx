import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import {
  reviewRedemptionAction,
  reviewReferralAction,
} from "@/app/actions/adminRewards";
import {
  PointsAdjustForm,
  RewardPointsForm,
} from "@/components/forms/RewardAdminForms";
import { pointValues } from "@/lib/rewardsQueries";
import { Card } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Rewards" };

export default async function Page() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin/rewards");
  if (user.role !== "ADMIN") redirect("/dashboard");

  const [rewardPoints, flaggedReferrals, openRedemptions] = await Promise.all([
    pointValues(),
    db.referral.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      take: 30,
      include: {
        referrer: { select: { email: true, username: true } },
        user: { select: { email: true, name: true, emailVerifiedAt: true } },
      },
    }),
    db.redemption.findMany({
      where: { status: "REQUESTED" },
      orderBy: { createdAt: "asc" },
      take: 30,
      include: { user: { select: { email: true, name: true } } },
    }),
  ]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Rewards</h1>
      <Card id="reward-point-values">
        <h2 className="mb-3 text-lg font-bold">Reward point values</h2>
        <RewardPointsForm values={rewardPoints} />
      </Card>

      <Card id="adjust-a-members-points">
        <h2 className="mb-3 text-lg font-bold">
          Adjust a member&apos;s points
        </h2>
        <PointsAdjustForm />
      </Card>

      <Card id="referrals-under-review">
        <h2 className="mb-3 text-lg font-bold">Referrals under review</h2>
        {flaggedReferrals.length ? (
          <ul className="divide-y divide-slate-100 text-sm">
            {flaggedReferrals.map((referral) => (
              <li
                key={referral.id}
                className="flex flex-wrap items-start justify-between gap-2 py-2"
              >
                <div className="min-w-0">
                  <p className="font-medium">
                    {referral.user.name} ({referral.user.email})
                  </p>
                  <p className="text-xs text-slate-400">
                    invited by{" "}
                    {referral.referrer.username ?? referral.referrer.email} ·{" "}
                    {referral.user.emailVerifiedAt
                      ? "email verified"
                      : "email not verified"}
                    {referral.ip ? ` · IP ${referral.ip}` : ""}
                  </p>
                  <p className="mt-1 text-amber-700">
                    ⚠️ {referral.flagReason}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {(["APPROVED", "REJECTED"] as const).map((decision) => (
                    <form key={decision} action={reviewReferralAction}>
                      <input type="hidden" name="id" value={referral.id} />
                      <input type="hidden" name="decision" value={decision} />
                      <button
                        type="submit"
                        className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold hover:bg-slate-50"
                      >
                        {decision === "APPROVED" ? "approve" : "reject"}
                      </button>
                    </form>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">No suspicious referrals.</p>
        )}
      </Card>

      <Card id="reward-redemptions-to-fulfil">
        <h2 className="mb-3 text-lg font-bold">Reward redemptions to fulfil</h2>
        {openRedemptions.length ? (
          <ul className="divide-y divide-slate-100 text-sm">
            {openRedemptions.map((redemption) => (
              <li
                key={redemption.id}
                className="flex flex-wrap items-center justify-between gap-2 py-2"
              >
                <div className="min-w-0">
                  <p className="font-medium">{redemption.reward}</p>
                  <p className="text-xs text-slate-400">
                    {redemption.user.name} ({redemption.user.email}) ·{" "}
                    {redemption.points} pts
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {(["FULFILLED", "REJECTED"] as const).map((decision) => (
                    <form key={decision} action={reviewRedemptionAction}>
                      <input type="hidden" name="id" value={redemption.id} />
                      <input type="hidden" name="decision" value={decision} />
                      <button
                        type="submit"
                        className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold hover:bg-slate-50"
                      >
                        {decision === "FULFILLED" ? "mark done" : "refund"}
                      </button>
                    </form>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">Nothing waiting.</p>
        )}
      </Card>
    </div>
  );
}
