"use client";

import { useState } from "react";
import { Field, inputClass } from "@/components/ui";
import { similarVenues } from "@/lib/venueNames";

export type VenueOption = {
  id: string;
  slug?: string | null;
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
const OTHER_HALL = "__other__";

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

  const [hallChoice, setHallChoice] = useState("");

  const picked = venues.find((item) => item.id === choice);
  const lookalikes =
    choice === NEW_VENUE && !online ? similarVenues(typed, venues) : [];
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
    setHallChoice("");
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
          {lookalikes.length ? (
            <div className="mt-2 rounded-lg border border-amber-300 bg-amber-50 p-2 text-xs text-amber-900">
              <p className="font-semibold">
                Already on Godesi? Pick it instead of adding a copy:
              </p>
              <ul className="mt-1 space-y-1">
                {lookalikes.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-2"
                  >
                    <span>
                      {item.name}, {item.city}
                    </span>
                    <button
                      type="button"
                      onClick={() => onPick(item.id)}
                      className="rounded-md bg-amber-600 px-2 py-0.5 font-semibold text-white hover:bg-amber-700"
                    >
                      Use this venue
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </Field>
      )}

      {online ? null : (
        <>
          {picked?.halls.length ? (
            <Field
              label="Hall / room"
              hint={`${picked.name} has ${picked.halls.length} hall${picked.halls.length === 1 ? "" : "s"} listed — pick yours`}
            >
              <select
                value={hallChoice}
                onChange={(event) => setHallChoice(event.target.value)}
                className={inputClass}
                aria-label="Hall / room"
              >
                <option value="">Choose a hall…</option>
                {picked.halls.map((hall) => (
                  <option key={hall} value={hall}>
                    {hall}
                  </option>
                ))}
                <option value={OTHER_HALL}>Other hall (not listed)</option>
              </select>
              {hallChoice === OTHER_HALL ? (
                <input
                  name="hallName"
                  placeholder="Hall name"
                  aria-label="Other hall name"
                  className={`${inputClass} mt-2`}
                />
              ) : (
                <input type="hidden" name="hallName" value={hallChoice} />
              )}
            </Field>
          ) : (
            <Field
              label="Hall / room"
              hint="Optional — for venues with several halls, e.g. Crystal Hall"
            >
              <input name="hallName" className={inputClass} />
            </Field>
          )}

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
        </>
      )}

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
