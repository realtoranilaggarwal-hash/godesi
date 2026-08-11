"use client";

import { useState } from "react";
import { Field, inputClass } from "@/components/ui";

/** Options for requirements that aren't tied to one city — remote hiring, etc. */
const SCOPES = [
  { value: "city", label: "In a specific city" },
  { value: "Anywhere", label: "Anywhere — location doesn't matter" },
  { value: "Online / remote", label: "Online / remote" },
  { value: "In person — flexible area", label: "In person, but area is flexible" },
  { value: "Open to discuss", label: "Open to discuss" },
];

/**
 * Writes to the same `city` field the server expects: either a typed city, or
 * one of the scope labels for posts that aren't location-bound.
 */
export function LocationScopeField({
  name = "city",
  defaultCity = "",
  label = "City",
}: {
  name?: string;
  defaultCity?: string;
  label?: string;
}) {
  const [scope, setScope] = useState("city");
  const cityBound = scope === "city";

  return (
    <>
      <Field
        label="Where?"
        hint="Hiring remotely or unsure of the area? Pick one of the flexible options."
      >
        <select
          value={scope}
          onChange={(event) => setScope(event.target.value)}
          className={inputClass}
          aria-label="Location scope"
        >
          {SCOPES.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </Field>
      {cityBound ? (
        <Field label={label} required>
          <input
            name={name}
            required
            defaultValue={defaultCity}
            className={inputClass}
          />
        </Field>
      ) : (
        <input type="hidden" name={name} value={scope} />
      )}
    </>
  );
}
