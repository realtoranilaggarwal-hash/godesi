import Link from "next/link";
import { ClaimEventForm } from "@/components/forms/ClaimEventForm";
import { platformFeePercent } from "@/lib/connect";

/**
 * Events we list from public calendars still sell their tickets on the site we
 * found them on. This is the pitch to the organiser who lands on their own
 * page: claim it, and sell the same seats here for less.
 */
export function EventClaimPitch({
  eventId,
  slug,
  signedIn,
  anchorId,
}: {
  eventId: string;
  slug: string;
  signedIn: boolean;
  anchorId?: string;
}) {
  const fee = platformFeePercent();

  return (
    <div
      id={anchorId}
      className="scroll-mt-24 rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-4"
    >
      <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
        Organisers — read this
      </p>
      <h3 className="mt-1 text-base font-black text-emerald-950">
        Is this your event? Claim it free and keep more of your ticket money
      </h3>
      <p className="mt-2 text-sm text-emerald-900">
        We listed this from a public calendar, so anyone wanting tickets goes
        back to the site we found it on — and that site takes its cut. Claim the
        page and you can sell the same seats here instead.
      </p>

      <ul className="mt-3 space-y-1.5 text-sm text-emerald-900">
        <li>
          <strong>Listing is free</strong>, on every plan, for as many events as
          you like.
        </li>
        <li>
          <strong>{fee}% on tickets you sell</strong> on the free plan, and{" "}
          <strong>nothing at all</strong> on a paid plan — most ticket sites take
          several times that, plus a booking fee off your buyer.
        </li>
        <li>
          <strong>Free entry stays free:</strong> no ticket, no fee, ever.
        </li>
        <li>
          Card QR tickets by email, price tiers, coupon codes and a live seat
          count — and on Featured the money lands in your own Stripe account.
        </li>
        <li>
          Your page then publishes itself to EventRinger.com, GoDesi.wiki and
          your category page, with add-to-calendar for attendees and an embed
          for your own site.
        </li>
      </ul>

      <div className="mt-3 rounded-xl bg-white/70 p-3 text-xs text-emerald-900">
        <strong>100 seats at $20</strong> = $2,000. On the free plan we keep
        $40; on a paid plan we keep nothing, and the plan costs less than three
        tickets.
      </div>

      <div className="mt-4">
        {signedIn ? (
          <ClaimEventForm eventId={eventId} />
        ) : (
          <Link
            href={`/login?next=/events/${slug}`}
            className="block w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-center text-sm font-bold text-white hover:bg-emerald-700"
          >
            Sign in to claim this event
          </Link>
        )}
      </div>

      <p className="mt-3 text-xs text-emerald-800">
        We check with you before handing anything over, and nothing about this
        page changes until you say so.{" "}
        <Link
          href="/events/how-it-works"
          className="font-bold underline hover:no-underline"
        >
          Fees, tickets and where you get listed →
        </Link>
      </p>
    </div>
  );
}
