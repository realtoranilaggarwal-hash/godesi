"use client";

import { useState } from "react";
import {
  type Bulletin,
  type BulletinRow,
  formatBulletinDate,
  parseBulletinDate,
} from "@/lib/visaBulletin";

type Verdict = "current" | "waiting" | "unavailable";

function verdictFor(cutoff: string, priority: Date): Verdict {
  if (cutoff === "C") return "current";
  if (cutoff === "U") return "unavailable";
  const date = parseBulletinDate(cutoff);
  if (!date) return "unavailable";
  return priority.getTime() < date.getTime() ? "current" : "waiting";
}

const TONE: Record<Verdict, string> = {
  current: "border-emerald-300 bg-emerald-50 text-emerald-800",
  waiting: "border-amber-300 bg-amber-50 text-amber-800",
  unavailable: "border-rose-300 bg-rose-50 text-rose-800",
};

/** Is my priority date current this month? Runs entirely in the browser. */
export function PriorityDateChecker({ bulletin }: { bulletin: Bulletin }) {
  const [kind, setKind] = useState<"employment" | "family">("employment");
  const [category, setCategory] = useState("EB-2");
  const [country, setCountry] = useState<"india" | "rest">("india");
  const [priority, setPriority] = useState("");

  const charts = bulletin[kind];
  const finalRow = charts.finalAction.find((row) => row.category === category);
  const filingRow = charts.filing.find((row) => row.category === category);
  const priorityDate = priority ? new Date(`${priority}T00:00:00Z`) : null;

  function result(label: string, row: BulletinRow | undefined, note: string) {
    if (!row || !priorityDate) return null;
    const cutoff = row[country];
    const verdict = verdictFor(cutoff, priorityDate);
    return (
      <div className={`rounded-xl border p-3 text-sm ${TONE[verdict]}`}>
        <p className="font-bold">{label}</p>
        <p>
          Cut-off: {formatBulletinDate(cutoff)} ·{" "}
          {verdict === "current"
            ? "your date is current ✓"
            : verdict === "waiting"
              ? "not yet — your date is on or after the cut-off"
              : "no numbers this month"}
        </p>
        <p className="mt-1 text-xs opacity-80">{note}</p>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm";

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-4">
        <label className="text-sm font-semibold">
          Type
          <select
            className={inputClass}
            value={kind}
            onChange={(event) => {
              const next = event.target.value as "employment" | "family";
              setKind(next);
              setCategory(bulletin[next].finalAction[0]?.category ?? "");
            }}
          >
            <option value="employment">Employment (EB)</option>
            <option value="family">Family (F)</option>
          </select>
        </label>
        <label className="text-sm font-semibold">
          Category
          <select
            className={inputClass}
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            {charts.finalAction.map((row) => (
              <option key={row.category} value={row.category}>
                {row.category}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-semibold">
          Born in
          <select
            className={inputClass}
            value={country}
            onChange={(event) =>
              setCountry(event.target.value as "india" | "rest")
            }
          >
            <option value="india">India</option>
            <option value="rest">
              Pakistan, Bangladesh, Nepal, Sri Lanka & others
            </option>
          </select>
        </label>
        <label className="text-sm font-semibold">
          Priority date
          <input
            type="date"
            className={inputClass}
            value={priority}
            onChange={(event) => setPriority(event.target.value)}
          />
        </label>
      </div>
      {priorityDate ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {result(
            "Final action date (green card can be approved)",
            finalRow,
            "Your case can be decided when your priority date is before this.",
          )}
          {result(
            "Date for filing (send the I-485 / NVC papers)",
            filingRow,
            kind === "employment" &&
              bulletin.uscisEmploymentChart === "DATES_FOR_FILING"
              ? `USCIS is accepting employment I-485s on this chart in ${bulletin.month}.`
              : "Check uscis.gov/visabulletininfo for which chart USCIS uses this month.",
          )}
        </div>
      ) : (
        <p className="text-sm text-slate-500">
          Pick your category and enter the priority date on your I-797 approval
          notice.
        </p>
      )}
    </div>
  );
}
