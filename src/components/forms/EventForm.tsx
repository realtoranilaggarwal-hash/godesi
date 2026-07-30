"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { createEventAction } from "@/app/actions/events";
import { emptyState } from "@/lib/actions";
import { Field, inputClass } from "@/components/ui";
import { CurrencySelect } from "@/components/forms/CurrencySelect";
import { SubmitButton } from "@/components/SubmitButton";
import { WriteHelper } from "@/components/WriteHelper";
import { CategorySelect, type CategoryOption } from "@/components/forms/CategorySelect";
import { ImageField } from "@/components/forms/ImageField";
import {
  EVENT_FEATURE_GROUPS,
  EVENT_FREQUENCIES,
  EVENT_MODES,
  EVENT_TYPES,
} from "@/lib/eventOptions";
import { FormError } from "@/components/forms/FormError";
import {
  EventVenueFields,
  type VenueOption,
} from "@/components/forms/EventVenueFields";
import { EventPartnerPanel } from "@/components/forms/EventPartnerPanel";
import { WEBSITE_OFFER } from "@/lib/websiteOffer";

/** Suggested seat types; organisers can rename them to anything. */
const TIER_PRESETS = ["Basic", "Webinar", "Premium"];

export function EventForm({
  categories,
  defaultCurrency,
  defaultCategory,
  defaultSubcategory,
  defaultCountry,
  venues,
  feePercent,
  feeWaived,
}: {
  categories: CategoryOption[];
  defaultCurrency: string;
  defaultCategory?: string;
  defaultSubcategory?: string;
  defaultCountry: string;
  /** Venues already used on Godesi, offered as suggestions. */
  venues: VenueOption[];
  /** Godesi's service fee on paid tickets, as a percentage. */
  feePercent: number;
  /** True when this organiser's plan means Godesi takes nothing. */
  feeWaived: boolean;
}) {
  const [state, formAction] = useFormState(createEventAction, emptyState);
  const [mode, setMode] = useState<string>("OFFLINE");
  const [frequency, setFrequency] = useState<string>("ONE_TIME");
  const [speakers, setSpeakers] = useState([0]);
  const [sessions, setSessions] = useState([0]);
  const [extraCategories, setExtraCategories] = useState<string[]>([]);

  const toggleCategory = (slug: string) =>
    setExtraCategories((current) =>
      current.includes(slug)
        ? current.filter((item) => item !== slug)
        : [...current, slug],
    );

  return (
    <form action={formAction} name="event-form" className="space-y-4">
      <FormError>{state.error}</FormError>

      <Field label="Event title" hint="e.g. Diwali Mela 2026 — food stalls & live music">
        <input name="title" required className={inputClass} />
      </Field>
      <Field label="Description">
        <textarea name="description" rows={4} required className={inputClass} />
        <WriteHelper
          kind="event"
          target="description"
          fields={{
            title: "Event title",
            city: "City",
            venue: "Venue",
            startsAt: "Date and time",
          }}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Date">
          <input name="date" type="date" required className={inputClass} />
        </Field>
        <Field label="Start time" hint="India Standard Time">
          <input name="time" type="time" required className={inputClass} />
        </Field>
        <Field label="Event type">
          <select name="eventType" required className={inputClass}>
            <option value="">Select a type</option>
            {EVENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Event mode">
          <select
            name="mode"
            value={mode}
            onChange={(event) => setMode(event.target.value)}
            className={inputClass}
          >
            {EVENT_MODES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.icon} {option.label}
              </option>
            ))}
          </select>
        </Field>
        <EventVenueFields venues={venues} online={mode === "ONLINE"} />
        {mode === "OFFLINE" ? null : (
          <Field label="Join link" hint="Zoom, Meet or stream URL">
            <input
              name="onlineUrl"
              placeholder="https://zoom.us/j/…"
              className={inputClass}
            />
          </Field>
        )}
        <Field
          label="Event website"
          hint="Your own page or booking site — shown as a link, so no need to type it in the description"
        >
          <input
            name="websiteUrl"
            type="url"
            placeholder="https://www.example.org"
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500">
            No website?{" "}
            <a href="/website" target="_blank" className="font-semibold text-indigo-600">
              Godesi can build you one for ${WEBSITE_OFFER.priceUsd}
            </a>
            .
          </p>
        </Field>
        <Field label="City">
          <input name="city" required className={inputClass} />
        </Field>
        <Field label="State / province">
          <input name="state" required className={inputClass} />
        </Field>
        <Field label="Country">
          <input
            name="country"
            required
            defaultValue={defaultCountry}
            className={inputClass}
          />
        </Field>
        <Field label="How often?">
          <select
            name="frequency"
            value={frequency}
            onChange={(event) => setFrequency(event.target.value)}
            className={inputClass}
          >
            {EVENT_FREQUENCIES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
        {frequency === "RECURRING" ? (
          <Field label="Repeats" hint="e.g. Every Sunday 10am">
            <input name="recurrence" className={inputClass} />
          </Field>
        ) : null}
        <CategorySelect
          categories={categories}
          required={false}
          defaultCategory={defaultCategory}
          defaultSubcategory={defaultSubcategory}
        />
        <Field label="Tags" hint="Comma separated — e.g. garba, live music, family">
          <input name="tags" className={inputClass} />
        </Field>
        <Field label="Ticket price" hint="Leave 0 for a free event">
          <input name="price" type="number" min={0} defaultValue={0} className={inputClass} />
        </Field>
        <CurrencySelect defaultValue={defaultCurrency} />
        <Field label="Capacity" hint="Total seats or spots available">
          <input
            name="seatsTotal"
            type="number"
            min={1}
            defaultValue={50}
            required
            className={inputClass}
          />
        </Field>
        <ImageField
          name="imageUrl"
          label="Event banner"
          purpose="event"
          previewClassName="h-24 w-40 rounded-xl object-cover"
        />
        <Field
          label="Video link (YouTube or Vimeo)"
          hint="Optional — paste a link like https://youtu.be/abc123 and it plays on the page."
        >
          <input
            name="videoUrl"
            defaultValue={""}
            placeholder="https://www.youtube.com/watch?v=..."
            className={inputClass}
          />
        </Field>
      </div>

      <fieldset className="space-y-3 rounded-2xl border border-slate-200 p-4">
        <legend className="px-1 text-sm font-bold text-slate-900">
          What does your event offer?
        </legend>
        <p className="text-xs text-slate-500">
          Tick everything that applies — these become the filters people search
          with, like parking, food and family friendly.
        </p>
        {EVENT_FEATURE_GROUPS.map((group) => (
          <div key={group.key}>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              {group.label}
            </p>
            <div className="mt-1 grid gap-1.5 sm:grid-cols-2">
              {group.options.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center gap-2 text-sm text-slate-700"
                >
                  <input
                    type="checkbox"
                    name="features"
                    value={option.value}
                    className="h-4 w-4"
                  />
                  <span>
                    {option.icon} {option.value}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </fieldset>

      <EventPartnerPanel />

      <fieldset className="space-y-2 rounded-2xl border border-slate-200 p-4">
        <legend className="px-1 text-sm font-bold text-slate-900">
          Also list under (optional)
        </legend>
        <p className="text-xs text-slate-500">
          Tick every other category this event belongs to — it shows on all of
          them.
        </p>
        <div className="flex flex-wrap gap-2">
          {categories.map((item) => {
            const active = extraCategories.includes(item.slug);
            return (
              <button
                key={item.slug}
                type="button"
                onClick={() => toggleCategory(item.slug)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                  active
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                    : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {item.icon} {item.name}
              </button>
            );
          })}
        </div>
        {extraCategories.map((slug) => (
          <input key={slug} type="hidden" name="extraCategorySlugs" value={slug} />
        ))}
      </fieldset>

      <fieldset className="space-y-3 rounded-2xl border border-slate-200 p-4">
        <legend className="px-1 text-sm font-bold text-slate-900">
          Speakers & guests (optional)
        </legend>
        {speakers.map((row) => (
          <div key={row} className="grid gap-2 rounded-xl bg-slate-50 p-3">
            <input
              name="speakerName"
              placeholder="Name — e.g. Dr. Meera Iyer"
              className={inputClass}
              aria-label="Speaker name"
            />
            <textarea
              name="speakerBio"
              rows={2}
              placeholder="Short bio — role, company, what they will talk about"
              className={inputClass}
              aria-label="Speaker bio"
            />
            <ImageField
              name="speakerPhoto"
              label="Photo"
              purpose="avatar"
              previewClassName="h-16 w-16 rounded-full object-cover"
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() => setSpeakers((rows) => [...rows, rows.length])}
          className="text-sm font-semibold text-indigo-600 hover:underline"
        >
          + Add another speaker
        </button>
      </fieldset>

      <fieldset className="space-y-3 rounded-2xl border border-slate-200 p-4">
        <legend className="px-1 text-sm font-bold text-slate-900">
          Agenda & stages (optional)
        </legend>
        <p className="text-xs text-slate-500">
          Add each session, talk or stage so attendees know the running order.
        </p>
        {sessions.map((row) => (
          <div key={row} className="grid gap-2 sm:grid-cols-5">
            <input
              name="sessionTitle"
              placeholder="Session title"
              className={`${inputClass} sm:col-span-2`}
              aria-label="Session title"
            />
            <input
              name="sessionStage"
              placeholder="Stage / room"
              className={inputClass}
              aria-label="Session stage"
            />
            <input
              name="sessionStart"
              type="time"
              className={inputClass}
              aria-label="Session start time"
            />
            <input
              name="sessionEnd"
              type="time"
              className={inputClass}
              aria-label="Session end time"
            />
            <input
              name="sessionSpeaker"
              placeholder="Speaker (optional)"
              className={`${inputClass} sm:col-span-5`}
              aria-label="Session speaker"
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() => setSessions((rows) => [...rows, rows.length])}
          className="text-sm font-semibold text-indigo-600 hover:underline"
        >
          + Add another session
        </button>
      </fieldset>

      <fieldset className="space-y-3 rounded-2xl border border-slate-200 p-4">
        <legend className="px-1 text-sm font-bold text-slate-900">
          Ticket types (optional)
        </legend>
        <p className="text-xs text-slate-500">
          Add Basic / Webinar / Premium seats with their own price and quantity. Leave
          blank to sell all seats at the single price above. Connect your own Stripe
          account under{" "}
          <a href="/dashboard/payouts" className="font-semibold text-indigo-600">
            Ticket payouts
          </a>{" "}
          and buyers pay you directly.
        </p>
        {TIER_PRESETS.map((preset) => (
          <div key={preset} className="grid gap-2 sm:grid-cols-3">
            <input
              name="tierName"
              defaultValue=""
              placeholder={`Name — e.g. ${preset}`}
              className={inputClass}
              aria-label={`Ticket type name (${preset})`}
            />
            <input
              name="tierPrice"
              type="number"
              min={0}
              placeholder="Price"
              className={inputClass}
              aria-label={`Ticket type price (${preset})`}
            />
            <input
              name="tierSeats"
              type="number"
              min={1}
              placeholder="Seats"
              className={inputClass}
              aria-label={`Ticket type seats (${preset})`}
            />
          </div>
        ))}
      </fieldset>

      <fieldset className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
        <legend className="px-1 text-sm font-bold text-slate-900">
          How ticket money reaches you
        </legend>
        <ul className="list-disc space-y-1 pl-5 text-slate-700">
          <li>Buyers pay by card on Godesi and get a QR ticket instantly.</li>
          <li>
            Godesi collects the money and sends it to you after the event, minus the
            card processor&apos;s charge (Stripe/PayPal, roughly 3%).
          </li>
          <li>
            {feeWaived ? (
              <span className="font-semibold text-emerald-700">
                Your paid plan means Godesi takes no service fee — you keep the rest.
              </span>
            ) : (
              <>
                Godesi keeps a {feePercent}% service fee on the free plan.{" "}
                <a href="/pricing" className="font-semibold text-indigo-600">
                  Paid members pay no Godesi fee.
                </a>
              </>
            )}
          </li>
          <li>
            Refunds and attendee disputes are yours to decide — Godesi is not a party
            to the sale and does not hold your money in escrow.
          </li>
        </ul>
        <label className="flex items-start gap-2 font-semibold text-slate-800">
          <input
            type="checkbox"
            name="acceptPayoutTerms"
            required
            className="mt-0.5"
          />
          <span>I understand how ticket money and fees are handled.</span>
        </label>
      </fieldset>

      <fieldset className="space-y-3 rounded-2xl border border-amber-200 bg-amber-50/60 p-4">
        <legend className="px-1 text-sm font-bold text-amber-900">
          Coupon or bonus (optional)
        </legend>
        <p className="text-xs text-amber-900">
          Offering something extra or a discount? Put it here instead of inside the
          description, and let people book with the ticket button — typing “call me to
          register” loses you the sale and hides your seats from search.
        </p>
        <Field label="Bonus included" hint="e.g. Parents get 2 free yoga classes">
          <input
            name="bonusNote"
            maxLength={200}
            placeholder="What every attendee also gets"
            className={inputClass}
          />
        </Field>
        <div className="grid gap-2 sm:grid-cols-3">
          <input
            name="couponCode"
            placeholder="Coupon code — EARLYBIRD"
            className={inputClass}
            aria-label="Coupon code"
          />
          <input
            name="couponPercent"
            type="number"
            min={1}
            max={100}
            placeholder="% off"
            className={inputClass}
            aria-label="Coupon percent off"
          />
          <input
            name="couponMaxRedemptions"
            type="number"
            min={1}
            placeholder="Max uses (optional)"
            className={inputClass}
            aria-label="Coupon maximum redemptions"
          />
        </div>
      </fieldset>

      <SubmitButton pendingLabel="Publishing...">Publish event</SubmitButton>
    </form>
  );
}
