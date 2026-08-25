"use client";

import { useState } from "react";
import { inputClass } from "@/components/ui";
import { DIAL_CODES, splitDialCode } from "@/lib/dialCodes";

/**
 * Country code picker plus a local number box that submit as one `+<code><number>`
 * value, so nobody saves a number that can't be dialled from abroad.
 */
export function PhoneInput({
  name,
  defaultValue = "",
  required = false,
  fallbackCode = "",
}: {
  name: string;
  defaultValue?: string | null;
  required?: boolean;
  /** Used when the saved number has no country code, e.g. an imported US number. */
  fallbackCode?: string;
}) {
  const parsed = splitDialCode(defaultValue ?? "", fallbackCode);
  const [code, setCode] = useState(parsed.code);
  const [local, setLocal] = useState(parsed.rest);

  // `inputClass` carries w-full, which beats w-32 in Tailwind's output and used
  // to stretch the picker across the row, hiding the number box.
  const boxClass = inputClass.replace("w-full ", "");

  return (
    <div className="flex flex-wrap gap-2">
      <select
        aria-label="Country code"
        required={required || Boolean(local)}
        value={code}
        onChange={(event) => setCode(event.target.value)}
        className={`${boxClass} w-28 shrink-0`}
      >
        <option value="">Country code</option>
        {DIAL_CODES.map((entry) => (
          <option key={entry.code} value={entry.code}>
            {entry.flag} +{entry.code}
          </option>
        ))}
      </select>
      <input
        aria-label="Phone number"
        inputMode="tel"
        required={required}
        minLength={6}
        value={local}
        onChange={(event) =>
          setLocal(event.target.value.replace(/[^\d\s-]/g, ""))
        }
        placeholder="Phone number"
        className={`${boxClass} min-w-0 flex-1 basis-32`}
      />
      <input
        type="hidden"
        name={name}
        value={local ? `+${code}${local.replace(/\D/g, "")}` : ""}
      />
    </div>
  );
}
