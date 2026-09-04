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
  website: string | null;
  halls: string[];
};

const NEW_VENUE = "__new__";

/**
 * Venue, hall and map location. Every venue already on Godesi is offered in a
 * dropdown (grouped by city) and fills in the address, map, website and halls on
 * pick; organisers whose venue is missing choose "Add a new venue" and type it
 * once — it is saved for the next organiser and gets its own /venues page.
 */
export function EventVenueFields({
  venues,
  online,
  initialVenue = "",
}: {
  venues: VenueOption[];
  /** Online-only events do not need an address or a map link. */
  online: boolean;
  /** Venue name already on the event, when editing. */
  initialVenue?: string;
}) {
  const initialMatch = venues.find(
    (item) => item.name.toLowerCase() === initialVenue.trim().toLowerCase(),
  );
  const [choice, setChoice] = useState(
    initialMatch ? initialMatch.id : initialVenue ? NEW_VENUE : "",
  );
  const [typed, setTyped] = useState(initialMatch ? "" : initialVenue);

  const picked = venues.find((item) => item.id === choice);
  const adding = online || choice === NEW_VENUE;

  const cities = Array.from(new Set(venues.map((item) => item.city))).sort();

  const fill = (venue: VenueOption) => {
    const form = document.forms.namedItem("event-form");
    if (!form) return;
    const set = (name: string, next: string | null) => {
      const field = form.elements.namedItem(name);
      if (
        field instanceof HTMLInputElement ||
        field instanceof HTMLSelectElement
      ) {
        field.value = next ?? "";
      }
    };
    set("city", venue.city);
    set("state", venue.state);
    set("country", venue.country);
    set("address", venue.address);
    set("mapsUrl", venue.mapsUrl);
    set("venueUrl", venue.website);
  };

  const onPick = (value: string) => {
    setChoice(value);
    const venue = venues.find((item) => item.id === value);
    if (venue) fill(venue);
  };

  return (
    <>
      {online ? null : (
        <Field
          label="Venue"
          required
          hint="Pick a venue already on Godesi — it fills the address for you — or add yours"
        >
          <select
            value={choice}
            onChange={(event) => onPick(event.target.value)}
            className={inputClass}
            aria-label="Venue"
            required
          >
            <option value="">Choose a venue…</option>
            <option value={NEW_VENUE}>➕ Add a new venue (not listed)</option>
            {cities.map((city) => (
              <optgroup key={city} label={city}>
                {venues
                  .filter((item) => item.city === city)
                  .map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
        </Field>
      )}

      {picked && !online ? (
        <input type="hidden" name="venue" value={picked.name} />
      ) : !adding ? null : (
        <Field
          label={online ? "Where it happens online" : "New venue name"}
          required
          hint={
            online
              ? "e.g. Zoom, YouTube Live"
              : "Banquet hall, temple, gurdwara, community centre — saved for the next organiser"
          }
        >
          <input
            name="venue"
            required
            value={typed}
            onChange={(event) => setTyped(event.target.value)}
            placeholder={online ? "" : "e.g. Royal Albert's Palace"}
            className={inputClass}
          />
        </Field>
      )}

      <Field
        label="Hall / room"
        hint={
          picked?.halls.length
            ? `Used here before: ${picked.halls.join(", ")}`
            : "Optional — for venues with several halls, e.g. Crystal Hall"
        }
      >
        <input name="hallName" list="godesi-halls" className={inputClass} />
        <datalist id="godesi-halls">
          {(picked?.halls ?? []).map((hall) => (
            <option key={hall} value={hall} />
          ))}
        </datalist>
      </Field>

      <Field
        label="Hall capacity"
        hint="Optional — how many people it seats, so guests know the size"
      >
        <input
          name="hallCapacity"
          type="number"
          min={0}
          className={inputClass}
        />
      </Field>

      <Field
        label="Venue website"
        hint={
          picked?.website
            ? "From the venue's Godesi page"
            : "Optional — the venue's own site, shown on its Godesi page"
        }
      >
        <input
          name="venueUrl"
          defaultValue={initialMatch?.website ?? ""}
          placeholder="https://royalalbertspalace.com"
          className={inputClass}
        />
      </Field>

      {online ? null : (
        <>
          <Field
            label="Street address"
            hint="Shown on the event page so people find it"
          >
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
