"use client";

import { useFormState } from "react-dom";
import { createEventAction } from "@/app/actions/events";
import { emptyState } from "@/lib/actions";
import { Alert, Field, inputClass } from "@/components/ui";
import { CurrencySelect } from "@/components/forms/CurrencySelect";
import { SubmitButton } from "@/components/SubmitButton";
import { CategorySelect, type CategoryOption } from "@/components/forms/CategorySelect";
import { ImageField } from "@/components/forms/ImageField";

/** Suggested seat types; organisers can rename them to anything. */
const TIER_PRESETS = ["Basic", "Webinar", "Premium"];

export function EventForm({
  categories,
  defaultCurrency,
  defaultCategory,
  defaultSubcategory,
}: {
  categories: CategoryOption[];
  defaultCurrency: string;
  defaultCategory?: string;
  defaultSubcategory?: string;
}) {
  const [state, formAction] = useFormState(createEventAction, emptyState);

  return (
    <form action={formAction} className="space-y-4">
      {state.error ? <Alert>{state.error}</Alert> : null}

      <Field label="Event title" hint="e.g. Diwali Mela 2026 — food stalls & live music">
        <input name="title" required className={inputClass} />
      </Field>
      <Field label="Description">
        <textarea name="description" rows={4} required className={inputClass} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Date">
          <input name="date" type="date" required className={inputClass} />
        </Field>
        <Field label="Start time" hint="India Standard Time">
          <input name="time" type="time" required className={inputClass} />
        </Field>
        <Field label="Venue">
          <input name="venue" required className={inputClass} />
        </Field>
        <Field label="City">
          <input name="city" required className={inputClass} />
        </Field>
        <CategorySelect
          categories={categories}
          required={false}
          defaultCategory={defaultCategory}
          defaultSubcategory={defaultSubcategory}
        />
        <Field label="Ticket price" hint="Leave 0 for a free event">
          <input name="price" type="number" min={0} defaultValue={0} className={inputClass} />
        </Field>
        <CurrencySelect defaultValue={defaultCurrency} />
        <Field label="Seats available">
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
          Ticket types (optional)
        </legend>
        <p className="text-xs text-slate-500">
          Add Basic / Webinar / Premium seats with their own price and quantity. Leave
          blank to sell all seats at the single price above.
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

      <SubmitButton pendingLabel="Publishing...">Publish event</SubmitButton>
    </form>
  );
}
