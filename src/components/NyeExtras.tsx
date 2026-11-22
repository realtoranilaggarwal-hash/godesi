import Link from "next/link";
import { NYE_2027_EVENT_SLUG } from "@/lib/nyeSponsorLevels";

const NYE_2027_SLUGS = [NYE_2027_EVENT_SLUG, "singles-new-years-eve-party-2027-nj"];
const VENUE_NAME = "Royal Albert Palace";
const VENUE_ADDRESS = "1050 King Georges Post Rd, Fords, NJ 08863";

export const OUTFITS_URL = "https://www.amazon.com/s?k=indian+party+wear+outfit&tag=godesi03-20";
export const UBER_URL = `https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff%5Bformatted_address%5D=${encodeURIComponent(VENUE_ADDRESS)}&dropoff%5Bnickname%5D=${encodeURIComponent(VENUE_NAME)}`;

export const UBER_INVITE_CODE = "1p4f8p2heffp";
export const UBER_INVITE_URL = `https://referrals.uber.com/refer?id=${UBER_INVITE_CODE}`;

export const NYE_WHATSAPP_GROUP_URL = "https://chat.whatsapp.com/BmuEFJUZfUw0VkM2e69I4Y";

export function isNye2027(slug: string) {
  return NYE_2027_SLUGS.includes(slug);
}

/** Outfit, ride and Connect links shown with the NYE 2027 ticket form. */
export function NyeExtras() {
  return (
    <div className="mt-4 space-y-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-slate-700">
      <p className="font-bold text-slate-900">✨ Make a night of it</p>
      <p>
        👗{" "}
        <a href={OUTFITS_URL} target="_blank" rel="nofollow sponsored noopener" className="font-semibold underline">
          Party outfits — Indian &amp; western party wear on Amazon ↗
        </a>
      </p>
      <p>
        🚗{" "}
        <a href={UBER_URL} target="_blank" rel="noopener" className="font-semibold underline">
          Book an Uber to {VENUE_NAME} ↗
        </a>
        . New to Uber? Use{" "}
        <a href={UBER_INVITE_URL} target="_blank" rel="nofollow sponsored noopener" className="font-semibold underline">
          invite code {UBER_INVITE_CODE} ↗
        </a>{" "}
        for 50% off your first 2 trips (up to $10 each).
      </p>
      <p className="font-semibold text-red-700">
        ⚠️ Please don&apos;t drink and drive. Ride with Uber or pick a designated driver.
      </p>
      <p>
        💞 Looking for a partner? Make a free{" "}
        <Link href="/connect/new#my-profile" className="font-semibold underline">
          GoDesi Connect profile
        </Link>
        ; singles 21+ can turn on &ldquo;Open to dating&rdquo;.
      </p>
      <p className="text-xs text-slate-500">As an Amazon Associate GoDesi earns from qualifying purchases.</p>
    </div>
  );
}

/** Invite to the NYE guests' WhatsApp group, shown on the NYE 2027 event pages. */
export function NyeWhatsAppGroup() {
  return (
    <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
      <div className="min-w-0">
        <p className="font-bold text-slate-900">💬 Join the NYE party WhatsApp group</p>
        <p className="text-sm text-slate-600">
          Ask questions, find people to go with, and get line-up, parking and ticket updates first.
        </p>
      </div>
      <a
        href={NYE_WHATSAPP_GROUP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex shrink-0 items-center justify-center rounded-xl bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1eb457]"
      >
        Join on WhatsApp ↗
      </a>
    </section>
  );
}
