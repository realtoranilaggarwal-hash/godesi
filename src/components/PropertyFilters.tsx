import Link from "next/link";
import { inputClass } from "@/components/ui";
import { FURNISHING_LABELS } from "@/lib/listings";
import {
  AMENITIES,
  POSTED_BY_LABELS,
  PROPERTY_GROUPS,
  PROPERTY_GROUP_EMOJI,
  PROPERTY_GROUP_LABELS,
  PROPERTY_HIGHLIGHTS,
  PROPERTY_TYPES,
  SALE_TYPES,
  TENANT_PREFS,
  type PropertyFilterParams,
} from "@/lib/property";

export type PropertySearch = PropertyFilterParams & {
  kind?: string;
  city?: string;
  bedrooms?: string;
  q?: string;
};

function selected(value: string | string[] | undefined, option: string) {
  return Array.isArray(value) ? value.includes(option) : value === option;
}

/**
 * The /real-estate filter bar. Everything is a GET form so a search stays
 * shareable, bookmarkable and crawlable — no client state at all.
 */
export function PropertyFilters({ filters }: { filters: PropertySearch }) {
  const group = filters.group && filters.group in PROPERTY_GROUP_LABELS ? filters.group : null;
  const types = group
    ? PROPERTY_TYPES[group as keyof typeof PROPERTY_TYPES]
    : PROPERTY_GROUPS.flatMap((key) => PROPERTY_TYPES[key]);
  const forRent = filters.kind === "PROPERTY_RENT";

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Link
          href="/real-estate"
          className={`rounded-full border px-3 py-1.5 text-sm font-semibold ${
            group ? "border-slate-200 bg-white text-slate-700" : "border-orange-500 bg-orange-500 text-white"
          }`}
        >
          All property
        </Link>
        {PROPERTY_GROUPS.map((option) => (
          <Link
            key={option}
            href={`/real-estate?group=${option}${forRent ? "&kind=PROPERTY_RENT" : ""}`}
            className={`rounded-full border px-3 py-1.5 text-sm font-semibold ${
              group === option
                ? "border-orange-500 bg-orange-500 text-white"
                : "border-slate-200 bg-white text-slate-700 hover:border-orange-300"
            }`}
          >
            {PROPERTY_GROUP_EMOJI[option]} {PROPERTY_GROUP_LABELS[option]}
          </Link>
        ))}
      </div>

      <form className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {group ? <input type="hidden" name="group" value={group} /> : null}
        <input
          name="q"
          defaultValue={filters.q ?? ""}
          placeholder="Search locality, landmark, project"
          aria-label="Search property"
          className={`${inputClass} lg:col-span-2`}
        />
        <input
          name="city"
          defaultValue={filters.city ?? ""}
          placeholder="City"
          aria-label="City"
          className={inputClass}
        />
        <select
          name="kind"
          defaultValue={filters.kind ?? ""}
          aria-label="Buy or rent"
          className={inputClass}
        >
          <option value="">Buy or rent</option>
          <option value="PROPERTY_SALE">For sale</option>
          <option value="PROPERTY_RENT">For rent</option>
        </select>
        <select
          name="ptype"
          defaultValue={filters.ptype ?? ""}
          aria-label="Property type"
          className={inputClass}
        >
          <option value="">Any type</option>
          {types.map((type) => (
            <option key={type.slug} value={type.slug}>
              {type.label}
            </option>
          ))}
        </select>
        <input
          name="min"
          type="number"
          min={0}
          max={2147483647}
          defaultValue={filters.min ?? ""}
          placeholder="Min price"
          aria-label="Minimum price"
          className={inputClass}
        />
        <input
          name="max"
          type="number"
          min={0}
          max={2147483647}
          defaultValue={filters.max ?? ""}
          placeholder="Max price"
          aria-label="Maximum price"
          className={inputClass}
        />
        <input
          name="bedrooms"
          type="number"
          min={0}
          max={20}
          defaultValue={filters.bedrooms ?? ""}
          placeholder="Min bedrooms"
          aria-label="Minimum bedrooms"
          className={inputClass}
        />
        <input
          name="baths"
          type="number"
          min={0}
          max={20}
          defaultValue={filters.baths ?? ""}
          placeholder="Min bathrooms"
          aria-label="Minimum bathrooms"
          className={inputClass}
        />
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
        <select
          name="by"
          defaultValue={filters.by ?? ""}
          aria-label="Posted by"
          className={inputClass}
        >
          <option value="">Anyone</option>
          {Object.entries(POSTED_BY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              Posted by {label.toLowerCase()}
            </option>
          ))}
        </select>
        {forRent ? null : (
          <select
            name="sale"
            defaultValue={filters.sale ?? ""}
            aria-label="Sale type"
            className={inputClass}
          >
            <option value="">Any sale type</option>
            {SALE_TYPES.map((option) => (
              <option key={option.slug} value={option.slug}>
                {option.label}
              </option>
            ))}
          </select>
        )}
        <input
          name="minSqft"
          type="number"
          min={0}
          defaultValue={filters.minSqft ?? ""}
          placeholder="Min sq ft"
          aria-label="Minimum finished square feet"
          className={inputClass}
        />
        <input
          name="builtAfter"
          type="number"
          min={1600}
          max={new Date().getFullYear() + 5}
          defaultValue={filters.builtAfter ?? ""}
          placeholder="Built after"
          aria-label="Built no earlier than"
          className={inputClass}
        />
        {forRent ? (
          <select
            name="tenant"
            defaultValue={filters.tenant ?? ""}
            aria-label="Tenant type"
            className={inputClass}
          >
            <option value="">Any tenant</option>
            {TENANT_PREFS.map((option) => (
              <option key={option.slug} value={option.slug}>
                {option.label}
              </option>
            ))}
          </select>
        ) : null}

        <details className="sm:col-span-2 lg:col-span-4">
          <summary className="cursor-pointer text-sm font-semibold text-indigo-600">
            More filters — open house, highlights, amenities
          </summary>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm">
              <input
                type="checkbox"
                name="parking"
                value="1"
                defaultChecked={Boolean(filters.parking)}
              />
              Car parking
            </label>
            <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm">
              <input
                type="checkbox"
                name="openHouse"
                value="1"
                defaultChecked={Boolean(filters.openHouse)}
              />
              Open house coming up
            </label>
            {PROPERTY_HIGHLIGHTS.map((highlight) => (
              <label
                key={highlight.slug}
                className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm"
              >
                <input
                  type="checkbox"
                  name="highlight"
                  value={highlight.slug}
                  defaultChecked={selected(filters.highlight, highlight.slug)}
                />
                {highlight.label}
              </label>
            ))}
            {AMENITIES.map((amenity) => (
              <label
                key={amenity.slug}
                className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm"
              >
                <input
                  type="checkbox"
                  name="amenity"
                  value={amenity.slug}
                  defaultChecked={selected(filters.amenity, amenity.slug)}
                />
                {amenity.label}
              </label>
            ))}
          </div>
        </details>

        <div className="flex flex-wrap gap-2 sm:col-span-2 lg:col-span-4">
          <button
            type="submit"
            className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Search property
          </button>
          <Link
            href="/real-estate"
            className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50"
          >
            Clear
          </Link>
        </div>
      </form>
    </div>
  );
}
