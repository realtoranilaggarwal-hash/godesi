"use client";

import { useActionState, useState } from "react";
import { bookPoojaAction } from "@/app/actions/pooja";

const input =
  "mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-normal";

export function PoojaBookingForm({ pkg }: { pkg: string }) {
  const [pack, setPack] = useState(pkg);
  const [state, action, pending] = useActionState(bookPoojaAction, {});

  if (state.success) {
    return (
      <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
        {state.success}
      </p>
    );
  }

  return (
    <form action={action} className="grid gap-3 sm:grid-cols-2">
      <input type="hidden" name="package" value={pack} />
      {state.error ? (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 sm:col-span-2">
          {state.error}
        </p>
      ) : null}
      <label className="block text-sm font-semibold text-slate-700">
        Your name
        <input name="name" required className={input} />
      </label>
      <label className="block text-sm font-semibold text-slate-700">
        Email
        <input name="email" type="email" required className={input} />
      </label>
      <label className="block text-sm font-semibold text-slate-700">
        Phone / WhatsApp
        <input name="phone" required className={input} />
      </label>
      <label className="block text-sm font-semibold text-slate-700">
        Preferred date (optional)
        <input name="preferredDate" type="date" className={input} />
      </label>
      <label className="block text-sm font-semibold text-slate-700 sm:col-span-2">
        Name &amp; gotra for the sankalp (optional)
        <input
          name="sankalp"
          placeholder="e.g. Sharma family — gotra Bharadwaj"
          className={input}
        />
      </label>
      <label className="block text-sm font-semibold text-slate-700 sm:col-span-2">
        Anything else — occasion, language, address for prasad
        <textarea name="notes" rows={2} className={input} />
      </label>
      <button
        disabled={pending}
        className="rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 px-4 py-2.5 text-sm font-black text-white hover:opacity-90 disabled:opacity-50 sm:col-span-2"
      >
        {pending ? "Booking…" : "Book this pooja 🙏"}
      </button>
    </form>
  );
}
