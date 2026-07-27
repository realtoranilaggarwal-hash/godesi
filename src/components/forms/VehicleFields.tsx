"use client";

import { useState } from "react";
import { Field, inputClass } from "@/components/ui";
import {
  CONDITIONS,
  FUEL_TYPES,
  MILEAGE_UNITS,
  OWNERSHIPS,
  TRANSMISSIONS,
  VEHICLE_DOCUMENTS,
  VEHICLE_FEATURES,
  VEHICLE_MAKES,
  VEHICLE_MAKE_NAMES,
  VEHICLE_TYPES,
  isVehicleCard,
  vehicleYears,
} from "@/lib/vehicles";

export type VehicleDefaults = {
  vehicleType: string;
  make: string;
  model: string;
  year: string;
  mileage: string;
  mileageUnit: string;
  fuelType: string;
  transmission: string;
  ownership: string;
  condition: string;
  price: string;
  currency: string;
  negotiable: boolean;
  features: string[];
  documents: string[];
};

/** Vehicle details for Buy & Sell → Cars & Bikes; dropdowns everywhere so listings stay filterable. */
export function VehicleFields({
  subcategorySlug,
  defaults,
}: {
  subcategorySlug: string;
  defaults: VehicleDefaults;
}) {
  const [make, setMake] = useState(defaults.make);
  const models = VEHICLE_MAKES[make] ?? [];

  if (!isVehicleCard(subcategorySlug)) return null;

  return (
    <details
      open
      className="rounded-2xl border border-lime-300 bg-lime-50/60 p-4 [&_summary::-webkit-details-marker]:hidden"
    >
      <summary className="cursor-pointer list-none text-sm font-bold text-lime-900">
        🚗 Vehicle details{" "}
        <span className="font-normal text-lime-900/70">(tap to expand)</span>
      </summary>
      <p className="mt-1 text-xs text-lime-900/80">
        Buyers filter on these — the more you fill in, the higher you show in results.
      </p>

      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Vehicle type">
          <select
            name="vehicleType"
            required
            defaultValue={defaults.vehicleType}
            className={inputClass}
          >
            <option value="">Select</option>
            {VEHICLE_TYPES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Make">
          <select
            name="make"
            required
            value={make}
            onChange={(event) => setMake(event.target.value)}
            className={inputClass}
          >
            <option value="">Select</option>
            {VEHICLE_MAKE_NAMES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Model" hint={make ? undefined : "Pick a make first"}>
          <select
            name="model"
            required
            defaultValue={defaults.model}
            disabled={!models.length}
            className={inputClass}
          >
            <option value="">{models.length ? "Select" : "Pick a make first"}</option>
            {models.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Year">
          <select name="year" required defaultValue={defaults.year} className={inputClass}>
            <option value="">Select</option>
            {vehicleYears().map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Mileage">
          <div className="flex gap-2">
            <input
              name="mileage"
              type="number"
              min={0}
              max={2_000_000}
              defaultValue={defaults.mileage}
              className={inputClass}
            />
            <select
              name="mileageUnit"
              defaultValue={defaults.mileageUnit}
              className="rounded-xl border border-slate-300 px-2 text-sm"
            >
              {MILEAGE_UNITS.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </div>
        </Field>

        <Field label="Fuel type">
          <select name="fuelType" defaultValue={defaults.fuelType} className={inputClass}>
            <option value="">Select</option>
            {FUEL_TYPES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Transmission">
          <select
            name="transmission"
            defaultValue={defaults.transmission}
            className={inputClass}
          >
            <option value="">Select</option>
            {TRANSMISSIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Ownership">
          <select name="ownership" defaultValue={defaults.ownership} className={inputClass}>
            <option value="">Select</option>
            {OWNERSHIPS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Condition">
          <select name="condition" defaultValue={defaults.condition} className={inputClass}>
            <option value="">Select</option>
            {CONDITIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Asking price">
          <div className="flex gap-2">
            <input
              name="vehiclePrice"
              type="number"
              min={0}
              defaultValue={defaults.price}
              className={inputClass}
            />
            <select
              name="vehicleCurrency"
              defaultValue={defaults.currency}
              className="rounded-xl border border-slate-300 px-2 text-sm"
            >
              <option value="USD">USD</option>
              <option value="INR">INR</option>
            </select>
          </div>
        </Field>

        <label className="flex items-center gap-2 self-end pb-2 text-sm font-semibold text-slate-700">
          <input
            type="checkbox"
            name="negotiable"
            defaultChecked={defaults.negotiable}
            className="h-4 w-4"
          />
          Price negotiable
        </label>
      </div>

      <div className="mt-4">
        <p className="text-sm font-bold text-lime-900">Features</p>
        <div className="mt-2 grid gap-x-4 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
          {VEHICLE_FEATURES.map((option) => (
            <label key={option} className="flex items-start gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                name="vehicleFeatures"
                value={option}
                defaultChecked={defaults.features.includes(option)}
                className="mt-0.5 h-4 w-4"
              />
              {option}
            </label>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <p className="text-sm font-bold text-lime-900">Documents &amp; history</p>
        <div className="mt-2 grid gap-x-4 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
          {VEHICLE_DOCUMENTS.map((option) => (
            <label key={option} className="flex items-start gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                name="vehicleDocuments"
                value={option}
                defaultChecked={defaults.documents.includes(option)}
                className="mt-0.5 h-4 w-4"
              />
              {option}
            </label>
          ))}
        </div>
      </div>

      <p className="mt-3 rounded-xl bg-white/70 px-3 py-2 text-xs text-slate-600">
        Add at least 3 photos (front, interior, odometer) and a walk-around video in the
        gallery below — vehicle listings with 3+ photos get far more enquiries.
      </p>
    </details>
  );
}
