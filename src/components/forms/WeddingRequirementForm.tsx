"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { createLeadAction } from "@/app/actions/leads";
import { emptyState } from "@/lib/actions";
import { WEDDING_GROUPS } from "@/lib/wedding";
import { Field, inputClass } from "@/components/ui";
import { SubmitButton } from "@/components/SubmitButton";
import { PHONE_PATTERN, PHONE_PATTERN_HINT } from "@/lib/format";
import { FormError } from "@/components/forms/FormError";

/** Couples post here; only Premium vendors can unlock the contact details. */
export function WeddingRequirementForm({
  defaultName,
  defaultEmail,
  defaultService,
}: {
  defaultName?: string;
  defaultEmail?: string;
  defaultService?: string;
}) {
  const [state, formAction] = useFormState(createLeadAction, emptyState);
  const [services, setServices] = useState<string[]>(
    defaultService ? [defaultService] : [],
  );
  const [dateFlexible, setDateFlexible] = useState(false);

  const toggle = (service: string) =>
    setServices((current) =>
      current.includes(service)
        ? current.filter((item) => item !== service)
        : [...current, service],
    );

  const category = services.length
    ? `Wedding — ${services.join(", ")}`
    : "Wedding — not decided yet";

  return (
    <form action={formAction} className="space-y-4">
      <FormError>{state.error}</FormError>

      <Field label="What do you need?" hint="e.g. Need a wedding photographer in NJ">
        <input name="title" required className={inputClass} />
      </Field>

      <fieldset>
        <legend className="text-sm font-semibold text-slate-800">
          Which services are you looking for?
        </legend>
        <p className="text-xs text-slate-500">
          Tick everything you need — vendors in those services will see your post.
          Not decided yet? Leave them all unticked and every wedding vendor will see
          it.
        </p>
        {services.length === 0 ? (
          <p className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
            Nothing ticked — posting as “not decided yet”, open to all wedding
            vendors.
          </p>
        ) : null}
        <input type="hidden" name="category" value={category} />
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          {WEDDING_GROUPS.map((group) => (
            <div
              key={group.title}
              className="rounded-2xl border border-rose-100 bg-rose-50/50 p-3"
            >
              <p className="text-sm font-bold text-rose-900">
                {group.icon} {group.title}
              </p>
              <div className="mt-2 space-y-1">
                {group.items.map((item) => (
                  <label
                    key={item}
                    className="flex items-center gap-2 text-sm text-slate-700"
                  >
                    <input
                      type="checkbox"
                      checked={services.includes(item)}
                      onChange={() => toggle(item)}
                      className="h-4 w-4"
                    />
                    {item}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </fieldset>

      <Field
        label="Details"
        hint="Number of guests, venue, style, languages, anything vendors should know"
      >
        <textarea name="description" rows={4} required className={inputClass} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="City">
          <input name="city" required className={inputClass} />
        </Field>
        {dateFlexible ? <input type="hidden" name="eventDate" value="" /> : null}
        <Field label="Wedding / event date" hint="Leave blank if the date is not fixed">
          <input
            name="eventDate"
            type="date"
            disabled={dateFlexible}
            className={inputClass}
          />
          <label className="mt-2 flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={dateFlexible}
              onChange={(event) => setDateFlexible(event.target.checked)}
              className="h-4 w-4"
            />
            Date not decided yet / flexible
          </label>
        </Field>
        <Field label="Budget from">
          <input name="budgetMin" type="number" min={0} className={inputClass} />
        </Field>
        <Field label="Budget to">
          <input name="budgetMax" type="number" min={0} className={inputClass} />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Your name">
          <input
            name="contactName"
            required
            defaultValue={defaultName ?? ""}
            className={inputClass}
          />
        </Field>
        <Field label="WhatsApp / phone" hint="Only Premium vendors can see this" required>
          <input
            name="contactPhone"
            required
            inputMode="tel"
            pattern={PHONE_PATTERN}
            title={PHONE_PATTERN_HINT}
            className={inputClass}
          />
        </Field>
        <Field label="Email">
          <input
            name="contactEmail"
            type="email"
            defaultValue={defaultEmail ?? ""}
            className={inputClass}
          />
        </Field>
      </div>

      <SubmitButton pendingLabel="Posting...">
        Post my wedding requirement
      </SubmitButton>
    </form>
  );
}
