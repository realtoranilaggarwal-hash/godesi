"use server";

import { redirect } from "next/navigation";
import { siteUrl } from "@/lib/format";
import {
  MARKETING_PRODUCTS,
  MARKETING_SHOP_ORDER_FOR,
  type MarketingShopOrderFor,
} from "@/lib/marketingShop";
import { designKey, encodeCart, requestMarketingShopOrder } from "@/lib/marketingShopOrders";
import { getStripe, stripeEnabled } from "@/lib/stripe";

const MAX_QTY = 50;

function field(formData: FormData, name: string, max: number) {
  return String(formData.get(name) ?? "").replace(/\r\n/g, "\n").trim().slice(0, max);
}

export async function startMarketingShopCheckout(formData: FormData) {
  const back = `${siteUrl()}/marketing-shop`;
  const items = MARKETING_PRODUCTS.flatMap((product) => {
    const qty = Math.floor(Number(formData.get(`qty-${product.id}`) ?? 0));
    return Number.isFinite(qty) && qty > 0 ? [{ product, qty: Math.min(qty, MAX_QTY) }] : [];
  });
  const email = field(formData, "email", 200);
  if (!items.length) redirect(`${back}?error=items#order`);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) redirect(`${back}?error=email#order`);
  const designs = Object.fromEntries(
    items.map(({ product }) => [designKey(product.id), field(formData, designKey(product.id), 300)]),
  );
  if (Object.values(designs).some((d) => !d)) redirect(`${back}?error=artwork#order`);
  if (formData.get("noReturns") !== "on") redirect(`${back}?error=returns#order`);
  const orderForRaw = field(formData, "orderFor", 20);
  const orderFor: MarketingShopOrderFor =
    orderForRaw in MARKETING_SHOP_ORDER_FOR ? (orderForRaw as MarketingShopOrderFor) : "shop";
  const metadata = {
    kind: "marketing-shop",
    items: encodeCart(items.map(({ product, qty }) => ({ id: product.id, qty }))),
    name: field(formData, "name", 100),
    business: field(formData, "business", 120),
    phone: field(formData, "phone", 40),
    page: field(formData, "page", 200),
    orderFor,
    notes: field(formData, "notes", 450),
    noReturns: "agreed",
    ...designs,
  };
  const cart = items.map(({ product, qty }) => ({ id: product.id, qty }));

  if (!stripeEnabled() || !process.env.STRIPE_WEBHOOK_SECRET) {
    const sent = await requestMarketingShopOrder({ ...metadata, items: cart, email, designs });
    redirect(sent ? `${back}?requested=1` : `${back}?error=checkout#order`);
  }

  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    customer_email: email,
    payment_method_types: ["card"],
    shipping_address_collection: { allowed_countries: ["US"] },
    metadata,
    payment_intent_data: { metadata: { kind: metadata.kind, items: metadata.items } },
    line_items: items.map(({ product, qty }) => ({
      quantity: qty,
      price_data: {
        currency: "usd",
        unit_amount: Math.round(product.priceUsd * 100),
        product_data: {
          name: `${product.name} — designed with your logo + GoDesi QR`,
          description: product.blurb,
        },
      },
    })),
    success_url: `${back}?paid=1`,
    cancel_url: `${back}#order`,
  });
  redirect(session.url ?? back);
}
