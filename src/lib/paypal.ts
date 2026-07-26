const LIVE = "https://api-m.paypal.com";
const SANDBOX = "https://api-m.sandbox.paypal.com";

export function paypalEnabled() {
  return Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET);
}

export function paypalApiBase() {
  return process.env.PAYPAL_ENV === "sandbox" ? SANDBOX : LIVE;
}

async function accessToken() {
  const id = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  if (!id || !secret) throw new Error("PayPal credentials are not configured");

  const response = await fetch(`${paypalApiBase()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`PayPal auth failed (${response.status})`);
  }
  const data = (await response.json()) as { access_token: string };
  return data.access_token;
}

type PayPalOrder = {
  id: string;
  status: string;
  purchase_units?: Array<{
    custom_id?: string;
    payments?: {
      captures?: Array<{
        id: string;
        status: string;
        amount: { value: string; currency_code: string };
      }>;
    };
  }>;
};

export async function createPayPalOrder({
  amount,
  currency,
  description,
  customId,
}: {
  amount: number;
  currency: string;
  description: string;
  customId: string;
}): Promise<PayPalOrder> {
  const response = await fetch(`${paypalApiBase()}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${await accessToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          description,
          custom_id: customId,
          amount: { currency_code: currency, value: amount.toFixed(2) },
        },
      ],
    }),
    cache: "no-store",
  });

  const data = (await response.json()) as PayPalOrder & { message?: string };
  if (!response.ok) {
    throw new Error(data.message ?? `PayPal order creation failed (${response.status})`);
  }
  return data;
}

export async function capturePayPalOrder(orderId: string): Promise<PayPalOrder> {
  const response = await fetch(
    `${paypalApiBase()}/v2/checkout/orders/${orderId}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${await accessToken()}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    },
  );

  const data = (await response.json()) as PayPalOrder & { message?: string };
  if (!response.ok) {
    throw new Error(data.message ?? `PayPal capture failed (${response.status})`);
  }
  return data;
}
