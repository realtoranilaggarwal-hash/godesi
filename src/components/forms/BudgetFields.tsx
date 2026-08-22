"use client";

import { Field, inputClass } from "@/components/ui";
import { DISPLAY_CURRENCIES } from "@/lib/rates";

/**
 * Budget in the poster's own money: dollars in the States, rupees in India,
 * pounds in the UK. The choice is stored with the requirement so vendors see
 * the number the buyer meant.
 */
export function BudgetFields({ currency }: { currency: string }) {
  return (
    <>
      <Field label="Budget currency">
        <select
          name="budgetCurrency"
          defaultValue={currency}
          className={inputClass}
        >
          {DISPLAY_CURRENCIES.map((item) => (
            <option key={item.code} value={item.code}>
              {item.flag} {item.symbol} {item.label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Budget from" hint="Optional">
        <input name="budgetMin" type="number" min={0} className={inputClass} />
      </Field>
      <Field label="Budget to" hint="Optional">
        <input name="budgetMax" type="number" min={0} className={inputClass} />
      </Field>
    </>
  );
}
