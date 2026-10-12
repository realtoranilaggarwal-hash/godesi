import { OFFER_CONSENT, OFFER_GROUPS } from "@/lib/offerInterests";
import { Field, inputClass } from "@/components/ui";

export function OfferChips({
  selected = [],
  phone = "",
}: {
  selected?: string[];
  phone?: string;
}) {
  return (
    <div className="space-y-3">
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
      <Field
        label="Phone or WhatsApp for these offers"
        hint="Optional. Only our team and the professional you asked for see it."
      >
        <input
          name="offerPhone"
          type="tel"
          autoComplete="tel"
          defaultValue={phone}
          className={inputClass}
        />
      </Field>
      <p className="text-xs text-slate-500">{OFFER_CONSENT}</p>
    </div>
  );
}
