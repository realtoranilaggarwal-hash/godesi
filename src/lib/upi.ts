import { randomBytes } from "crypto";

/**
 * "Pay by UPI" support. UPI without a payment gateway has no callback, so the
 * buyer pays into our VPA quoting a reference and staff confirm the credit in
 * /admin. Configure UPI_VPA (and optionally UPI_PAYEE_NAME) to switch it on.
 */
export function upiVpa() {
  return (process.env.UPI_VPA ?? "").trim();
}

export function upiPayeeName() {
  return (process.env.UPI_PAYEE_NAME ?? "Godesi").trim();
}

export function upiEnabled() {
  return /^[\w.\-]{2,}@[\w.\-]{2,}$/.test(upiVpa());
}

/** Short, unambiguous code the buyer puts in the UPI note. */
export function newUpiReference() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(6);
  let code = "";
  for (let index = 0; index < bytes.length; index += 1) {
    code += alphabet[bytes[index] % alphabet.length];
  }
  return `GD${code}`;
}

/**
 * upi:// intent link understood by PhonePe, Google Pay, Paytm and bank apps,
 * and by the QR image we render from it.
 */
export function upiIntentUrl({
  amountMinor,
  reference,
  currency = "INR",
}: {
  amountMinor: number;
  reference: string;
  currency?: string;
}) {
  const params = new URLSearchParams({
    pa: upiVpa(),
    pn: upiPayeeName(),
    am: (amountMinor / 100).toFixed(2),
    cu: currency,
    tn: `Godesi ${reference}`,
  });
  return `upi://pay?${params.toString()}`;
}
