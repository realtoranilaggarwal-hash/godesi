"use client";

import { useState, useTransition } from "react";
import { redesignInquiryAction } from "@/app/actions/designPoll";
import { inputClass } from "@/components/ui";
import { ANIL_PHONE_DISPLAY, ANIL_PHONE_TEL, ANIL_SMS } from "@/lib/designVotes";

/** Call/text line for Anil — shown after a vote and in the page footer. */
export function RedesignCallLine({ className = "" }: { className?: string }) {
  return (
    <p className={`text-sm text-slate-700 ${className}`}>
      Want a redesign like this?{" "}
      <a href={ANIL_PHONE_TEL} className="whitespace-nowrap font-bold text-indigo-700 underline">
        Call
      </a>{" "}
      or{" "}
      <a href={ANIL_SMS} className="whitespace-nowrap font-bold text-indigo-700 underline">
        text
      </a>{" "}
      Anil at{" "}
      <a href={ANIL_PHONE_TEL} className="whitespace-nowrap font-bold text-slate-900">
        {ANIL_PHONE_DISPLAY}
      </a>
    </p>
  );
}

export function RedesignInquiryForm() {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-center">
        <p className="font-black text-emerald-800">✅ Got it — Anil will call or text you shortly.</p>
      </div>
    );
  }

  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        setError(null);
        start(async () => {
          const result = await redesignInquiryAction(formData);
          if (result.ok) setDone(true);
          else setError(result.error);
        });
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-xs font-bold text-slate-600">
          Your name *
          <input name="name" required maxLength={80} className={`${inputClass} mt-1`} placeholder="Full name" />
        </label>
        <label className="block text-xs font-bold text-slate-600">
          Phone / WhatsApp *
          <input
            name="phone"
            type="tel"
            required
            maxLength={30}
            className={`${inputClass} mt-1`}
            placeholder="+1 555 123 4567"
          />
        </label>
        <label className="block text-xs font-bold text-slate-600">
          Email *
          <input
            name="email"
            type="email"
            required
            maxLength={120}
            className={`${inputClass} mt-1`}
            placeholder="you@example.com"
          />
        </label>
        <label className="block text-xs font-bold text-slate-600">
          Your current website
          <input
            name="website"
            maxLength={300}
            className={`${inputClass} mt-1`}
            placeholder="yourbusiness.com"
          />
        </label>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-60 sm:w-auto"
      >
        {pending ? "Sending…" : "Get my free redesign quote"}
      </button>
    </form>
  );
}
