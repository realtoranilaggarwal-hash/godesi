"use client";

import { useState } from "react";
import { inputClass } from "@/components/ui";

/** Staff copy a client's private preview link, optionally with a discount code filled in. */
export function ShareLookLink({
  base,
  initialCode = "",
  businessName,
  whatsapp,
  email,
}: {
  base: string;
  initialCode?: string;
  businessName?: string;
  whatsapp?: string | null;
  email?: string | null;
}) {
  const [code, setCode] = useState(initialCode);
  const [copied, setCopied] = useState(false);
  const clean = code.trim().toUpperCase().replace(/\s+/g, "");
  const link = clean ? `${base}?code=${encodeURIComponent(clean)}` : base;
  const message = `Hi${businessName ? ` ${businessName}` : ""}! Your new website is ready to look at: ${link} — tap "I love it" to approve, or "I want changes" to tell us what to fix.`;
  const digits = (whatsapp ?? "").replace(/\D/g, "");
  const waNumber = digits.length === 10 ? `1${digits}` : digits;
  const whatsappHref = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
  const mailHref = `mailto:${email ?? ""}?subject=${encodeURIComponent("Your new website is ready to preview")}&body=${encodeURIComponent(message)}`;

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
      <div className="flex flex-wrap gap-2 pt-1">
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg bg-emerald-600 px-3 py-1.5 font-bold text-white hover:bg-emerald-700"
        >
          Send on WhatsApp{waNumber ? "" : " (pick a contact)"}
        </a>
        <a href={mailHref} className="rounded-lg bg-indigo-600 px-3 py-1.5 font-bold text-white hover:bg-indigo-700">
          Send by email{email ? "" : " (type their address)"}
        </a>
      </div>
    </div>
  );
}
