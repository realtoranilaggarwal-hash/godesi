"use client";

import { useFormState } from "react-dom";
import { adminUpdateEventAction } from "@/app/actions/admin";
import { emptyState } from "@/lib/actions";
import { Field, inputClass } from "@/components/ui";
import { CurrencySelect } from "@/components/forms/CurrencySelect";
import { SubmitButton } from "@/components/SubmitButton";
import { CategorySelect, type CategoryOption } from "@/components/forms/CategorySelect";
import { ImageField } from "@/components/forms/ImageField";
import { PhotoAlbumField } from "@/components/forms/PhotoAlbumField";
import { FormError } from "@/components/forms/FormError";
import { EVENT_TYPES } from "@/lib/eventOptions";
import { EVENT_TIME_ZONES } from "@/lib/time";
import { FormSuccess } from "@/components/forms/FormSuccess";

export type AdminEventValues = {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  endDate: string;
  endTime: string;
  timeZone: string;
  venue: string;
  hallName: string;
  hallCapacity: number | null;
  venueUrl: string;
  city: string;
  frequency: "ONE_TIME" | "RECURRING";
  recurrence: string;
  categorySlug: string;
  subcategorySlug: string;
  eventType: string;
  websiteUrl: string;
  price: number;
  currency: string;
  seatsTotal: number;
  seatsBooked: number;
  imageUrl: string;
  videoUrl: string;
  albumUrl: string;
  featured: boolean;
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
      <FormError>{state.error}</FormError>

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
        <Field label="Start time" hint="The time where the event happens">
          <input
            name="time"
            type="time"
            defaultValue={event.time}
            required
            className={inputClass}
          />
        </Field>
        <Field
          label="Times are in"
          hint="The venue's own zone — shown to everyone as that"
        >
          <select
            name="timeZone"
            defaultValue={event.timeZone}
            className={inputClass}
          >
            {EVENT_TIME_ZONES.map((zone) => (
              <option key={zone.value} value={zone.value}>
                {zone.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="End date" hint="Optional — for events that run past midnight or over days">
          <input
            name="endDate"
            type="date"
            defaultValue={event.endDate}
            className={inputClass}
          />
        </Field>
        <Field label="End time" hint="Optional — shown as “7:00 pm – 11:00 pm”">
          <input
            name="endTime"
            type="time"
            defaultValue={event.endTime}
            className={inputClass}
          />
        </Field>
        <Field label="Venue">
          <input name="venue" defaultValue={event.venue} required className={inputClass} />
        </Field>
        <Field label="Hall / room" hint="Which hall inside the venue, e.g. Crystal Hall">
          <input name="hallName" defaultValue={event.hallName} className={inputClass} />
        </Field>
        <Field label="Hall capacity" hint="How many people it holds — leave blank if unknown">
          <input
            name="hallCapacity"
            type="number"
            min={0}
            defaultValue={event.hallCapacity ?? ""}
            className={inputClass}
          />
        </Field>
        <Field label="Hall or venue website" hint="Optional — link to the venue's own page">
          <input
            name="venueUrl"
            defaultValue={event.venueUrl}
            placeholder="https://royalalbertspalace.com"
            className={inputClass}
          />
        </Field>
        <Field label="City">
          <input name="city" defaultValue={event.city} required className={inputClass} />
        </Field>
        <Field label="Repeats">
          <select
            name="frequency"
            defaultValue={event.frequency}
            className={inputClass}
          >
            <option value="ONE_TIME">One-time event</option>
            <option value="RECURRING">Repeats</option>
          </select>
        </Field>
        <Field
          label="How often it repeats"
          hint="Plain English, e.g. “Every Sunday 10am” — only used when it repeats"
        >
          <input
            name="recurrence"
            defaultValue={event.recurrence}
            placeholder="Every Sunday 10am"
            className={inputClass}
          />
        </Field>
        <CategorySelect
          categories={categories}
          required={false}
          defaultCategory={event.categorySlug}
          defaultSubcategory={event.subcategorySlug}
        />
        <Field label="Event type">
          <select
            name="eventType"
            defaultValue={event.eventType}
            className={inputClass}
          >
            <option value="">Not set</option>
            {EVENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </Field>
        <Field
          label="Website or booking link"
          hint="Optional — shown as a button on the event page."
        >
          <input
            name="websiteUrl"
            defaultValue={event.websiteUrl}
            placeholder="https://www.iacfnj.org"
            className={inputClass}
          />
        </Field>
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
        <div className="sm:col-span-2">
          <PhotoAlbumField
            defaultValue={event.albumUrl}
            hint="Paste a public Google Photos album link and the event page shows a 3×3 gallery that opens the album."
          />
        </div>
        <Field
          label="Feature this event"
          hint="Pins it to the featured strip at the top of /events, ahead of paid plans."
        >
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={event.featured}
              className="h-4 w-4"
            />
            Show in featured events
          </label>
        </Field>
        <Field label="Status">
          <select name="status" defaultValue={event.status} className={inputClass}>
            <option value="APPROVED">Approved (public)</option>
            <option value="PENDING">Pending review</option>
            <option value="REJECTED">Rejected (hidden)</option>
          </select>
        </Field>
      </div>

      <FormSuccess>{state.success}</FormSuccess>
      <SubmitButton>Save event</SubmitButton>
    </form>
  );
}
