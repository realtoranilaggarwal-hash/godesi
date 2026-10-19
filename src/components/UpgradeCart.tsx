"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Currency } from "@/lib/currency";
import {
  BUNDLE_EXTRAS,
  BUNDLE_MONTHS,
  CART_ITEMS,
  describeTerm,
  formatBundleMoney,
  itemPrice,
  priceCart,
  type CartItemKey,
} from "@/lib/bundles";
import {
  startBundleCheckoutAction,
  startStripeCheckoutAction,
} from "@/app/actions/billing";

/** The membership is the base of every cart, so it cannot be unticked. */
const REQUIRED: CartItemKey = "membership";

/** How long we hold the advertised code once they tap it. */
const HOLD_SECONDS = 30;

export function UpgradeCart({
  currency,
  signedIn,
  flashCode,
  flashLeft,
  flashPercent,
  flashFixed,
  flashBonusMonths,
  yearPrice,
  yearListPrice,
  defaultTerm = "FIVE_YEAR",
  autoLock = false,
}: {
  currency: Currency;
  signedIn: boolean;
  /** A live code with uses left, shown as the scarcity offer. */
  flashCode: string | null;
  flashLeft: number | null;
  flashPercent: number;
  flashFixed: number;
  flashBonusMonths: number;
  /** Featured for one year, already discounted, and its 12-month list price. */
  yearPrice: number;
  yearListPrice: number;
  defaultTerm?: "FIVE_YEAR" | "YEAR";
  /** Apply the flash code on arrival, e.g. from the new-business today-only offer. */
  autoLock?: boolean;
}) {
  const [term, setTerm] = useState<"FIVE_YEAR" | "YEAR">(defaultTerm);
  const [selected, setSelected] = useState<CartItemKey[]>([
    "membership",
    "banner-sidebar",
  ]);
  const [code, setCode] = useState("");
  /** Seconds left on the locked offer; null until they lock it. */
  const [held, setHeld] = useState<number | null>(null);

  useEffect(() => {
    if (held === null) return;
    if (held <= 0) {
      setCode("");
      return;
    }
    const timer = setTimeout(() => setHeld(held - 1), 1000);
    return () => clearTimeout(timer);
  }, [held]);

  function lockOffer() {
    if (!flashCode) return;
    setCode(flashCode);
    setHeld(HOLD_SECONDS);
  }

  useEffect(() => {
    if (autoLock && flashCode) {
      setCode(flashCode);
      setHeld(HOLD_SECONDS);
    }
  }, [autoLock, flashCode]);

  const cart = useMemo(
    () => priceCart(selected, currency),
    [selected, currency],
  );

  /** Preview of the advertised code — every other code is priced at checkout. */
  const flashApplied =
    flashCode !== null && code.trim().toUpperCase() === flashCode;
  const flashDiscount = flashApplied
    ? Math.min(
        cart.total,
        flashPercent ? Math.round(cart.total * flashPercent) / 100 : flashFixed,
      )
    : 0;
  const payable = cart.total - flashDiscount;
  const termMonths = BUNDLE_MONTHS + (flashApplied ? flashBonusMonths : 0);
  /** The package discount and the code together, against list price. */
  const totalSaving = Math.max(0, cart.listTotal - payable);
  const totalSavingPercent = cart.listTotal
    ? Math.round((totalSaving / cart.listTotal) * 100)
    : 0;

  function toggle(key: CartItemKey) {
    if (key === REQUIRED) return;
    setSelected((current) =>
      current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key],
    );
  }

  const yearSaving = Math.max(0, yearListPrice - yearPrice);
  const yearSavingPercent = yearListPrice
    ? Math.round((yearSaving / yearListPrice) * 100)
    : 0;

  const termPicker = (
    <div className="flex flex-wrap gap-2">
      {(
        [
          ["FIVE_YEAR", "5 years — full package"],
          [
            "YEAR",
            `1 year — Featured ${formatBundleMoney(yearPrice, currency)}`,
          ],
        ] as const
      ).map(([id, label]) => (
        <button
          key={id}
          type="button"
          onClick={() => setTerm(id)}
          className={`rounded-full border px-4 py-2 text-sm font-bold ${
            term === id
              ? "border-emerald-600 bg-emerald-600 text-white"
              : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );

  if (term === "YEAR") {
    return (
      <div className="space-y-3">
        {termPicker}
        <div className="grid gap-4 rounded-2xl border-2 border-emerald-500 bg-white p-4 sm:grid-cols-[1fr_280px] sm:items-center">
          <div>
            <h3 className="text-lg font-bold">Featured membership — 1 year</h3>
            <p className="mt-1 text-sm text-slate-600">
              Gold ring and Featured ribbon, top of your category, phone and
              email shown, 5 photos, 3 videos, 30 album photos, 5 categories,
              enquiry contacts unlocked and analytics.
            </p>
            <p className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
              The yearly price is already discounted, so coupon codes
              {flashCode ? ` (like ${flashCode})` : ""} don&apos;t apply to it.
              They work on the 5-year package.
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-slate-500">
              12 months bought monthly:{" "}
              <span className="line-through">
                {formatBundleMoney(yearListPrice, currency)}
              </span>
            </p>
            <p className="text-3xl font-black text-slate-900">
              {formatBundleMoney(yearPrice, currency)}
              <span className="text-sm font-semibold text-slate-500">
                {" "}
                / year
              </span>
            </p>
            {yearSaving > 0 ? (
              <p className="mt-1 rounded-xl bg-emerald-50 px-3 py-1 text-sm font-black text-emerald-700">
                You save {formatBundleMoney(yearSaving, currency)} (
                {yearSavingPercent}%)
              </p>
            ) : null}
            {signedIn ? (
              <form action={startStripeCheckoutAction} className="mt-2">
                <input type="hidden" name="plan" value="PREMIUM" />
                <input type="hidden" name="term" value="YEAR" />
                <button
                  type="submit"
                  className="w-full rounded-xl bg-emerald-600 px-4 py-3 font-black text-white hover:bg-emerald-700"
                >
                  Upgrade now — {formatBundleMoney(yearPrice, currency)}
                </button>
              </form>
            ) : (
              <a
                href="/signup?next=/upgrade"
                className="mt-2 block rounded-xl bg-emerald-600 px-4 py-3 text-center font-black text-white hover:bg-emerald-700"
              >
                Sign up free to upgrade
              </a>
            )}
            <p className="mt-1 text-[11px] text-slate-400">
              One payment, no auto-renewal
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {termPicker}
      <div data-right-rail className="grid gap-4 lg:grid-cols-[1fr_320px] lg:items-start">
        <div className="space-y-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <h3 className="text-lg font-bold">Build your package</h3>
            <p className="text-sm text-slate-500">
              Tick what you want — the price on the right updates as you go.
              Banners run in rotation with the other advertisers in that spot, and
              you can watch the views, clicks and CTR of each one in your
              dashboard.
            </p>

            <ul className="mt-3 space-y-2">
              {CART_ITEMS.map((item) => {
                const checked = selected.includes(item.key);
                const locked = item.key === REQUIRED;
                return (
                  <li key={item.key}>
                    <label
                      className={`flex cursor-pointer gap-3 rounded-2xl border p-3 transition ${
                        checked
                          ? "border-emerald-400 bg-emerald-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="mt-1 h-5 w-5 accent-emerald-600"
                        checked={checked}
                        disabled={locked}
                        onChange={() => toggle(item.key)}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-baseline justify-between gap-2">
                          <span className="font-semibold">{item.label}</span>
                          <span className="text-sm font-bold text-slate-700">
                            {formatBundleMoney(
                              itemPrice(item, currency),
                              currency,
                            )}
                          </span>
                        </span>
                        <span className="mt-0.5 block text-xs text-slate-500">
                          {item.blurb}
                        </span>
                        {locked ? (
                          <span className="mt-1 inline-block rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                            always included
                          </span>
                        ) : item.inBundle ? (
                          <span className="mt-1 inline-block rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                            in the deal
                          </span>
                        ) : null}
                        {item.slot ? (
                          <Link
                            href={`/advertise/where/${item.slot.toLowerCase()}`}
                            // Inside the label, so the click must not tick the box.
                            onClick={(event) => event.stopPropagation()}
                            className="mt-1 block text-xs font-semibold text-indigo-600 hover:underline"
                          >
                            See what it looks like and where it shows →
                          </Link>
                        ) : null}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>

          {flashCode ? (
            <div className="rounded-2xl border-2 border-rose-400 bg-gradient-to-r from-rose-600 via-orange-500 to-amber-400 p-4 text-white">
              <p className="text-lg font-black">
                Take everything above for{" "}
                {flashPercent === 50 ? "half price" : `${flashPercent}% off`}
                {flashBonusMonths > 0
                  ? ` — and stretch it to ${Math.round(
                      (12 + flashBonusMonths) / 12,
                    )} years`
                  : ""}
              </p>
              <p className="mt-1 text-sm text-white/90">
                Code <strong>{flashCode}</strong> cuts{" "}
                {formatBundleMoney(cart.total, currency)} to{" "}
                <strong>
                  {formatBundleMoney(
                    cart.total -
                      (flashPercent
                        ? Math.round(cart.total * flashPercent) / 100
                        : flashFixed),
                    currency,
                  )}
                </strong>
                {flashBonusMonths > 0
                  ? ` and runs for ${BUNDLE_MONTHS + flashBonusMonths} months instead of ${BUNDLE_MONTHS}.`
                  : "."}
              </p>
              {held !== null && held > 0 ? (
                <p className="mt-2 rounded-xl bg-white/20 px-3 py-2 text-center text-sm font-black">
                  ⏱ Held for you — 00:{String(held).padStart(2, "0")}. Start the
                  payment before it runs out and the {termMonths}-month term is
                  yours.
                </p>
              ) : (
                <button
                  type="button"
                  onClick={lockOffer}
                  className="mt-2 w-full rounded-xl bg-white px-4 py-2.5 text-sm font-black text-rose-700 hover:bg-rose-50"
                >
                  {held === null
                    ? `Lock this price for ${HOLD_SECONDS} seconds`
                    : "The hold ran out — tap to try again"}
                </button>
              )}
            </div>
          ) : null}

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
              Free with every package
            </h3>
            <ul className="mt-2 space-y-1 text-sm text-slate-600">
              {BUNDLE_EXTRAS.map((extra) => (
                <li key={extra}>✔ {extra}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="lg:sticky lg:top-4">
          <div className="overflow-hidden rounded-2xl border-2 border-emerald-500 bg-white">
            <div className="animate-pulse bg-gradient-to-r from-rose-600 via-orange-500 to-amber-400 px-4 py-2 text-center text-sm font-black uppercase tracking-wide text-white">
              🔥 Get this deal today
            </div>

            <div className="space-y-2 p-4">
              <p className="text-sm font-bold">Your cart</p>
              <ul className="space-y-1 text-xs text-slate-600">
                {cart.items.map((item) => (
                  <li key={item.key} className="flex justify-between gap-2">
                    <span className="truncate">{item.label}</span>
                    <span>
                      {formatBundleMoney(itemPrice(item, currency), currency)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="border-t border-slate-100 pt-2 text-sm">
                <div className="flex justify-between text-slate-500">
                  <span>Bought separately</span>
                  <span className={cart.saving ? "line-through" : ""}>
                    {formatBundleMoney(cart.listTotal, currency)}
                  </span>
                </div>
                {flashDiscount > 0 ? (
                  <div className="flex justify-between font-semibold text-rose-600">
                    <span>Code {flashCode}</span>
                    <span>-{formatBundleMoney(flashDiscount, currency)}</span>
                  </div>
                ) : null}
                <div className="flex items-baseline justify-between">
                  <span className="font-bold">You pay</span>
                  <span className="text-2xl font-black text-slate-900">
                    {formatBundleMoney(payable, currency)}
                  </span>
                </div>
                {flashApplied && flashBonusMonths > 0 ? (
                  <div className="mt-1 rounded-xl bg-amber-100 px-3 py-1 text-center text-xs font-bold text-amber-800">
                    Code {flashCode} makes it {termMonths} months
                  </div>
                ) : null}
                {totalSaving > 0 ? (
                  <div className="mt-1 rounded-xl bg-emerald-50 px-3 py-2 text-center text-sm font-black text-emerald-700">
                    You save {formatBundleMoney(totalSaving, currency)} (
                    {totalSavingPercent}%)
                  </div>
                ) : (
                  <p className="mt-1 text-center text-xs text-slate-500">
                    Add the sidebar banner to unlock the package discount.
                  </p>
                )}
                <p className="mt-1 text-center text-[11px] text-slate-400">
                  {termMonths} months from the day you pay ({describeTerm(termMonths)}) ·
                  one payment, no auto-renewal
                </p>
              </div>

              {flashCode ? (
                <div className="animate-pulse rounded-xl border-2 border-dashed border-rose-400 bg-rose-50 p-3 text-center">
                  <p className="text-xs font-bold uppercase tracking-wide text-rose-700">
                    {flashLeft
                      ? `Only ${flashLeft} left at this price`
                      : "Limited-time code"}
                  </p>
                  <button
                    type="button"
                    onClick={lockOffer}
                    className="mt-1 text-lg font-black text-rose-700 underline"
                  >
                    {flashCode}
                  </button>
                  <p className="text-[11px] text-rose-600">
                    {held !== null && held > 0
                      ? `Held for 00:${String(held).padStart(2, "0")}`
                      : "Tap to apply this code"}
                  </p>
                </div>
              ) : null}

              {signedIn ? (
                <form action={startBundleCheckoutAction} className="space-y-2">
                  {cart.items.map((item) => (
                    <input
                      key={item.key}
                      type="hidden"
                      name="items"
                      value={item.key}
                    />
                  ))}
                  <input
                    name="couponCode"
                    value={code}
                    onChange={(event) =>
                      setCode(event.target.value.toUpperCase())
                    }
                    placeholder="Coupon code"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm uppercase"
                  />
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-emerald-600 px-4 py-3 font-black text-white hover:bg-emerald-700"
                  >
                    Upgrade now — {formatBundleMoney(payable, currency)}
                  </button>
                  <p className="text-center text-[11px] text-slate-500">
                    Some codes cut the price, some add extra years. The final
                    total is shown before you pay.
                  </p>
                </form>
              ) : (
                <a
                  href="/signup?next=/upgrade"
                  className="block rounded-xl bg-emerald-600 px-4 py-3 text-center font-black text-white hover:bg-emerald-700"
                >
                  Sign up free to upgrade
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
