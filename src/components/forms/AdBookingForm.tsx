"use client";

import { useState } from "react";
import { startAdCheckoutAction } from "@/app/actions/ads";
import { SubmitButton } from "@/components/SubmitButton";
import { inputClass } from "@/components/ui";

export type AdBookingOption = { value: number; label: string };

/** Advertisers either rent the slot by the month or buy a pack of views. */
export function AdBookingForm({
  slot,
  durations,
  packs,
}: {
  slot: string;
  durations: AdBookingOption[];
  packs: AdBookingOption[];
}) {
  const [pricing, setPricing] = useState<"MONTHLY" | "IMPRESSIONS">("MONTHLY");

  return (
    <form action={startAdCheckoutAction} className="mt-4 space-y-2">
      <input type="hidden" name="slot" value={slot} />
      <input type="hidden" name="pricing" value={pricing} />

      <div className="grid grid-cols-2 gap-2" role="group" aria-label="Pricing model">
        {(
          [
            { id: "MONTHLY", label: "Monthly" },
            { id: "IMPRESSIONS", label: "Pay per views" },
          ] as const
        ).map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setPricing(option.id)}
            aria-pressed={pricing === option.id}
            className={`rounded-xl border px-3 py-2 text-sm font-semibold ${
              pricing === option.id
                ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                : "border-slate-300 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {pricing === "MONTHLY" ? (
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-700">Duration</span>
          <select name="months" defaultValue={String(durations[0]?.value)} className={inputClass}>
            {durations.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-700">Views</span>
          <select
            name="impressions"
            defaultValue={String(packs[0]?.value)}
            className={inputClass}
          >
            {packs.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <span className="mt-1 block text-xs text-slate-500">
            Your banner rotates with other advertisers and retires automatically once
            these views are delivered.
          </span>
        </label>
      )}

      <label className="block text-sm">
        <span className="mb-1 block font-medium text-slate-700">Coupon code</span>
        <input
          name="couponCode"
          placeholder="Optional"
          className={`${inputClass} uppercase`}
        />
      </label>

      <SubmitButton className="w-full">Buy now</SubmitButton>
    </form>
  );
}
