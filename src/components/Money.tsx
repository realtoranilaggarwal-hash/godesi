import { formatMoney } from "@/lib/format";
import { displayCurrency } from "@/lib/displayCurrency";
import { convert, formatDisplay, getRates } from "@/lib/rates";

/**
 * A price in the currency it was posted in, plus an approximate conversion into
 * the visitor's own currency — "₹4,100 (~$50)". The stored amount is never
 * changed; payments still take the original currency.
 */
export async function Money({
  value,
  currency,
  className,
}: {
  value: number;
  currency: string;
  className?: string;
}) {
  const original = formatMoney(value, currency);
  const target = displayCurrency();

  if (!value || target.toUpperCase() === currency.toUpperCase()) {
    return <span className={className}>{original}</span>;
  }

  const rates = await getRates();
  const converted = convert(value, currency, target, rates);
  if (converted === null) return <span className={className}>{original}</span>;

  return (
    <span className={className}>
      {original}{" "}
      <span className="font-normal text-slate-500">
        (~{formatDisplay(converted, target)})
      </span>
    </span>
  );
}
