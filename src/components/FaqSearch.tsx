"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { askQuestionAction } from "@/app/actions/report";
import { emptyState } from "@/lib/actions";
import { inputClass } from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";
import { FormError } from "@/components/forms/FormError";

/**
 * Search the FAQ: typing filters the question list and clicking one opens its
 * answer in place — the <details> elements stay server-rendered.
 */
export function FaqSearch({ items }: { items: { q: string; anchor: string }[] }) {
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();
  const matches = needle
    ? items.filter((item) => item.q.toLowerCase().includes(needle))
    : [];

  const open = (anchor: string) => {
    const details = document.getElementById(anchor);
    if (details instanceof HTMLDetailsElement) details.open = true;
    details?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="not-prose relative">
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="🔍 Search answers — e.g. photos, tickets, gigs, claim"
        aria-label="Search frequently asked questions"
        className={inputClass}
      />
      {needle ? (
        <div className="absolute inset-x-0 top-full z-10 mt-1 max-h-80 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg">
          {matches.length ? (
            <ul className="py-1">
              {matches.map((item) => (
                <li key={item.anchor}>
                  <button
                    type="button"
                    onClick={() => {
                      open(item.anchor);
                      setQuery("");
                    }}
                    className="block w-full px-4 py-2 text-left text-sm font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700"
                  >
                    {item.q}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-4 py-3 text-sm text-slate-600">
              No match — ask us below and we&apos;ll answer by email.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}

/** "Can't find it?" box — emails support so we can answer personally. */
export function FaqAsk() {
  const [state, formAction] = useFormState(askQuestionAction, emptyState);
  if (state.success) {
    return (
      <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
        ✅ {state.success}
      </p>
    );
  }
  return (
    <form action={formAction} className="not-prose space-y-2">
      <FormError>{state.error}</FormError>
      <div className="grid gap-2 sm:grid-cols-2">
        <input
          name="name"
          required
          placeholder="Your name"
          className={inputClass}
        />
        <input
          name="email"
          type="email"
          required
          placeholder="Email we reply to"
          className={inputClass}
        />
      </div>
      <textarea
        name="question"
        required
        rows={2}
        placeholder="Your question…"
        className={inputClass}
      />
      <SubmitButton className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700">
        Ask us
      </SubmitButton>
    </form>
  );
}
