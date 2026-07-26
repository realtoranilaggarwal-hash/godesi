"use client";

import { useState } from "react";
import { Field, inputClass } from "@/components/ui";

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
}: {
  categories: CategoryOption[];
  defaultCategory?: string | null;
  defaultSubcategory?: string | null;
  required?: boolean;
  label?: string;
  subLabel?: string;
}) {
  const [category, setCategory] = useState(defaultCategory ?? "");
  const children = categories.find((item) => item.slug === category)?.children ?? [];

  return (
    <>
      <Field label={label}>
        <select
          name="categorySlug"
          required={required}
          value={category}
          onChange={(event) => setCategory(event.target.value)}
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

      <Field label={subLabel} hint={category ? undefined : "Pick a category first"}>
        <select
          name="subcategorySlug"
          required={required && children.length > 0}
          defaultValue={defaultSubcategory ?? ""}
          key={category}
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
    </>
  );
}
