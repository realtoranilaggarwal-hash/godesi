"use client";

import { useFormState } from "react-dom";
import { saveAgentProfileAction } from "@/app/actions/agents";
import { emptyState } from "@/lib/actions";
import { AGENT_SPECIALTIES } from "@/lib/agents";
import { SubmitButton } from "@/components/SubmitButton";
import { Alert, Field, inputClass } from "@/components/ui";

export type AgentProfileDefaults = {
  brokerage: string;
  serviceAreas: string;
  licenseNumber: string;
  licenseState: string;
  designations: string;
  awards: string;
  specialties: string[];
  yearsExperience: string;
  transactions: string;
  totalSales: string;
  avgPrice: string;
  currency: string;
};

export function AgentProfileForm({ defaults }: { defaults: AgentProfileDefaults }) {
  const [state, formAction] = useFormState(saveAgentProfileAction, emptyState);

  return (
    <form action={formAction} className="space-y-4">
      {state.error ? <Alert>{state.error}</Alert> : null}
      {state.success ? <Alert tone="success">{state.success}</Alert> : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Brokerage" hint="Company you hang your licence with">
          <input name="brokerage" defaultValue={defaults.brokerage} className={inputClass} />
        </Field>
        <Field label="Currency">
          <select name="currency" defaultValue={defaults.currency} className={inputClass}>
            <option value="USD">US$</option>
            <option value="INR">₹</option>
          </select>
        </Field>
        <Field label="Licence number">
          <input
            name="licenseNumber"
            defaultValue={defaults.licenseNumber}
            className={inputClass}
          />
        </Field>
        <Field label="Licensed in" hint="State or region">
          <input
            name="licenseState"
            defaultValue={defaults.licenseState}
            className={inputClass}
          />
        </Field>
        <Field label="Years of experience">
          <input
            name="yearsExperience"
            type="number"
            min={0}
            max={70}
            defaultValue={defaults.yearsExperience}
            className={inputClass}
          />
        </Field>
        <Field label="Transactions closed">
          <input
            name="transactions"
            type="number"
            min={0}
            defaultValue={defaults.transactions}
            className={inputClass}
          />
        </Field>
        <Field label="Total sales volume" hint="Lifetime, in your currency">
          <input
            name="totalSales"
            type="number"
            min={0}
            step="1"
            defaultValue={defaults.totalSales}
            className={inputClass}
          />
        </Field>
        <Field label="Average sale price">
          <input
            name="avgPrice"
            type="number"
            min={0}
            step="1"
            defaultValue={defaults.avgPrice}
            className={inputClass}
          />
        </Field>
      </div>

      <Field
        label="Service areas"
        hint="Comma separated towns or cities, e.g. Edison, Iselin, East Brunswick"
      >
        <textarea
          name="serviceAreas"
          rows={2}
          defaultValue={defaults.serviceAreas}
          className={inputClass}
        />
      </Field>

      <Field
        label="Designations & certifications"
        hint="Comma separated, e.g. Senior Real Estate Specialist, Top Producer"
      >
        <textarea
          name="designations"
          rows={2}
          defaultValue={defaults.designations}
          className={inputClass}
        />
      </Field>

      <Field label="Awards" hint="Comma separated with the year, e.g. 2026 Top Agent">
        <textarea name="awards" rows={2} defaultValue={defaults.awards} className={inputClass} />
      </Field>

      <fieldset className="rounded-2xl border border-slate-200 p-4">
        <legend className="px-1 text-sm font-bold text-slate-900">Specialties</legend>
        <div className="mt-1 grid gap-2 sm:grid-cols-2">
          {AGENT_SPECIALTIES.map((specialty) => (
            <label key={specialty} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="specialties"
                value={specialty}
                defaultChecked={defaults.specialties.includes(specialty)}
                className="h-4 w-4 rounded border-slate-300"
              />
              {specialty}
            </label>
          ))}
        </div>
      </fieldset>

      <SubmitButton>Save agent profile</SubmitButton>
    </form>
  );
}
