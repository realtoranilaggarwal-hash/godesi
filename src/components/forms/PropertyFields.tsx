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
import type { PostedByRole, PropertyGroup } from "@prisma/client";

function CheckGrid({
  name,
  options,
}: {
  name: string;
  options: { slug: string; label: string }[];
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {options.map((option) => (
        <label
          key={option.slug}
          className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm"
        >
          <input type="checkbox" name={name} value={option.slug} />
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
  defaultCountry,
}: {
  forRent: boolean;
  defaultGroup?: PropertyGroup;
  defaultRole?: PostedByRole;
  defaultCountry?: string;
}) {
  const [group, setGroup] = useState<PropertyGroup>(defaultGroup);
  const [type, setType] = useState(PROPERTY_TYPES[defaultGroup][0].slug);
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
              type="number"
              min={0}
              className={inputClass}
            />
            <select name="areaUnit" defaultValue="sqft" className={inputClass}>
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
            <input name="lotSize" type="number" min={0} className={inputClass} />
            <select name="lotUnit" defaultValue="sqft" className={inputClass}>
              {LOT_UNITS.map((option) => (
                <option key={option.slug} value={option.slug}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </Field>
        <Field label="You are the">
          <select name="postedByRole" defaultValue={defaultRole} className={inputClass}>
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
              <input name="bathrooms" type="number" min={0} max={20} className={inputClass} />
            </Field>
            <Field label="Half baths" hint="Toilet and basin only.">
              <input name="halfBaths" type="number" min={0} max={20} className={inputClass} />
            </Field>
            <Field label="Three-quarter baths" hint="Shower, no tub.">
              <input
                name="threeQuarterBaths"
                type="number"
                min={0}
                max={20}
                className={inputClass}
              />
            </Field>
            <Field label="Year built">
              <input
                name="yearBuilt"
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
            <select name="saleType" defaultValue="" className={inputClass}>
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
        <CheckGrid name="highlights" options={PROPERTY_HIGHLIGHTS} />
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
            <input name="carpetArea" type="number" min={0} className={inputClass} />
          </Field>
          {forRent ? null : (
            <>
              <Field label="HOA or condo fee per month">
                <input name="hoaFee" type="number" min={0} className={inputClass} />
              </Field>
              <Field label="Property tax per year">
                <input name="propertyTax" type="number" min={0} className={inputClass} />
              </Field>
            </>
          )}
          <Field label="School district" hint="Buyers with children search on this.">
            <input name="schoolDistrict" maxLength={120} className={inputClass} />
          </Field>
          <Field label="MLS number" hint="Optional — lets buyers match the public record.">
            <input name="mlsNumber" maxLength={40} className={inputClass} />
          </Field>
          <Field label="Parking spaces">
            <input name="parkingCar" type="number" min={0} max={20} className={inputClass} />
          </Field>
          {rooms ? (
            <>
              <Field label="Balconies">
                <input name="balconies" type="number" min={0} max={20} className={inputClass} />
              </Field>
              <Field label="Floor">
                <input name="floor" type="number" className={inputClass} />
              </Field>
              <Field label="Total floors">
                <input name="totalFloors" type="number" min={0} className={inputClass} />
              </Field>
              <Field label="Bike parking">
                <input name="parkingBike" type="number" min={0} max={20} className={inputClass} />
              </Field>
            </>
          ) : null}
          <Field label="Property age">
            <select name="propertyAge" defaultValue="" className={inputClass}>
              <option value="">Not specified</option>
              {PROPERTY_AGES.map((option) => (
                <option key={option.slug} value={option.slug}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Facing">
            <select name="facing" defaultValue="" className={inputClass}>
              <option value="">Not specified</option>
              {FACINGS.map((option) => (
                <option key={option.slug} value={option.slug}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Ownership">
            <select name="ownership" defaultValue="" className={inputClass}>
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
                <input name="deposit" type="number" min={0} className={inputClass} />
              </Field>
              <Field label="Preferred tenant">
                <select name="tenantPref" defaultValue="" className={inputClass}>
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
            <input name="maintenance" type="number" min={0} className={inputClass} />
          </Field>
          <Field label="Available from">
            <input name="availableFrom" type="date" className={inputClass} />
          </Field>
          <Field label="State / province">
            <input name="state" className={inputClass} />
          </Field>
          <Field label="Country">
            <input name="country" defaultValue={defaultCountry} className={inputClass} />
          </Field>
          <Field label="Google Maps pin" hint="Maps → drop a pin → Share → copy link.">
            <input
              name="mapUrl"
              type="url"
              placeholder="https://maps.google.com/..."
              className={inputClass}
            />
          </Field>
          <Field label="Virtual tour link">
            <input name="tourUrl" type="url" className={inputClass} />
          </Field>
          <Field label="Contact name">
            <input name="contactName" className={inputClass} />
          </Field>
          <Field label="Phone" hint="Shown to signed-in Godesi members only.">
            <input name="contactPhone" className={inputClass} />
          </Field>
          <Field label="Email" hint="Shown to signed-in members only.">
            <input name="contactEmail" type="email" className={inputClass} />
          </Field>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Field label="Open house date">
            <input name="openHouseDate" type="date" className={inputClass} />
          </Field>
          <Field label="From">
            <input name="openHouseStart" type="time" className={inputClass} />
          </Field>
          <Field label="Until">
            <input name="openHouseEnd" type="time" className={inputClass} />
          </Field>
        </div>

        <div className="mt-4 space-y-3">
          <div>
            <p className="mb-2 text-sm font-bold text-slate-700">Parking</p>
            <CheckGrid name="parkingTypes" options={PARKING_TYPES} />
          </div>
          <div>
            <p className="mb-2 text-sm font-bold text-slate-700">Flooring</p>
            <CheckGrid name="flooring" options={FLOORING_TYPES} />
          </div>
          <div>
            <p className="mb-2 text-sm font-bold text-slate-700">Built of</p>
            <CheckGrid name="construction" options={CONSTRUCTION_TYPES} />
          </div>
          <div>
            <p className="mb-2 text-sm font-bold text-slate-700">Utilities</p>
            <CheckGrid name="utilities" options={UTILITIES} />
          </div>
          <div>
            <p className="mb-2 text-sm font-bold text-slate-700">Amenities</p>
            <CheckGrid name="amenities" options={AMENITIES} />
          </div>
          <label className="flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" name="negotiable" value="1" />
            Price is negotiable
          </label>
          {forRent ? null : (
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" name="underLoan" value="1" />
              Currently under loan
            </label>
          )}
          <label className="flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" name="nriFriendly" value="1" />
            🌏 Welcome NRI buyers (shows in NRI listings)
          </label>
          <label className="flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" name="investmentDeal" value="1" />
            📈 This is an investment deal
          </label>
        </div>
      </details>
    </div>
  );
}
