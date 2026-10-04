type CouponFor = "event" | "business" | "listing";

const CREATE: Record<CouponFor, string[]> = {
  event: [
    "Pick a short code people remember, e.g. EARLYBIRD, DIWALI20 or FAMILY10 (letters, numbers, dashes).",
    "Set the % off and, if you like, a use limit (\u201cfirst 25 bookings\u201d) and a last day — limits make people book sooner.",
    "Leave \u201cShow as a clip-out coupon\u201d ticked and the code shows on your event page as a ✂️ coupon. Untick it for a private code you only give to your own list.",
    "Buyers type the code in the Coupon code box when they book; the discount comes off before they pay. Each member can use a code once.",
  ],
  business: [
    "Write the offer as the headline, e.g. \u201c15% off your first catering order\u201d.",
    "Add a promo code if customers should quote one when they call or book (e.g. GODESI15), and a last day if it ends.",
    "Your offer shows on your card, on godesi.com/deals and on the home page as a ✂️ clip-out coupon customers can download.",
  ],
  listing: [
    "Write the offer as the headline, e.g. \u201c$200 off the first month\u2019s rent\u201d or \u201cFree delivery in Edison\u201d.",
    "Add a code buyers should quote when they message you, and a last day if it ends.",
    "It shows on your listing as a ✂️ clip-out coupon buyers can download and show you.",
  ],
};

const PROMOTE = [
  "Share the page link in your WhatsApp groups, status and Facebook groups and say \u201cuse code … for … off\u201d.",
  "Download the coupon image and post it on Instagram, Facebook or WhatsApp status — it carries the code and the link.",
  "Print the code on your flyer or poster, and mention it on the radio, at the counter or at your next event.",
  "Give it an end date and say so (\u201cends Sunday\u201d) — a deadline is what gets people to act.",
];

/** Plain how-to for anyone setting up a coupon, and how to get it seen. */
export function CouponTips({ kind }: { kind: CouponFor }) {
  return (
    <details className="rounded-xl border border-amber-200 bg-white/70 p-3 text-xs text-slate-700">
      <summary className="cursor-pointer font-bold text-amber-900">
        ✂️ How coupons work — and how to advertise yours
      </summary>
      <div className="mt-2 grid gap-3 sm:grid-cols-2">
        <div>
          <p className="mb-1 font-semibold text-slate-900">Create it</p>
          <ol className="list-decimal space-y-1 pl-4">
            {CREATE[kind].map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ol>
        </div>
        <div>
          <p className="mb-1 font-semibold text-slate-900">Advertise it</p>
          <ul className="list-disc space-y-1 pl-4">
            {PROMOTE.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      </div>
    </details>
  );
}
