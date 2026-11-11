"use client";

import { useState } from "react";
import { inputClass } from "@/components/ui";

/** Staff copy a client's private preview link, optionally with a discount code filled in. */
export function ShareLookLink({ base, initialCode = "" }: { base: string; initialCode?: string }) {
  const [code, setCode] = useState(initialCode);
  const [copied, setCopied] = useState(false);
  const clean = code.trim().toUpperCase().replace(/\s+/g, "");
  const link = clean ? `${base}?code=${encodeURIComponent(clean)}` : base;

  return (
    <div className="mt-3 space-y-2 rounded-xl bg-slate-50 px-3 py-2 text-xs">
      <label className="block text-slate-600">
        Discount code to fill in for them (optional)
        <input
          value={code}
          onChange={(event) => {
            setCode(event.target.value);
            setCopied(false);
          }}
          maxLength={40}
          placeholder="e.g. WEB20"
          className={`${inputClass} mt-1 uppercase sm:max-w-xs`}
        />
      </label>
      <p className="text-slate-500">Private link to share (WhatsApp etc.):</p>
      <div className="flex flex-wrap items-center gap-2">
        <a href={link} target="_blank" rel="noopener noreferrer" className="break-all font-semibold text-indigo-700 underline">
          {link}
        </a>
        <button
          type="button"
          onClick={() => {
            void navigator.clipboard?.writeText(link).then(() => setCopied(true));
          }}
          className="rounded-lg border border-slate-300 bg-white px-2 py-1 font-semibold text-slate-700 hover:bg-slate-100"
        >
          {copied ? "Copied ✓" : "Copy"}
        </button>
      </div>
    </div>
  );
}
