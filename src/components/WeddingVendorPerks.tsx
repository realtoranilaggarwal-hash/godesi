import Link from "next/link";
import { Card } from "@/components/ui";
import { CopyTextButton } from "@/components/CopyTextButton";
import { claimWeddingLaunchAction } from "@/app/actions/wedding";
import {
  WEDDING_LAUNCH_LIMIT,
  WEDDING_LAUNCH_MONTHS,
  WEDDING_REFERRALS_PER_REWARD,
  WEDDING_REFERRAL_MONTHS,
} from "@/lib/weddingLaunch";

const NOTICES: Record<string, string> = {
  premium: `🎉 Done — Premium is on free for ${WEDDING_LAUNCH_MONTHS} months.`,
  taken: "You already have the launch offer.",
  full: `All ${WEDDING_LAUNCH_LIMIT} launch spots are gone — referrals still earn free Premium.`,
  "no-wedding-card": "Put your card in Wedding & Event Services first.",
};

/** Dashboard card for wedding vendors: launch offer, referral reward and verified badge. */
export function WeddingVendorPerks({
  launchUntil,
  spotsLeft,
  referralLink,
  referredVendors,
  verified,
  slug,
  notice,
}: {
  launchUntil: string | null;
  spotsLeft: number;
  referralLink: string | null;
  referredVendors: number;
  verified: boolean;
  slug: string;
  notice?: string;
}) {
  const towardNext = referredVendors % WEDDING_REFERRALS_PER_REWARD;

  return (
    <Card className="space-y-3 border-rose-200 bg-gradient-to-br from-rose-50 via-white to-amber-50">
      <h2 className="text-lg font-black">💍 Wedding vendor perks</h2>
      {notice && NOTICES[notice] ? (
        <p className="rounded-xl bg-white p-3 text-sm font-semibold text-emerald-700">
          {NOTICES[notice]}
        </p>
      ) : null}

      {launchUntil ? (
        <p className="text-sm font-semibold text-emerald-700">
          ⭐ Launch offer: Premium free until {launchUntil} — your card is
          featured and you can unlock{" "}
          <Link href="/wedding/requirements" className="underline">
            wedding requests
          </Link>
          .
        </p>
      ) : spotsLeft > 0 ? (
        <form action={claimWeddingLaunchAction} className="space-y-2">
          <p className="text-sm text-slate-700">
            First {WEDDING_LAUNCH_LIMIT} wedding vendors get Premium free for{" "}
            {WEDDING_LAUNCH_MONTHS} months — {spotsLeft} spots left.
          </p>
          <button
            type="submit"
            className="rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 px-4 py-2 text-sm font-bold text-white hover:opacity-90"
          >
            Claim my free {WEDDING_LAUNCH_MONTHS} months
          </button>
        </form>
      ) : null}

      {referralLink ? (
        <div className="text-sm text-slate-700">
          <p>
            🎁 Refer {WEDDING_REFERRALS_PER_REWARD} wedding vendors, get{" "}
            {WEDDING_REFERRAL_MONTHS} month of Premium free — again for every{" "}
            {WEDDING_REFERRALS_PER_REWARD}. So far: {referredVendors} (
            {towardNext}/{WEDDING_REFERRALS_PER_REWARD} toward the next month).
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <code className="rounded bg-white px-2 py-1 text-xs">{referralLink}</code>
            <CopyTextButton
              text={`List your wedding business free on GoDesi.com and get wedding requests from desi families: ${referralLink}`}
              className="rounded-lg border border-rose-300 px-3 py-1 text-xs font-bold text-rose-700"
            >
              Copy invite
            </CopyTextButton>
          </div>
        </div>
      ) : null}

      <p className="text-sm text-slate-700">
        {verified ? (
          <>
            ✅ You are a GoDesi Verified Wedding Vendor.{" "}
            <a
              href={`/wedding/vendors/badge/${slug}`}
              className="font-semibold text-rose-700 underline"
              download
            >
              Download your Instagram badge
            </a>
          </>
        ) : (
          <>
            ✅ Want the <strong>GoDesi Verified Wedding Vendor</strong> badge?
            Upload your licence or business document on{" "}
            <Link href="/dashboard/profile" className="font-semibold text-rose-700 underline">
              your profile
            </Link>{" "}
            and we&apos;ll check it.
          </>
        )}
      </p>
    </Card>
  );
}
