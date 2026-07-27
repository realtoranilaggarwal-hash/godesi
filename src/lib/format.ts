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

export function normalizeWhatsApp(input: string) {
  const digits = input.replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
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
