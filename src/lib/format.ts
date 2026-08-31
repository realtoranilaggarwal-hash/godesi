export function formatInr(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatUsd(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

/** Whole-unit amount in the currency the poster priced it in. */
export function formatMoney(value: number, currency: string) {
  return currency.toUpperCase() === "INR" ? formatInr(value) : formatUsd(value);
}

/**
 * Money is stored in the currency's minor unit (paise, cents) so fractional
 * prices such as $5.99 survive a round trip through the database.
 */
export function toMinor(value: number) {
  return Math.round(value * 100);
}

export function fromMinor(minor: number) {
  return minor / 100;
}

export function formatMinor(minor: number, currency: string) {
  return currency.toUpperCase() === "INR"
    ? formatInr(fromMinor(minor))
    : formatUsd(fromMinor(minor));
}

/** Ten or more digits, ignoring spaces, dashes and brackets — matches normalizeWhatsApp. */
export const PHONE_PATTERN = "(?:\\D*\\d){10,}\\D*";

export const PHONE_PATTERN_HINT =
  "Enter at least 10 digits — a 10-digit mobile, or the full number with country code.";

/**
 * A wa.me number. GoDesi is a US directory, so a bare ten-digit number is read
 * as American; anything already carrying a country code is left alone, and an
 * Indian number is written the way it is dialled, with the 91.
 */
export function normalizeWhatsApp(input: string) {
  const digits = input.replace(/\D/g, "");
  if (digits.length === 10) return `1${digits}`;
  if (digits.length === 11 && digits.startsWith("0"))
    return `91${digits.slice(1)}`;
  return digits;
}

export function whatsappLink(number: string, message?: string) {
  const base = `https://wa.me/${normalizeWhatsApp(number)}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function siteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "http://localhost:3000"
  );
}
