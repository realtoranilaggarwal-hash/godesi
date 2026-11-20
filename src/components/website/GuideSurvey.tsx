"use client";

import { useState } from "react";

const RATINGS = ["1", "2", "3", "4", "5"];
const YES_NO = ["Yes", "No"];

/** Four-question feedback survey sent to us as a pre-filled WhatsApp message. */
export function GuideSurvey({ whatsappNumber }: { whatsappNumber: string | null }) {
  const [happy, setHappy] = useState("");
  const [easy, setEasy] = useState("");
  const [recommend, setRecommend] = useState("");
  const [change, setChange] = useState("");

  const message = [
    "GoDesi website survey",
    `1. Happy with my website (1-5): ${happy || "-"}`,
    `2. Process was easy: ${easy || "-"}`,
    `3. Would recommend GoDesi: ${recommend || "-"}`,
    `4. Anything to change: ${change.trim() || "-"}`,
  ].join("\n");
  const href = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
    : null;

  return (
    <div className="space-y-4 text-sm">
      <Choice
        label="1. How happy are you with your website?"
        hint="1 = not happy, 5 = love it"
        options={RATINGS}
        value={happy}
        onChange={setHappy}
      />
      <Choice label="2. Was the process easy?" options={YES_NO} value={easy} onChange={setEasy} />
      <Choice
        label="3. Would you recommend GoDesi to a friend?"
        options={YES_NO}
        value={recommend}
        onChange={setRecommend}
      />
      <label className="block">
        <span className="font-semibold text-slate-900">4. Anything you would change?</span>
        <textarea
          value={change}
          onChange={(e) => setChange(e.target.value)}
          rows={3}
          className="mt-1 w-full rounded-xl border border-slate-300 p-2"
          placeholder="Tell us what to improve"
        />
      </label>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block rounded-xl bg-emerald-500 px-4 py-2.5 font-semibold text-white hover:bg-emerald-600"
        >
          💬 Send answers on WhatsApp
        </a>
      ) : null}
    </div>
  );
}

function Choice({
  label,
  hint,
  options,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <fieldset>
      <legend className="font-semibold text-slate-900">{label}</legend>
      {hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
      <div className="mt-1 flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            aria-pressed={value === option}
            className={`min-w-[3rem] rounded-lg border px-3 py-1.5 font-semibold ${
              value === option
                ? "border-indigo-600 bg-indigo-600 text-white"
                : "border-slate-300 bg-white text-slate-700 hover:border-indigo-400"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
