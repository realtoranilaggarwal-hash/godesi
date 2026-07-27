"use client";

import { useFormState } from "react-dom";
import { adminUpdateEventAction } from "@/app/actions/admin";
import { emptyState } from "@/lib/actions";
import { Alert, Field, inputClass } from "@/components/ui";
import { CurrencySelect } from "@/components/forms/CurrencySelect";
import { SubmitButton } from "@/components/SubmitButton";
import { CategorySelect, type CategoryOption } from "@/components/forms/CategorySelect";
import { ImageField } from "@/components/forms/ImageField";

export type AdminEventValues = {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  city: string;
  categorySlug: string;
  subcategorySlug: string;
  price: number;
  currency: string;
  seatsTotal: number;
  seatsBooked: number;
  imageUrl: string;
  videoUrl: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
};

export function AdminEventForm({
  event,
  categories,
}: {
  event: AdminEventValues;
  categories: CategoryOption[];
}) {
  const [state, formAction] = useFormState(adminUpdateEventAction, emptyState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="id" value={event.id} />
      {state.error ? <Alert>{state.error}</Alert> : null}
      {state.success ? <Alert tone="success">{state.success}</Alert> : null}

      <Field label="Event title">
        <input name="title" defaultValue={event.title} required className={inputClass} />
      </Field>
      <Field label="Description">
        <textarea
          name="description"
          rows={4}
          defaultValue={event.description}
          required
          className={inputClass}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Date">
          <input
            name="date"
            type="date"
            defaultValue={event.date}
            required
            className={inputClass}
          />
        </Field>
        <Field label="Start time" hint="India Standard Time">
          <input
            name="time"
            type="time"
            defaultValue={event.time}
            required
            className={inputClass}
          />
        </Field>
        <Field label="Venue">
          <input name="venue" defaultValue={event.venue} required className={inputClass} />
        </Field>
        <Field label="City">
          <input name="city" defaultValue={event.city} required className={inputClass} />
        </Field>
        <CategorySelect
          categories={categories}
          required={false}
          defaultCategory={event.categorySlug}
          defaultSubcategory={event.subcategorySlug}
        />
        <Field label="Ticket price" hint="0 for a free event">
          <input
            name="price"
            type="number"
            min={0}
            defaultValue={event.price}
            className={inputClass}
          />
        </Field>
        <CurrencySelect defaultValue={event.currency} />
        <Field label="Seats available" hint={`${event.seatsBooked} already booked`}>
          <input
            name="seatsTotal"
            type="number"
            min={Math.max(event.seatsBooked, 1)}
            defaultValue={event.seatsTotal}
            required
            className={inputClass}
          />
        </Field>
        <ImageField
          name="imageUrl"
          label="Event banner"
          purpose="event"
          defaultValue={event.imageUrl}
          previewClassName="h-24 w-40 rounded-xl object-cover"
        />
        <Field
          label="Video link (YouTube or Vimeo)"
          hint="Optional — paste a link like https://youtu.be/abc123 and it plays on the page."
        >
          <input
            name="videoUrl"
            defaultValue={event.videoUrl}
            placeholder="https://www.youtube.com/watch?v=..."
            className={inputClass}
          />
        </Field>
        <Field label="Status">
          <select name="status" defaultValue={event.status} className={inputClass}>
            <option value="APPROVED">Approved (public)</option>
            <option value="PENDING">Pending review</option>
            <option value="REJECTED">Rejected (hidden)</option>
          </select>
        </Field>
      </div>

      <SubmitButton>Save event</SubmitButton>
    </form>
  );
}
