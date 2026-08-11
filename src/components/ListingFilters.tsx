import { inputClass } from "@/components/ui";
import { FURNISHING_LABELS, KIND_LABELS, type ListingSection, SECTION_KINDS } from "@/lib/listings";
import type { ListingFilters as Filters } from "@/lib/listings";

/** Server-rendered GET filter bar; every filter stays shareable in the URL. */
export function ListingFilters({
  section,
  filters,
  categories = [],
}: {
  section: ListingSection;
  filters: Filters;
  /** Buy & sell subcategories; empty for property and rooms. */
  categories?: { slug: string; name: string }[];
}) {
  const rooms = section === "rooms";
  const items = section === "marketplace";

  return (
    <form className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
      <input
        name="q"
        defaultValue={filters.q ?? ""}
        placeholder="Search"
        aria-label="Search listings"
        className={`${inputClass} lg:col-span-2`}
      />
      <input
        name="city"
        defaultValue={filters.city ?? ""}
        placeholder="City"
        aria-label="City"
        className={inputClass}
      />
      {items ? (
        <select
          name="category"
          defaultValue={filters.category ?? ""}
          aria-label="Category"
          className={inputClass}
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.slug} value={category.slug}>
              {category.name}
            </option>
          ))}
        </select>
      ) : (
        <select
          name="kind"
          defaultValue={filters.kind ?? ""}
          aria-label="Listing type"
          className={inputClass}
        >
          <option value="">All types</option>
          {SECTION_KINDS[section].map((kind) => (
            <option key={kind} value={kind}>
              {KIND_LABELS[kind]}
            </option>
          ))}
        </select>
      )}
      <input
        name="max"
        type="number"
        min={0}
        defaultValue={filters.max ?? ""}
        placeholder={rooms ? "Max rent ₹" : "Max price ₹"}
        aria-label="Maximum budget"
        className={inputClass}
      />
      {rooms ? (
        <select
          name="gender"
          defaultValue={filters.gender ?? ""}
          aria-label="Gender preference"
          className={inputClass}
        >
          <option value="">Any gender</option>
          <option value="MALE">Male only</option>
          <option value="FEMALE">Female only</option>
        </select>
      ) : items ? null : (
        <input
          name="bedrooms"
          type="number"
          min={0}
          max={20}
          defaultValue={filters.bedrooms ?? ""}
          placeholder="Min BHK"
          aria-label="Minimum bedrooms"
          className={inputClass}
        />
      )}
      {items ? null : (
      <select
        name="furnishing"
        defaultValue={filters.furnishing ?? ""}
        aria-label="Furnishing"
        className={inputClass}
      >
        <option value="">Any furnishing</option>
        {Object.entries(FURNISHING_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      )}
      <button
        type="submit"
        className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 lg:col-span-1"
      >
        Apply filters
      </button>
    </form>
  );
}
