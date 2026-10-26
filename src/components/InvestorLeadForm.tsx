"use client";

import { useState, useTransition } from "react";
import { submitInvestorLeadAction } from "@/app/actions/investor";

const input =
  "w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200";

const AMOUNTS = [
  "$5,000 (one share)",
  "$10,000",
  "$25,000",
  "$50,000 or more",
  "Not sure yet — let's talk",
];

export function InvestorLeadForm() {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-5 text-center">
        <p className="text-lg font-black text-emerald-800">
          ✅ Details received!
        </p>
        <p className="mt-1 text-sm text-emerald-700">
          Thanks for your interest in GoDesi — we&apos;ll reach out shortly to
          talk next steps.
        </p>
      </div>
    );
  }

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const fd = new FormData(form);
        setError(null);
        start(async () => {
          const res = await submitInvestorLeadAction(fd);
          if (res.ok) {
            setDone(true);
          } else {
            setError(res.error);
          }
        });
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-bold text-slate-600">
            Your name *
          </label>
          <input name="name" required className={input} placeholder="Full name" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold text-slate-600">
            Phone / WhatsApp *
          </label>
          <input
            name="phone"
            required
            className={input}
            placeholder="+1 555 123 4567"
          />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-bold text-slate-600">
            Email *
          </label>
          <input
            name="email"
            type="email"
            required
            className={input}
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold text-slate-600">
            Amount you&apos;re considering *
          </label>
          <select name="amount" required className={input} defaultValue="">
            <option value="" disabled>
              Pick a range…
            </option>
            {AMOUNTS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs font-bold text-slate-600">
          Anything you&apos;d like to ask? (optional)
        </label>
        <textarea
          name="message"
          rows={3}
          className={input}
          placeholder="Questions about the numbers, the team, the timeline…"
        />
      </div>
      {error ? (
        <p className="text-sm font-semibold text-rose-600">{error}</p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-2xl bg-emerald-600 px-6 py-3 text-base font-black text-white shadow transition hover:bg-emerald-500 disabled:opacity-60"
      >
        {pending ? "Sending…" : "I'm interested — contact me →"}
      </button>
      <p className="text-center text-xs text-slate-400">
        Only the GoDesi team sees this. No obligation — it starts a
        conversation.
      </p>
    </form>
  );
}
