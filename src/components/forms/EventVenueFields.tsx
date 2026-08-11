"use client";

import { useState } from "react";
import { Field, inputClass } from "@/components/ui";

export type VenueOption = {
  id: string;
  name: string;
  city: string;
  state: string | null;
  country: string | null;
  address: string | null;
  mapsUrl: string | null;
  halls: string[];
};

/**
 * Venue, hall and map location. Venues other organisers have already used are
 * offered as suggestions and fill in the address, city and halls on pick, so the
 * same banquet hall is not retyped (and mis-spelled) for every event.
 */
export function EventVenueFields({
  venues,
  online,
}: {
  venues: VenueOption[];
  /** Online-only events do not need an address or a map link. */
  online: boolean;
}) {
  const [venue, setVenue] = useState("");
  const match = venues.find(
    (item) => item.name.toLowerCase() === venue.trim().toLowerCase(),
  );

  const apply = (value: string) => {
    setVenue(value);
    const picked = venues.find(
      (item) => item.name.toLowerCase() === value.trim().toLowerCase(),
    );
    if (!picked) return;
    const form = document.forms.namedItem("event-form");
    if (!form) return;
    const set = (name: string, next: string | null) => {
      const field = form.elements.namedItem(name);
      if ((field instanceof HTMLInputElement || field instanceof HTMLSelectElement) && next) {
        field.value = next;
      }
    };
    set("city", picked.city);
    set("state", picked.state);
    set("country", picked.country);
    set("address", picked.address);
    set("mapsUrl", picked.mapsUrl);
  };

  return (
    <>
      <Field
        label="Venue"
        required
        hint={
          online
            ? "e.g. Zoom, YouTube Live"
            : "Start typing — venues already on Godesi fill in the address for you"
        }
      >
        <input
          name="venue"
          required
          list="godesi-venues"
          value={venue}
          onChange={(event) => apply(event.target.value)}
          className={inputClass}
        />
        <datalist id="godesi-venues">
          {venues.map((item) => (
            <option key={item.id} value={item.name}>
              {item.city}
            </option>
          ))}
        </datalist>
      </Field>

      <Field
        label="Hall / room"
        hint={
          match?.halls.length
            ? `Used here before: ${match.halls.join(", ")}`
            : "Optional — for venues with several halls, e.g. Crystal Hall"
        }
      >
        <input name="hallName" list="godesi-halls" className={inputClass} />
        <datalist id="godesi-halls">
          {(match?.halls ?? []).map((hall) => (
            <option key={hall} value={hall} />
          ))}
        </datalist>
      </Field>

      {online ? null : (
        <>
          <Field label="Street address" hint="Shown on the event page so people find it">
            <input name="address" className={inputClass} />
          </Field>
          <Field
            label="Map link"
            hint="Paste the Google Maps or OpenStreetMap link for the venue"
          >
            <input
              name="mapsUrl"
              placeholder="https://maps.google.com/…"
              className={inputClass}
            />
          </Field>
        </>
      )}
    </>
  );
}
