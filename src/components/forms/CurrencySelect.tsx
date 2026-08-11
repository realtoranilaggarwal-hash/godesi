import { Field, inputClass } from "@/components/ui";

/** Prices are stored in the currency the poster picked, defaulted from their location. */
export function CurrencySelect({ defaultValue = "INR" }: { defaultValue?: string }) {
  return (
    <Field label="Currency" hint="Buyers are charged in this currency">
      <select name="currency" defaultValue={defaultValue} className={inputClass}>
        <option value="INR">₹ Indian Rupee (INR)</option>
        <option value="USD">$ US Dollar (USD)</option>
      </select>
    </Field>
  );
}
