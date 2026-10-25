"use client";

import { useState, useTransition } from "react";
import { submitCourseSellerAction } from "@/app/actions/courseSeller";

const input =
  "w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200";

export function CourseSellerForm() {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-5 text-center">
        <p className="text-lg font-black text-emerald-800">
          ✅ Application received!
        </p>
        <p className="mt-1 text-sm text-emerald-700">
          We&apos;ll review your course and get back to you within a few days
          with the listing plan.
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
          const res = await submitCourseSellerAction(fd);
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
          Course title *
        </label>
        <input
          name="courseTitle"
          required
          className={input}
          placeholder="e.g. Henna Art for Beginners"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-bold text-slate-600">
          What does it teach? (topics, who it&apos;s for, ~8 lesson titles) *
        </label>
        <textarea
          name="outline"
          required
          rows={5}
          className={input}
          placeholder="Who the course is for, what they'll learn, and roughly the lesson titles you plan…"
        />
      </div>
      {error ? (
        <p className="text-sm font-semibold text-rose-600">{error}</p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-2xl bg-slate-900 px-6 py-3 text-base font-black text-white shadow transition hover:bg-slate-700 disabled:opacity-60"
      >
        {pending ? "Sending…" : "Apply to sell — keep 90% →"}
      </button>
      <p className="text-center text-xs text-slate-400">
        No cost to apply. We review every course before listing.
      </p>
    </form>
  );
}
