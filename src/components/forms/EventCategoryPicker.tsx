"use client";

import { useMemo, useState } from "react";
import { inputClass } from "@/components/ui";
import {
  EVENT_CATEGORY_GROUPS,
  EVENT_LANGUAGES,
  eventCategoryIcon,
  eventCategoryLabel,
} from "@/lib/eventCategories";

const MAX_CATEGORIES = 6;
const MAX_LANGUAGES = 3;

/**
 * Tick the kinds of event this is (garba, standup, satsang…) and the language
 * it runs in — the facets people browse /events by. Several categories are
 * allowed, the way ticket sites tag one night as both Bollywood and DJ.
 */
export function EventCategoryPicker({
  defaultCategories = [],
  defaultLanguages = [],
  hint,
}: {
  defaultCategories?: string[];
  defaultLanguages?: string[];
  hint?: string;
}) {
  const [chosen, setChosen] = useState<string[]>(defaultCategories);
  const [languages, setLanguages] = useState<string[]>(defaultLanguages);
  const [query, setQuery] = useState("");

  const groups = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return EVENT_CATEGORY_GROUPS.map((group) => ({ ...group, options: [...group.options] }));
    return EVENT_CATEGORY_GROUPS.map((group) => ({
      ...group,
      options: group.options.filter(
        (option) =>
          option.label.toLowerCase().includes(needle) ||
          option.slug.includes(needle) ||
          group.label.toLowerCase().includes(needle),
      ),
    })).filter((group) => group.options.length);
  }, [query]);

  const toggle = (slug: string) => {
    setChosen((current) =>
      current.includes(slug)
        ? current.filter((item) => item !== slug)
        : current.length >= MAX_CATEGORIES
          ? current
          : [...current, slug],
    );
  };

  const toggleLanguage = (slug: string) => {
    setLanguages((current) =>
      current.includes(slug)
        ? current.filter((item) => item !== slug)
        : current.length >= MAX_LANGUAGES
          ? current
          : [...current, slug],
    );
  };

  return (
    <fieldset className="space-y-3 rounded-2xl border border-slate-200 p-4 sm:col-span-2">
      <legend className="px-1 text-sm font-bold text-slate-900">
        What kind of event is it?
      </legend>
      <p className="text-xs text-slate-500">
        {hint ??
          `Tick up to ${MAX_CATEGORIES} — these are the lists it shows up in, so a Bollywood DJ night can be both.`}
      </p>

      {chosen.length ? (
        <div className="flex flex-wrap gap-1.5">
          {chosen.map((slug) => (
            <button
              key={slug}
              type="button"
              onClick={() => toggle(slug)}
              className="rounded-full border border-indigo-300 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 hover:bg-indigo-100"
            >
              {eventCategoryIcon(slug)} {eventCategoryLabel(slug)} ×
            </button>
          ))}
        </div>
      ) : null}

      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search categories — garba, comedy, satsang, expo…"
        aria-label="Search event categories"
        className={inputClass}
      />

      <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              {group.label}
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {group.options.map((option) => {
                const active = chosen.includes(option.slug);
                return (
                  <button
                    key={option.slug}
                    type="button"
                    onClick={() => toggle(option.slug)}
                    aria-pressed={active}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                      active
                        ? "border-indigo-500 bg-indigo-600 text-white"
                        : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {option.icon} {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        {groups.length ? null : (
          <p className="text-sm text-slate-500">
            Nothing matches “{query}” — clear the box to see every category.
          </p>
        )}
      </div>

      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
          Language of the event
        </p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {EVENT_LANGUAGES.map((option) => {
            const active = languages.includes(option.slug);
            return (
              <button
                key={option.slug}
                type="button"
                onClick={() => toggleLanguage(option.slug)}
                aria-pressed={active}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                  active
                    ? "border-emerald-500 bg-emerald-600 text-white"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {chosen.map((slug) => (
        <input key={slug} type="hidden" name="genres" value={slug} />
      ))}
      {languages.map((slug) => (
        <input key={slug} type="hidden" name="languages" value={slug} />
      ))}
    </fieldset>
  );
}
