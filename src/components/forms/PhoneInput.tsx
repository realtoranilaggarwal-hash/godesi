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
}: {
  name: string;
  defaultValue?: string | null;
  required?: boolean;
}) {
  const parsed = splitDialCode(defaultValue ?? "");
  const [code, setCode] = useState(parsed.code);
  const [local, setLocal] = useState(parsed.rest);

  return (
    <div className="flex gap-2">
      <select
        aria-label="Country code"
        required={required || Boolean(local)}
        value={code}
        onChange={(event) => setCode(event.target.value)}
        className={`${inputClass} w-32 shrink-0`}
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
        placeholder="Number without country code"
        className={inputClass}
      />
      <input
        type="hidden"
        name={name}
        value={local ? `+${code}${local.replace(/\D/g, "")}` : ""}
      />
    </div>
  );
}
