"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { CURRENCY_COOKIE } from "@/lib/displayCurrency";
import { isDisplayCurrency } from "@/lib/rates";

const ONE_YEAR = 60 * 60 * 24 * 365;

/** Remembers the currency a visitor picked from the header switcher. */
export async function setCurrencyAction(formData: FormData) {
  const value = String(formData.get("currency") ?? "");
  if (!isDisplayCurrency(value)) return;

  cookies().set(CURRENCY_COOKIE, value, {
    maxAge: ONE_YEAR,
    path: "/",
    sameSite: "lax",
  });
  revalidatePath("/", "layout");
}
