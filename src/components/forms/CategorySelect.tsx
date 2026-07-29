"use client";

import { useMemo, useState } from "react";
import { Field, inputClass } from "@/components/ui";
import { suggestCategories } from "@/lib/categorySuggest";

export type CategoryOption = {
  slug: string;
  name: string;
  icon: string;
  children: { slug: string; name: string }[];
};

/** Two dependent dropdowns: picking a category filters its subcategories. */
export function CategorySelect({
  categories,
  defaultCategory,
  defaultSubcategory,
  required = true,
  label = "Category",
  subLabel = "Subcategory",
  onSubcategoryChange,
  onCategoryChange,
  extraLimit = 0,
  defaultExtras = [],
  foundingMember = false,
}: {
  categories: CategoryOption[];
  defaultCategory?: string | null;
  defaultSubcategory?: string | null;
  required?: boolean;
  label?: string;
  subLabel?: string;
  /** Lets the form show fields that only apply to one subcategory. */
  onSubcategoryChange?: (slug: string) => void;
  onCategoryChange?: (slug: string) => void;
  /** How many extra categories this member's plan allows; 0 shows the upsell. */
  extraLimit?: number;
  defaultExtras?: string[];
  foundingMember?: boolean;
}) {
  const [category, setCategory] = useState(defaultCategory ?? "");
  const [subcategory, setSubcategory] = useState(defaultSubcategory ?? "");
  const [trade, setTrade] = useState("");
  const [extras, setExtras] = useState<string[]>(defaultExtras);
  const children = categories.find((item) => item.slug === category)?.children ?? [];
  const suggestions = useMemo(
    () => suggestCategories(trade, categories),
    [trade, categories],
  );

  const selectSubcategory = (slug: string) => {
    setSubcategory(slug);
    onSubcategoryChange?.(slug);
  };

  const selectCategory = (slug: string) => {
    setCategory(slug);
    onCategoryChange?.(slug);
  };

  return (
    <>
      <Field
        label="Not sure which category? Describe what you do"
        hint="e.g. financial planning, mortgage loans, tiffin service, mehndi"
        className="sm:col-span-2"
      >
        <input
          value={trade}
          onChange={(event) => setTrade(event.target.value)}
          placeholder="Type what your business does"
          className={inputClass}
        />
        {suggestions.length ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.subcategorySlug}
                type="button"
                onClick={() => {
                  selectCategory(suggestion.categorySlug);
                  selectSubcategory(suggestion.subcategorySlug);
                  setTrade("");
                }}
                className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
              >
                {suggestion.categoryIcon} {suggestion.subcategoryName}
                <span className="ml-1 font-normal text-indigo-500">
                  in {suggestion.categoryName}
                </span>
              </button>
            ))}
          </div>
        ) : trade.trim().length > 2 ? (
          <p className="mt-2 text-xs text-slate-500">
            No match yet — try another word, or pick the category below.
          </p>
        ) : null}
      </Field>

      <Field label={label} required={required}>
        <select
          name="categorySlug"
          required={required}
          value={category}
          onChange={(event) => {
            selectCategory(event.target.value);
            selectSubcategory("");
          }}
          className={inputClass}
        >
          <option value="">Select a category</option>
          {categories.map((item) => (
            <option key={item.slug} value={item.slug}>
              {item.icon} {item.name}
            </option>
          ))}
        </select>
      </Field>

      <Field
        label={subLabel}
        required={required && children.length > 0}
        hint={category ? undefined : "Pick a category first"}
      >
        <select
          name="subcategorySlug"
          required={required && children.length > 0}
          value={subcategory}
          onChange={(event) => selectSubcategory(event.target.value)}
          disabled={!children.length}
          className={inputClass}
        >
          <option value="">
            {children.length ? "Select a subcategory" : "No subcategories"}
          </option>
          {children.map((child) => (
            <option key={child.slug} value={child.slug}>
              {child.name}
            </option>
          ))}
        </select>
      </Field>

      <Field
        label="Also list under (extra categories)"
        hint={
          extraLimit
            ? foundingMember
              ? `Founding member perk — included free. Up to ${extraLimit}.`
              : `Your plan includes up to ${extraLimit}.`
            : "Paid feature — upgrade to appear under more than one category. Free for founding members."
        }
        className="sm:col-span-2"
      >
        {extras.map((slug) => (
          <input key={slug} type="hidden" name="extraCategorySlugs" value={slug} />
        ))}
        {extras.length ? (
          <div className="mb-2 flex flex-wrap gap-2">
            {extras.map((slug) => (
              <button
                key={slug}
                type="button"
                onClick={() => setExtras(extras.filter((item) => item !== slug))}
                className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
              >
                {subcategoryName(categories, slug)} ×
              </button>
            ))}
          </div>
        ) : null}
        <select
          value=""
          disabled={!extraLimit || extras.length >= extraLimit}
          onChange={(event) => {
            const slug = event.target.value;
            if (slug && !extras.includes(slug)) setExtras([...extras, slug]);
          }}
          className={inputClass}
          aria-label="Add an extra category"
        >
          <option value="">
            {!extraLimit
              ? "Upgrade to add extra categories"
              : extras.length >= extraLimit
                ? `Limit reached (${extraLimit})`
                : "Add another category…"}
          </option>
          {categories.map((item) => (
            <optgroup key={item.slug} label={`${item.icon} ${item.name}`}>
              {item.children
                .filter(
                  (child) => child.slug !== subcategory && !extras.includes(child.slug),
                )
                .map((child) => (
                  <option key={child.slug} value={child.slug}>
                    {child.name}
                  </option>
                ))}
            </optgroup>
          ))}
        </select>
      </Field>
    </>
  );
}

function subcategoryName(categories: CategoryOption[], slug: string) {
  for (const item of categories) {
    const child = item.children.find((entry) => entry.slug === slug);
    if (child) return `${item.icon} ${child.name}`;
  }
  return slug;
}
