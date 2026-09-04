"use client";

import { useMemo, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { launchCheckoutAction, updateCartAction } from "@/app/actions/websiteBuilder";
import { emptyState } from "@/lib/actions";
import { Button, inputClass } from "@/components/ui";
import { FormError } from "@/components/forms/FormError";
import {
  BASE_INCLUDES,
  BASE_MONTHLY_USD,
  BASE_SETUP_USD,
  type PowerUp,
  type QuotedItem,
} from "@/lib/websiteBuilder";

function SaveButton({ label, busy }: { label: string; busy: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="secondary" disabled={pending}>
      {pending ? busy : label}
    </Button>
  );
}

function LaunchButton({ total }: { total: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full bg-emerald-600 py-3 text-base hover:bg-emerald-700">
      {pending ? "Opening secure checkout…" : `🚀 Launch my website — ${total}`}
    </Button>
  );
}

/**
 * Screen 5: the price table (only shown after approval), the Power-Ups, the
 * "anything else" box and the running total. Stripe opens from here.
 */
export function FeaturesCart({
  id,
  powerUps,
  selected,
  quoted,
  suggested,
  stripeReady,
  cancelled,
}: {
  id: string;
  powerUps: PowerUp[];
  selected: string[];
  quoted: QuotedItem[];
  suggested: string[];
  stripeReady: boolean;
  cancelled: boolean;
}) {
  const [cartState, cartAction] = useFormState(updateCartAction.bind(null, id), emptyState);
  const [launchState, launchAction] = useFormState(launchCheckoutAction.bind(null, id), emptyState);
  const [picked, setPicked] = useState<string[]>(selected);

  const customLines = quoted.filter((item) => !item.powerUp);
  const monthly = useMemo(
    () =>
      BASE_MONTHLY_USD +
      powerUps.filter((p) => picked.includes(p.key)).reduce((sum, p) => sum + p.monthlyUsd, 0) +
      customLines.reduce((sum, item) => sum + item.monthlyUsd, 0),
    [picked, powerUps, customLines],
  );

  return (
    <div className="space-y-6">
      {cancelled ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Checkout was closed before paying — your preview and cart are saved, nothing was
          charged.
        </div>
      ) : null}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-4 py-3">
          <h2 className="font-bold text-slate-900">Your website</h2>
          <p className="text-sm text-slate-600">You approved the design. Here is what it costs.</p>
        </div>
        <table className="w-full text-sm">
          <tbody>
            <tr className="border-b border-slate-100">
              <td className="px-4 py-2">AI website — design, copy, photos, launch</td>
              <td className="px-4 py-2 text-right font-semibold">${BASE_SETUP_USD} once</td>
            </tr>
            <tr className="border-b border-slate-100">
              <td className="px-4 py-2">Hosting, updates and support</td>
              <td className="px-4 py-2 text-right font-semibold">${BASE_MONTHLY_USD}/month</td>
            </tr>
            {BASE_INCLUDES.map((line) => (
              <tr key={line} className="border-b border-slate-100 text-slate-600">
                <td className="px-4 py-1.5">{line}</td>
                <td className="px-4 py-1.5 text-right text-emerald-700">Included</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <form action={cartAction} className="space-y-4">
        <FormError>{cartState.error}</FormError>
        <section>
          <h2 className="text-lg font-bold text-slate-900">⚡ Want to make your website more powerful?</h2>
          <p className="text-sm text-slate-600">
            Power-Ups — add the tools your business needs, remove them any time.
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {powerUps.map((powerUp) => {
              const on = picked.includes(powerUp.key);
              return (
                <label
                  key={powerUp.key}
                  className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-3 ${
                    on ? "border-indigo-500 bg-indigo-50" : "border-slate-200 bg-white"
                  }`}
                >
                  <input
                    type="checkbox"
                    name="powerUps"
                    value={powerUp.key}
                    checked={on}
                    onChange={() =>
                      setPicked((current) =>
                        on ? current.filter((key) => key !== powerUp.key) : [...current, powerUp.key],
                      )
                    }
                    className="mt-1 h-4 w-4 accent-indigo-600"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-slate-900">
                        {powerUp.emoji} {powerUp.label}
                      </span>
                      <span className="shrink-0 text-sm font-semibold text-indigo-700">
                        +${powerUp.monthlyUsd}/mo
                      </span>
                    </span>
                    <span className="block text-xs text-slate-600">{powerUp.description}</span>
                    {suggested.includes(powerUp.key) && !on ? (
                      <span className="mt-1 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                        Matches what you asked for
                      </span>
                    ) : null}
                  </span>
                </label>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4">
          <h2 className="font-bold text-slate-900">Is there anything else you want your website to do?</h2>
          <textarea
            name="extra"
            rows={2}
            maxLength={600}
            placeholder='e.g. "Customers should pay a deposit" or "People should upload documents"'
            className={`${inputClass} mt-2`}
          />
          <p className="mt-1 text-xs text-slate-500">
            AI works out which tool does it and adds an estimate to your cart; anything unusual
            is confirmed by a person before you are charged.
          </p>
          {customLines.length ? (
            <ul className="mt-3 space-y-1 text-sm">
              {customLines.map((item, index) => (
                <li key={`${item.label}-${index}`} className="flex justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2">
                  <span>
                    <span className="font-medium">{item.label}</span>
                    <span className="block text-xs text-slate-500">{item.note}</span>
                  </span>
                  <span className="shrink-0 font-semibold">
                    {item.monthlyUsd ? `+$${item.monthlyUsd}/mo` : "quote"}
                  </span>
                </li>
              ))}
              <li>
                <button type="submit" name="clearQuoted" value="1" className="text-xs text-slate-500 underline">
                  Remove these extras
                </button>
              </li>
            </ul>
          ) : null}
          <div className="mt-3 flex justify-end">
            <SaveButton label="Add to cart" busy="Working…" />
          </div>
        </section>
      </form>

      <section className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/60 p-4">
        <h2 className="font-bold text-slate-900">Total</h2>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-white p-3">
            <div className="text-xs uppercase tracking-wide text-slate-500">Today</div>
            <div className="text-2xl font-black text-slate-900">${BASE_SETUP_USD + monthly}</div>
            <div className="text-xs text-slate-500">${BASE_SETUP_USD} setup + first month ${monthly}</div>
          </div>
          <div className="rounded-xl bg-white p-3">
            <div className="text-xs uppercase tracking-wide text-slate-500">Then monthly</div>
            <div className="text-2xl font-black text-slate-900">${monthly}/month</div>
            <div className="text-xs text-slate-500">
              Hosting ${BASE_MONTHLY_USD}
              {picked.length ? ` + ${picked.length} Power-Up${picked.length > 1 ? "s" : ""}` : ""}
              {customLines.length ? " + extras" : ""} · cancel any time
            </div>
          </div>
        </div>
        <p className="mt-3 text-sm text-slate-700">
          You approved the website. You&apos;re only paying for the features you&apos;ve selected.
        </p>
        <form action={launchAction} className="mt-3">
          {picked.map((key) => (
            <input key={key} type="hidden" name="powerUps" value={key} />
          ))}
          <FormError>{launchState.error}</FormError>
          {stripeReady ? (
            <LaunchButton total={`$${BASE_SETUP_USD + monthly} today`} />
          ) : (
            <p className="rounded-xl bg-white px-3 py-2 text-sm text-slate-700">
              Card payments are not switched on yet — we have your approved preview and will
              email you to launch it.
            </p>
          )}
        </form>
      </section>
    </div>
  );
}
