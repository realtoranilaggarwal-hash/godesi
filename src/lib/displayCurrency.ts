import { cookies, headers } from "next/headers";
import {
  COUNTRY_CURRENCY,
  isDisplayCurrency,
  type DisplayCurrency,
} from "@/lib/rates";

export const CURRENCY_COOKIE = "godesi_currency";

/**
 * The currency prices are shown in: the visitor's own choice if they picked
 * one, otherwise guessed from the country the request came from.
 */
export function displayCurrency(): DisplayCurrency {
  const chosen = cookies().get(CURRENCY_COOKIE)?.value;
  if (chosen && isDisplayCurrency(chosen)) return chosen;

  const country = headers().get("x-vercel-ip-country") ?? "";
  return COUNTRY_CURRENCY[country] ?? "USD";
}
