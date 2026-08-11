import Link from "next/link";
import { siteUrl } from "@/lib/format";

/**
 * Help panel beside the card editor: invite other businesses with the member's
 * referral link and point them at coupons and the listing checklist.
 */
export function ListingHelp({ username }: { username?: string | null }) {
  const base = siteUrl();
  const referral = username ? `${base}/ref/${username}` : `${base}/signup`;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
        <h2 className="text-base font-bold text-emerald-900">Invite a business</h2>
        <p className="mt-1 text-sm text-emerald-900/90">
          Share your link — you earn reward points when they join, complete a profile
          or upgrade.
        </p>
        <p className="mt-2 break-all rounded-xl bg-white px-3 py-2 text-xs font-semibold text-emerald-800">
          {referral}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(
              `List your business free on Godesi — digital card, QR code and WhatsApp enquiries: ${referral}`,
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
          >
            Share on WhatsApp
          </a>
          <Link
            href="/dashboard/rewards"
            className="rounded-lg border border-emerald-300 px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100"
          >
            My points
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
        <h2 className="text-base font-bold text-amber-900">How to get a coupon</h2>
        <ul className="mt-2 space-y-1 text-sm text-amber-900/90">
          <li>• Invite businesses with your link and redeem the points you earn</li>
          <li>
            • Watch the{" "}
            <Link href="/pricing" className="font-semibold underline">
              pricing page
            </Link>{" "}
            for seasonal codes — enter them at checkout
          </li>
          <li>
            • Running an event or a group offer? Create your own codes in{" "}
            <Link href="/dashboard/coupons" className="font-semibold underline">
              Coupons
            </Link>
          </li>
          <li>
            • Need one for a group of businesses?{" "}
            <Link href="/contact" className="font-semibold underline">
              Ask us
            </Link>
          </li>
        </ul>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="text-base font-bold text-slate-900">Finish your listing</h2>
        <ol className="mt-2 space-y-1 text-sm text-slate-600">
          <li>1. Name, category and city</li>
          <li>2. WhatsApp number — every enquiry lands there</li>
          <li>3. Logo, photos and an intro video</li>
          <li>4. Every social profile you have</li>
          <li>5. Packages and a starting price</li>
          <li>6. Share your QR card and ask for reviews</li>
        </ol>
        <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
          <Link href="/dashboard/media" className="text-indigo-600 hover:underline">
            Photos →
          </Link>
          <Link href="/dashboard/packages" className="text-indigo-600 hover:underline">
            Packages →
          </Link>
          <Link href="/faq" className="text-indigo-600 hover:underline">
            FAQ →
          </Link>
        </div>
      </div>
    </div>
  );
}
