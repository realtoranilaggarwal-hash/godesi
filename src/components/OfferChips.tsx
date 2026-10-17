import {
  BENEFITS_FINE_PRINT,
  BENEFITS_INTRO,
  BENEFITS_POINTS,
  BENEFITS_QUESTION,
  CONTACT_CONSENT,
  OFFER_GROUPS,
} from "@/lib/offerInterests";
import { Field, inputClass } from "@/components/ui";

export function OfferChips({
  selected = [],
  phone = "",
  contactOk = false,
}: {
  selected?: string[];
  phone?: string;
  contactOk?: boolean;
}) {
  return (
    <div className="space-y-3">
      <div className="space-y-1.5 text-sm text-slate-700">
        <p className="font-semibold text-slate-900">{BENEFITS_QUESTION}</p>
        <p>{BENEFITS_INTRO}</p>
        <ul className="grid gap-x-4 gap-y-0.5 text-xs text-slate-600 sm:grid-cols-2">
          {BENEFITS_POINTS.map((point) => (
            <li key={point}>✓ {point}</li>
          ))}
        </ul>
      </div>
      {OFFER_GROUPS.map((group) => (
        <fieldset key={group.label}>
          <legend className="mb-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">
            {group.label}
          </legend>
          <div className="flex flex-wrap gap-2">
            {group.items.map((item) => (
              <label key={item.id} className="cursor-pointer">
                <input
                  type="checkbox"
                  name="offers"
                  value={item.id}
                  defaultChecked={selected.includes(item.id)}
                  className="peer sr-only"
                />
                <span className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 transition hover:border-indigo-300 peer-checked:border-indigo-600 peer-checked:bg-indigo-600 peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-400">
                  <span aria-hidden>{item.icon}</span>
                  {item.label}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      ))}
      <label className="flex items-start gap-2 rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700">
        <input
          type="checkbox"
          name="offerContact"
          defaultChecked={contactOk}
          className="mt-0.5 h-4 w-4 shrink-0"
        />
        <span>
          {CONTACT_CONSENT}{" "}
          <span className="text-slate-500">
            Optional — ticking topics alone never lets a provider contact you.
          </span>
        </span>
      </label>
      <Field
        label="Phone or WhatsApp (optional)"
        hint="Used only if you tick the box above; never shown publicly."
      >
        <input
          name="offerPhone"
          type="tel"
          autoComplete="tel"
          defaultValue={phone}
          className={inputClass}
        />
      </Field>
      <p className="text-xs text-slate-500">{BENEFITS_FINE_PRINT}</p>
    </div>
  );
}
