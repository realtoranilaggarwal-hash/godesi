"use client";

import { useState } from "react";
import type { StateFoodContact } from "@/lib/foodSafetyStates";

export function StatePicker({ states }: { states: StateFoodContact[] }) {
  const [code, setCode] = useState("");
  const picked = states.find((row) => row.code === code);

  return (
    <div className="mt-3 space-y-3">
      <label className="block text-sm">
        <span className="font-semibold text-slate-700">Select your state</span>
        <select
          value={code}
          onChange={(event) => setCode(event.target.value)}
          className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm sm:max-w-xs"
        >
          <option value="">— choose —</option>
          {states.map((row) => (
            <option key={row.code} value={row.code}>
              {row.name}
            </option>
          ))}
        </select>
      </label>

      {picked ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm">
          <p className="font-bold text-rose-900">{picked.agency}</p>
          <a
            href={picked.url}
            target="_blank"
            rel="noreferrer noopener"
            className="mt-1 inline-block rounded-xl bg-rose-600 px-3 py-1.5 font-bold text-white hover:bg-rose-700"
          >
            Open {picked.name} food complaints ↗
          </a>
          <p className="mt-2 text-xs text-rose-900/70">
            Look for “file a complaint”, “report a food problem” or “contact
            your local health department” on that page. Big cities (New York,
            Chicago, Los Angeles, Houston) also take restaurant complaints
            through 311.
          </p>
        </div>
      ) : (
        <details className="text-xs text-slate-500">
          <summary className="cursor-pointer font-semibold">
            All states A–Z
          </summary>
          <ul className="mt-2 grid gap-1 sm:grid-cols-2">
            {states.map((row) => (
              <li key={row.code}>
                <a
                  href={row.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-rose-700 hover:underline"
                >
                  {row.name}
                </a>{" "}
                — {row.agency}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
