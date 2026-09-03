import type { Metadata } from "next";
import Link from "next/link";
import {
  AUTO_RELEASE_DAYS,
  CARD_RATE_FIXED_USD,
  CARD_RATE_PERCENT,
  GIG_FEE_USD,
  GIG_MAX_USD,
  GIG_MIN_USD,
  cardCostUsd,
} from "@/lib/gigs";
import { Card, LinkButton } from "@/components/ui";

export const metadata: Metadata = {
  title: "How gigs work — the $2 fee, payment and payout",
  description: `Sell or buy a small service on Godesi for $${GIG_MIN_USD}–$${GIG_MAX_USD}. Godesi keeps a flat $${GIG_FEE_USD}; here is exactly where it goes and how the seller is paid.`,
  alternates: { canonical: "/gigs/how-it-works" },
};

const EXAMPLES = [5, 25, 60, 100];

const STEPS = [
  ["List", "Title, what you will do, what is included, a price and a delivery time. It shows on /gigs and on your Godesi card."],
  ["Order", "The buyer writes a brief and pays by card. The money is charged straight away and held by Godesi."],
  ["Deliver", "You and the buyer talk in the order room. When done, you post the delivery — a file link, the reading, the document."],
  ["Confirm", `The buyer confirms and you are paid. If they say nothing, it releases on its own ${AUTO_RELEASE_DAYS} days after delivery.`],
  ["Problem?", "The buyer can raise one within that window. Godesi staff read the order room and settle it: release to you or refund to them. No card chargebacks, no shouting on WhatsApp."],
];

export default function GigsHowItWorksPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">
          Gigs
        </p>
        <h1 className="text-3xl font-black">How gigs work, and why we keep $2</h1>
        <p className="mt-2 text-slate-600">
          Gigs are small fixed-price jobs, ${GIG_MIN_USD} to ${GIG_MAX_USD}. The
          buyer pays the price, Godesi keeps a flat ${GIG_FEE_USD}, and the seller
          gets the rest. That is the whole price list.
        </p>
      </div>

      <Card>
        <h2 className="text-lg font-bold">Where the $2 goes</h2>
        <p className="mt-1 text-sm text-slate-700">
          Card payments are not free. Stripe, the processor, charges{" "}
          {CARD_RATE_PERCENT}% + ${CARD_RATE_FIXED_USD.toFixed(2)} on every
          payment, and Godesi pays that out of the $2 — not you. What is left
          pays for holding the money safely, the order room, and a person to
          settle disputes. We take no percentage of your price and charge no
          listing or monthly fee for gigs.
        </p>
        <table className="mt-3 w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="py-1">Gig price</th>
              <th className="py-1">Card processor takes</th>
              <th className="py-1">Left for Godesi</th>
              <th className="py-1">Seller receives</th>
            </tr>
          </thead>
          <tbody>
            {EXAMPLES.map((price) => {
              const card = cardCostUsd(price);
              return (
                <tr key={price} className="border-t border-slate-100">
                  <td className="py-1.5 font-semibold">${price}</td>
                  <td className="py-1.5">${card.toFixed(2)}</td>
                  <td className="py-1.5">${Math.max(0, GIG_FEE_USD - card).toFixed(2)}</td>
                  <td className="py-1.5 font-bold text-emerald-700">
                    ${price - GIG_FEE_USD}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className="mt-2 text-xs text-slate-500">
          Processor rate is Stripe&apos;s published US card rate. A $5 gig leaves
          us about $1.55; a $100 gig leaves us nothing at all after the card fee
          — the flat $2 is deliberately not a profit centre.
        </p>
      </Card>

      <Card>
        <h2 className="text-lg font-bold">Step by step</h2>
        <ol className="mt-2 space-y-3">
          {STEPS.map(([title, body], index) => (
            <li key={title} className="flex gap-3 text-sm">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 font-black text-white">
                {index + 1}
              </span>
              <div>
                <p className="font-bold">{title}</p>
                <p className="text-slate-700">{body}</p>
              </div>
            </li>
          ))}
        </ol>
      </Card>

      <Card>
        <h2 className="text-lg font-bold">Getting paid</h2>
        <p className="mt-1 text-sm text-slate-700">
          Listing is free and needs no bank details. Once you have a sale, connect
          your own Stripe account under{" "}
          <Link href="/dashboard/payouts" className="font-semibold underline">
            Payouts
          </Link>{" "}
          (any plan — free members too). Each released order is transferred to
          it the same day and Stripe pays your bank on its normal schedule. Not
          connected yet? Released money is recorded as owed to you and we settle
          it by hand once you connect, or by bank transfer on request.
        </p>
      </Card>

      <Card>
        <h2 className="text-lg font-bold">Rules</h2>
        <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-700">
          <li>Your own words and your own samples — nothing copied from another site.</li>
          <li>Prices are whole US dollars between ${GIG_MIN_USD} and ${GIG_MAX_USD}. Bigger work: post it as a requirement instead.</li>
          <li>Keep the conversation in the order room; it is what staff read if there is a disagreement.</li>
          <li>No gigs for anything illegal, medical prescriptions, or academic cheating.</li>
        </ul>
      </Card>

      <div className="flex flex-wrap gap-2">
        <LinkButton href="/dashboard/gigs">🛠️ List a gig</LinkButton>
        <LinkButton href="/gigs" variant="secondary">
          Browse gigs
        </LinkButton>
      </div>
    </div>
  );
}
