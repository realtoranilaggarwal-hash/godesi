import { formatMoney } from "@/lib/format";
import { isDisplayCurrency } from "@/lib/rates";

/** Rupees for the requirements posted before the form asked which currency. */
export const LEGACY_BUDGET_CURRENCY = "INR";

export function budgetCurrencyOf(value: string | null | undefined) {
  return value && isDisplayCurrency(value) ? value : LEGACY_BUDGET_CURRENCY;
}

/** "$5,000 – $8,000", in whatever currency the person posting typed. */
export function budgetRange(
  min: number | null,
  max: number | null,
  currency: string | null | undefined,
  openLabel = "Budget not specified",
) {
  if (min === null && max === null) return openLabel;
  const code = budgetCurrencyOf(currency);
  if (min !== null && max !== null) {
    return `${formatMoney(min, code)} – ${formatMoney(max, code)}`;
  }
  return formatMoney((min ?? max) as number, code);
}
