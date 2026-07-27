"use client";

import { useState } from "react";
import { inputClass } from "@/components/ui";
import {
  CONDITIONS,
  FUEL_TYPES,
  OWNERSHIPS,
  TRANSMISSIONS,
  VEHICLE_FEATURES,
  VEHICLE_MAKES,
  VEHICLE_MAKE_NAMES,
  VEHICLE_TYPES,
  vehicleYears,
} from "@/lib/vehicles";

export type VehicleFilterValues = {
  vtype: string;
  vmake: string;
  vmodel: string;
  vfuel: string;
  vtrans: string;
  vowner: string;
  vcond: string;
  vminyear: string;
  vmaxmiles: string;
  vminprice: string;
  vmaxprice: string;
  vfeature: string[];
};

/** Same dropdowns as the posting form, so every value listed can be filtered. */
export function VehicleFilters({ values }: { values: VehicleFilterValues }) {
  const [make, setMake] = useState(values.vmake);
  const models = VEHICLE_MAKES[make] ?? [];

  return (
    <fieldset className="sm:col-span-3">
      <legend className="text-sm font-bold text-slate-900">Vehicle filters</legend>
      <div className="mt-2 grid gap-2 sm:grid-cols-3 lg:grid-cols-4">
        <select name="vtype" defaultValue={values.vtype} className={inputClass}>
          <option value="">Any type</option>
          {VEHICLE_TYPES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <select
          name="vmake"
          value={make}
          onChange={(event) => setMake(event.target.value)}
          className={inputClass}
        >
          <option value="">Any make</option>
          {VEHICLE_MAKE_NAMES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <select
          name="vmodel"
          defaultValue={values.vmodel}
          disabled={!models.length}
          className={inputClass}
        >
          <option value="">{models.length ? "Any model" : "Pick a make"}</option>
          {models.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <select name="vminyear" defaultValue={values.vminyear} className={inputClass}>
          <option value="">Year from</option>
          {vehicleYears().map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>

        <select name="vfuel" defaultValue={values.vfuel} className={inputClass}>
          <option value="">Any fuel</option>
          {FUEL_TYPES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <select name="vtrans" defaultValue={values.vtrans} className={inputClass}>
          <option value="">Any transmission</option>
          {TRANSMISSIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <select name="vowner" defaultValue={values.vowner} className={inputClass}>
          <option value="">Any ownership</option>
          {OWNERSHIPS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <select name="vcond" defaultValue={values.vcond} className={inputClass}>
          <option value="">Any condition</option>
          {CONDITIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <input
          name="vmaxmiles"
          type="number"
          min={0}
          defaultValue={values.vmaxmiles}
          placeholder="Max mileage"
          className={inputClass}
          aria-label="Max mileage"
        />
        <input
          name="vminprice"
          type="number"
          min={0}
          defaultValue={values.vminprice}
          placeholder="Min price"
          className={inputClass}
          aria-label="Min price"
        />
        <input
          name="vmaxprice"
          type="number"
          min={0}
          defaultValue={values.vmaxprice}
          placeholder="Max price"
          className={inputClass}
          aria-label="Max price"
        />
      </div>

      <details className="mt-2">
        <summary className="cursor-pointer text-sm font-semibold text-slate-700">
          Must-have features
        </summary>
        <div className="mt-2 grid gap-x-4 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
          {VEHICLE_FEATURES.map((option) => (
            <label key={option} className="flex items-start gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                name="vfeature"
                value={option}
                defaultChecked={values.vfeature.includes(option)}
                className="mt-0.5 h-4 w-4"
              />
              {option}
            </label>
          ))}
        </div>
      </details>
    </fieldset>
  );
}
