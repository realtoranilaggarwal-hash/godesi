"use client";

import { useFormState } from "react-dom";
import { updateVenueAction } from "@/app/actions/venueClaims";
import { emptyState } from "@/lib/actions";
import { SubmitButton } from "@/components/SubmitButton";
import { Field, inputClass } from "@/components/ui";
import { FormError } from "@/components/forms/FormError";

export function EditVenueForm({
  venue,
}: {
  venue: {
    id: string;
    state: string | null;
    country: string | null;
    address: string | null;
    website: string | null;
    mapsUrl: string | null;
    halls: string[];
    photos: { url: string; hall: string | null }[];
  };
}) {
  const [state, formAction] = useFormState(updateVenueAction, emptyState);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="venueId" value={venue.id} />
      <FormError>{state.error}</FormError>

      <Field
        label="Halls"
        hint="One per line. Organisers pick from this list when they post an event here."
      >
        <textarea
          name="halls"
          rows={6}
          defaultValue={venue.halls.join("\n")}
          placeholder={"Grand Ballroom\nCrystal Hall"}
          className={inputClass}
        />
      </Field>
      <Field
        label="Photos"
        hint="One photo link per line. Put the hall first to show it under that hall, e.g. Ballroom | https://…"
      >
        <textarea
          name="photos"
          rows={6}
          defaultValue={venue.photos
            .map((photo) =>
              photo.hall ? `${photo.hall} | ${photo.url}` : photo.url,
            )
            .join("\n")}
          placeholder="Ballroom | https://…/ballroom.jpg"
          className={inputClass}
        />
      </Field>
      <Field label="Street address">
        <input
          name="address"
          maxLength={300}
          defaultValue={venue.address ?? ""}
          className={inputClass}
        />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="State">
          <input
            name="state"
            maxLength={60}
            defaultValue={venue.state ?? ""}
            className={inputClass}
          />
        </Field>
        <Field label="Country">
          <input
            name="country"
            maxLength={60}
            defaultValue={venue.country ?? ""}
            className={inputClass}
          />
        </Field>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Venue website">
          <input
            name="website"
            type="url"
            defaultValue={venue.website ?? ""}
            placeholder="https://"
            className={inputClass}
          />
        </Field>
        <Field label="Google Maps link">
          <input
            name="mapsUrl"
            type="url"
            defaultValue={venue.mapsUrl ?? ""}
            placeholder="https://maps.app.goo.gl/…"
            className={inputClass}
          />
        </Field>
      </div>

      <SubmitButton pendingLabel="Saving...">Save venue</SubmitButton>
    </form>
  );
}
