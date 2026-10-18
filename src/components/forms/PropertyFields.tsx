"use client";

import { useState } from "react";
import { Field, inputClass } from "@/components/ui";
import {
  AMENITIES,
  AREA_UNITS,
  CONSTRUCTION_TYPES,
  FACINGS,
  FLOORING_TYPES,
  LOT_UNITS,
  OWNERSHIPS,
  PARKING_TYPES,
  POSTED_BY_LABELS,
  PROPERTY_AGES,
  PROPERTY_GROUPS,
  PROPERTY_GROUP_EMOJI,
  PROPERTY_GROUP_LABELS,
  PROPERTY_HIGHLIGHTS,
  PROPERTY_TYPES,
  SALE_TYPES,
  TENANT_PREFS,
  UTILITIES,
  wantsRooms,
} from "@/lib/property";
import type { Listing, PostedByRole, PropertyGroup } from "@prisma/client";

/**
 * Date and clock time as the server stored them: the save action reads the
 * form's date and times on a UTC clock, so they are read back in UTC.
 */
function isoParts(value: Date) {
  const iso = new Date(value).toISOString();
  return { date: iso.slice(0, 10), time: iso.slice(11, 16) };
}

function CheckGrid({
  name,
  options,
  selected = [],
}: {
  name: string;
  options: { slug: string; label: string }[];
  selected?: string[];
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {options.map((option) => (
        <label
          key={option.slug}
          className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm"
        >
          <input
            type="checkbox"
            name={name}
            value={option.slug}
            defaultChecked={selected.includes(option.slug)}
          />
          {option.label}
        </label>
      ))}
    </div>
  );
}

/**
 * Property questions, shown when someone lists a home, shop or plot. Only the
 * five fields buyers filter on are asked up front; the long spec sheet sits in
 * one optional drawer so a seller can post in a minute and fill it in later.
 */
export function PropertyFields({
  forRent,
  defaultGroup = "RESIDENTIAL",
  defaultRole = "OWNER",
  values,
}: {
  forRent: boolean;
  defaultGroup?: PropertyGroup;
  defaultRole?: PostedByRole;
  /** The saved listing, when the poster is editing it. */
  values?: Listing;
}) {
  const startGroup = values?.propertyGroup ?? defaultGroup;
  const [group, setGroup] = useState<PropertyGroup>(startGroup);
  const [type, setType] = useState(
    PROPERTY_TYPES[startGroup].some((option) => option.slug === values?.propertyType)
      ? values!.propertyType!
      : PROPERTY_TYPES[startGroup][0].slug,
  );
  const openHouse = values?.openHouseAt ? isoParts(values.openHouseAt) : null;
  const openHouseEnd = values?.openHouseEndsAt
    ? isoParts(values.openHouseEndsAt)
    : null;
  const rooms = wantsRooms(type);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Property category" required>
          <select
            value={group}
            onChange={(event) => {
              const next = event.target.value as PropertyGroup;
              setGroup(next);
              setType(PROPERTY_TYPES[next][0].slug);
            }}
            className={inputClass}
          >
            {PROPERTY_GROUPS.map((option) => (
              <option key={option} value={option}>
                {PROPERTY_GROUP_EMOJI[option]} {PROPERTY_GROUP_LABELS[option]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Property type" required>
          <select
            name="propertyType"
            value={type}
            onChange={(event) => setType(event.target.value)}
            className={inputClass}
          >
            {PROPERTY_TYPES[group].map((option) => (
              <option key={option.slug} value={option.slug}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
        <Field
          label="Finished area"
          hint="The heated, finished space buyers are paying for."
        >
          <div className="flex gap-2">
            <input
              name="builtUpArea"
              defaultValue={values?.builtUpArea ?? undefined}
              type="number"
              min={0}
              className={inputClass}
            />
            <select name="areaUnit" defaultValue={values?.areaUnit ?? "sqft"} className={inputClass}>
              {AREA_UNITS.map((option) => (
                <option key={option.slug} value={option.slug}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </Field>
        <Field label="Lot size" hint="The land itself — sq ft or acres.">
          <div className="flex gap-2">
            <input name="lotSize" defaultValue={values?.lotSize ?? undefined} type="number" min={0} className={inputClass} />
            <select name="lotUnit" defaultValue={values?.lotUnit ?? "sqft"} className={inputClass}>
              {LOT_UNITS.map((option) => (
                <option key={option.slug} value={option.slug}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </Field>
        <Field label="You are the">
          <select name="postedByRole" defaultValue={values?.postedByRole ?? defaultRole} className={inputClass}>
            {Object.entries(POSTED_BY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>
        {rooms ? (
          <>
            <Field label="Full baths" hint="Tub and shower.">
              <input name="bathrooms" defaultValue={values?.bathrooms ?? undefined} type="number" min={0} max={20} className={inputClass} />
            </Field>
            <Field label="Half baths" hint="Toilet and basin only.">
              <input name="halfBaths" defaultValue={values?.halfBaths ?? undefined} type="number" min={0} max={20} className={inputClass} />
            </Field>
            <Field label="Three-quarter baths" hint="Shower, no tub.">
              <input
                name="threeQuarterBaths"
                defaultValue={values?.threeQuarterBaths ?? undefined}
                type="number"
                min={0}
                max={20}
                className={inputClass}
              />
            </Field>
            <Field label="Year built">
              <input
                name="yearBuilt"
                defaultValue={values?.yearBuilt ?? undefined}
                type="number"
                min={1600}
                max={new Date().getFullYear() + 5}
                placeholder="1998"
                className={inputClass}
              />
            </Field>
          </>
        ) : null}
        {forRent ? null : (
          <Field label="Sale type">
            <select name="saleType" defaultValue={values?.saleType ?? ""} className={inputClass}>
              <option value="">Not specified</option>
              {SALE_TYPES.map((option) => (
                <option key={option.slug} value={option.slug}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
        )}
      </div>

      <div>
        <p className="mb-2 text-sm font-bold text-slate-700">
          What makes it worth seeing?
        </p>
        <CheckGrid name="highlights" selected={values?.highlights} options={PROPERTY_HIGHLIGHTS} />
      </div>

      <details className="rounded-2xl border border-slate-200 p-4">
        <summary className="cursor-pointer text-sm font-bold text-indigo-700">
          Add more details — optional
        </summary>
        <p className="mt-1 text-xs text-slate-500">
          Every extra answer moves you up the filters, but nothing here is
          required — you can add it any time.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Carpet area">
            <input name="carpetArea" defaultValue={values?.carpetArea ?? undefined} type="number" min={0} className={inputClass} />
          </Field>
          {forRent ? null : (
            <>
              <Field label="HOA or condo fee per month">
                <input name="hoaFee" defaultValue={values?.hoaFee ?? undefined} type="number" min={0} className={inputClass} />
              </Field>
              <Field label="Property tax per year">
                <input name="propertyTax" defaultValue={values?.propertyTax ?? undefined} type="number" min={0} className={inputClass} />
              </Field>
            </>
          )}
          <Field label="School district" hint="Buyers with children search on this.">
            <input name="schoolDistrict" defaultValue={values?.schoolDistrict ?? undefined} maxLength={120} className={inputClass} />
          </Field>
          <Field label="MLS number" hint="Optional — lets buyers match the public record.">
            <input name="mlsNumber" defaultValue={values?.mlsNumber ?? undefined} maxLength={40} className={inputClass} />
          </Field>
          <Field label="Parking spaces">
            <input name="parkingCar" defaultValue={values?.parkingCar ?? undefined} type="number" min={0} max={20} className={inputClass} />
          </Field>
          {rooms ? (
            <>
              <Field label="Balconies">
                <input name="balconies" defaultValue={values?.balconies ?? undefined} type="number" min={0} max={20} className={inputClass} />
              </Field>
              <Field label="Floor">
                <input name="floor" defaultValue={values?.floor ?? undefined} type="number" className={inputClass} />
              </Field>
              <Field label="Total floors">
                <input name="totalFloors" defaultValue={values?.totalFloors ?? undefined} type="number" min={0} className={inputClass} />
              </Field>
              <Field label="Bike parking">
                <input name="parkingBike" defaultValue={values?.parkingBike ?? undefined} type="number" min={0} max={20} className={inputClass} />
              </Field>
            </>
          ) : null}
          <Field label="Property age">
            <select name="propertyAge" defaultValue={values?.propertyAge ?? ""} className={inputClass}>
              <option value="">Not specified</option>
              {PROPERTY_AGES.map((option) => (
                <option key={option.slug} value={option.slug}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Facing">
            <select name="facing" defaultValue={values?.facing ?? ""} className={inputClass}>
              <option value="">Not specified</option>
              {FACINGS.map((option) => (
                <option key={option.slug} value={option.slug}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Ownership">
            <select name="ownership" defaultValue={values?.ownership ?? ""} className={inputClass}>
              <option value="">Not specified</option>
              {OWNERSHIPS.map((option) => (
                <option key={option.slug} value={option.slug}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
          {forRent ? (
            <>
              <Field label="Security deposit">
                <input name="deposit" defaultValue={values?.deposit ?? undefined} type="number" min={0} className={inputClass} />
              </Field>
              <Field label="Preferred tenant">
                <select name="tenantPref" defaultValue={values?.tenantPref ?? ""} className={inputClass}>
                  <option value="">No preference</option>
                  {TENANT_PREFS.map((option) => (
                    <option key={option.slug} value={option.slug}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </Field>
            </>
          ) : null}
          <Field label="Maintenance per month">
            <input name="maintenance" defaultValue={values?.maintenance ?? undefined} type="number" min={0} className={inputClass} />
          </Field>
          <Field label="Available from">
            <input
              name="availableFrom"
              type="date"
              defaultValue={values?.availableFrom ? isoParts(values.availableFrom).date : undefined}
              className={inputClass}
            />
          </Field>
          <Field label="Google Maps pin" hint="Maps → drop a pin → Share → copy link.">
            <input
              name="mapUrl"
              defaultValue={values?.mapUrl ?? undefined}
              type="url"
              placeholder="https://maps.google.com/..."
              className={inputClass}
            />
          </Field>
          <Field label="Virtual tour link">
            <input name="tourUrl" defaultValue={values?.tourUrl ?? undefined} type="url" className={inputClass} />
          </Field>
        </div>

        <details className="mt-4 rounded-xl bg-slate-50 p-3">
          <summary className="cursor-pointer text-xs font-bold text-slate-700">
            Someone else handles enquiries? — optional
          </summary>
          <p className="mt-1 text-xs text-slate-500">
            Buyers already reach you on your name and the WhatsApp number above.
            Fill this in only if an agent or a relative should be contacted
            instead.
          </p>
          <div className="mt-3 grid gap-4 sm:grid-cols-3">
            <Field label="Their name">
              <input name="contactName" defaultValue={values?.contactName ?? undefined} maxLength={80} className={inputClass} />
            </Field>
            <Field label="Their phone" hint="Shown to signed-in members only.">
              <input name="contactPhone" defaultValue={values?.contactPhone ?? undefined} maxLength={30} className={inputClass} />
            </Field>
            <Field label="Their email" hint="Shown to signed-in members only.">
              <input name="contactEmail" defaultValue={values?.contactEmail ?? undefined} type="email" className={inputClass} />
            </Field>
          </div>
        </details>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Field label="Open house date">
            <input name="openHouseDate" defaultValue={openHouse?.date} type="date" className={inputClass} />
          </Field>
          <Field label="From">
            <input name="openHouseStart" defaultValue={openHouse?.time} type="time" className={inputClass} />
          </Field>
          <Field label="Until">
            <input name="openHouseEnd" defaultValue={openHouseEnd?.time} type="time" className={inputClass} />
          </Field>
        </div>

        <div className="mt-4 space-y-3">
          <div>
            <p className="mb-2 text-sm font-bold text-slate-700">Parking</p>
            <CheckGrid name="parkingTypes" selected={values?.parkingTypes} options={PARKING_TYPES} />
          </div>
          <div>
            <p className="mb-2 text-sm font-bold text-slate-700">Flooring</p>
            <CheckGrid name="flooring" selected={values?.flooring} options={FLOORING_TYPES} />
          </div>
          <div>
            <p className="mb-2 text-sm font-bold text-slate-700">Built of</p>
            <CheckGrid name="construction" selected={values?.construction} options={CONSTRUCTION_TYPES} />
          </div>
          <div>
            <p className="mb-2 text-sm font-bold text-slate-700">Utilities</p>
            <CheckGrid name="utilities" selected={values?.utilities} options={UTILITIES} />
          </div>
          <div>
            <p className="mb-2 text-sm font-bold text-slate-700">Amenities</p>
            <CheckGrid name="amenities" selected={values?.amenities} options={AMENITIES} />
          </div>
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              name="negotiable"
              value="1"
              defaultChecked={values?.negotiable}
            />
            Price is negotiable
          </label>
          {forRent ? null : (
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                name="underLoan"
                value="1"
                defaultChecked={values?.underLoan}
              />
              Currently under loan
            </label>
          )}
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              name="nriFriendly"
              value="1"
              defaultChecked={values?.nriFriendly}
            />
            🌏 Welcome NRI buyers (shows in NRI listings)
          </label>
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              name="investmentDeal"
              value="1"
              defaultChecked={values?.investmentDeal}
            />
            📈 This is an investment deal
          </label>
        </div>
      </details>
    </div>
  );
}
