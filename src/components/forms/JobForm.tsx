"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import type { Job } from "@prisma/client";
import { createJobAction, updateJobAction } from "@/app/actions/jobs";
import { emptyState } from "@/lib/actions";
import {
  JOB_CATEGORIES,
  JOB_PAY_METHODS,
  JOB_PAY_TYPES,
  JOB_WORK_TYPES,
  payHasCommission,
} from "@/lib/jobs";
import { Field, inputClass } from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";
import { FormError } from "@/components/forms/FormError";

export function JobForm({ job }: { job?: Job }) {
  const [state, formAction] = useFormState(
    job ? updateJobAction : createJobAction,
    emptyState,
  );
  const [payType, setPayType] = useState(job?.payType ?? "HOURLY");
  const [remote, setRemote] = useState(job?.remote ?? false);
  const unit = JOB_PAY_TYPES.find((type) => type.value === payType)?.unit;

  return (
    <form action={formAction} className="space-y-4">
      <FormError>{state.error}</FormError>
      {job ? <input type="hidden" name="jobId" value={job.id} /> : null}

      <Field label="Kind of job" required>
        <select
          name="category"
          required
          defaultValue={job?.category ?? ""}
          className={inputClass}
        >
          <option value="" disabled>
            Pick one
          </option>
          {JOB_CATEGORIES.map((category) => (
            <option key={category.value} value={category.value}>
              {category.icon} {category.label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Job title" required hint="e.g. Nanny for 2 kids, weekdays 9–3">
        <input
          name="title"
          required
          maxLength={90}
          defaultValue={job?.title}
          className={inputClass}
        />
      </Field>
      <Field
        label="What's the work?"
        required
        hint="What a normal day looks like, hours, training and who it suits"
      >
        <textarea
          name="description"
          required
          rows={6}
          maxLength={4000}
          defaultValue={job?.description}
          className={inputClass}
        />
      </Field>
      <Field
        label="What you need from them"
        hint="One per line, e.g. 10 sales a month, speaks Hindi, own laptop"
      >
        <textarea
          name="requirements"
          rows={3}
          maxLength={1500}
          defaultValue={job?.requirements ?? ""}
          className={inputClass}
        />
      </Field>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Type of job" required>
          <select
            name="workType"
            defaultValue={job?.workType ?? "PART_TIME"}
            className={inputClass}
          >
            {JOB_WORK_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </Field>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              name="remote"
              checked={remote}
              onChange={(event) => setRemote(event.target.checked)}
            />
            Work from home / remote
          </label>
          <Field label={remote ? "City (optional)" : "City"} required={!remote}>
            <input
              name="city"
              maxLength={80}
              required={!remote}
              defaultValue={job?.city ?? ""}
              placeholder="Edison, NJ"
              className={inputClass}
            />
          </Field>
        </div>
      </div>

      <fieldset className="space-y-3 rounded-xl border border-slate-200 p-3">
        <legend className="px-1 text-sm font-semibold text-slate-700">Pay</legend>
        <Field label="How is it paid?" required>
          <select
            name="payType"
            value={payType}
            onChange={(event) => setPayType(event.target.value as typeof payType)}
            className={inputClass}
          >
            {JOB_PAY_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </Field>
        <div className="grid gap-3 sm:grid-cols-2">
          {payType !== "COMMISSION" ? (
            <Field
              label={payType === "BASE_PLUS_COMMISSION" ? "Base pay ($ a month)" : `Pay ($ ${unit})`}
              hint="Leave blank to agree it on the call"
            >
              <input
                name="payUsd"
                type="number"
                min={0}
                step="0.01"
                defaultValue={job?.payMinor ? job.payMinor / 100 : ""}
                className={inputClass}
              />
            </Field>
          ) : null}
          <Field
            label="Commission (% of each sale)"
            required={payHasCommission(payType)}
            hint={payHasCommission(payType) ? undefined : "Optional bonus on top"}
          >
            <input
              name="commissionPct"
              type="number"
              min={1}
              max={100}
              step={1}
              required={payHasCommission(payType)}
              defaultValue={job?.commissionPct ?? ""}
              className={inputClass}
            />
          </Field>
        </div>
        <div>
          <p className="mb-1 text-sm font-medium text-slate-700">Paid by</p>
          <div className="flex flex-wrap gap-3">
            {JOB_PAY_METHODS.map((method) => (
              <label key={method.value} className="flex items-center gap-1.5 text-sm">
                <input
                  type="checkbox"
                  name="payMethods"
                  value={method.value}
                  defaultChecked={job?.payMethods.includes(method.value)}
                />
                {method.label}
              </label>
            ))}
          </div>
        </div>
      </fieldset>

      <p className="text-xs text-slate-500">
        Only signed-in GoDesi members can see job posts. Describe the work, not
        the person: US law doesn&apos;t allow asking for a gender, age, religion
        or national origin in a job ad.
      </p>
      <SubmitButton pendingLabel={job ? "Saving..." : "Posting..."}>
        {job ? "Save job" : "💼 Post job"}
      </SubmitButton>
    </form>
  );
}
