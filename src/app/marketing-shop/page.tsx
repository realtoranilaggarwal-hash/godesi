import type { Metadata } from "next";
import { siteUrl } from "@/lib/format";
import { MARKETING_SHOP_ORDER_FOR, type MarketingShopOrderFor } from "@/lib/marketingShop";
import { MarketingShopOrderForm } from "@/components/MarketingShopOrderForm";

export const metadata: Metadata = {
  title: "GoDesi Marketing Shop: custom flags, car stickers, banners, flyers & logo gifts",
  description:
    "Custom marketing items designed with your logo and GoDesi QR code and shipped to you: flags, car stickers, banners, flyers, QR keychains, pens, vests and hoodies.",
  alternates: { canonical: `${siteUrl()}/marketing-shop` },
};

const ERRORS: Record<string, string> = {
  items: "Add at least one item to your order.",
  email: "Enter a valid email so we can send your design preview.",
};

export default function MarketingShopPage({
  searchParams,
}: {
  searchParams: { for?: string; paid?: string; error?: string };
}) {
  const orderFor: MarketingShopOrderFor =
    searchParams.for && searchParams.for in MARKETING_SHOP_ORDER_FOR
      ? (searchParams.for as MarketingShopOrderFor)
      : "shop";
  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-gradient-to-r from-orange-500 via-rose-500 to-indigo-600 px-5 py-8 text-white sm:px-8">
        <p className="text-xs font-bold uppercase tracking-widest text-white/80">GoDesi Marketing Shop</p>
        <h1 className="mt-2 text-3xl font-black sm:text-4xl">Your logo on flags, stickers, flyers & more</h1>
        <p className="mt-3 max-w-2xl text-white/90">
          Pick your items. We design each one with your logo and your GoDesi QR code, so people who
          scan it land on your GoDesi page and website, then we ship it to your door.
        </p>
        <ul className="mt-4 flex flex-wrap gap-2 text-sm font-semibold">
          <li className="rounded-full bg-white/20 px-3 py-1">Design included</li>
          <li className="rounded-full bg-white/20 px-3 py-1">GoDesi QR on every item</li>
          <li className="rounded-full bg-white/20 px-3 py-1">Shipped to your address</li>
        </ul>
      </section>

      {searchParams.paid ? (
        <p className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-sm font-semibold text-emerald-900">
          Thank you, your order is in. Check your email and reply with your logo; we&apos;ll send a design preview before we ship.
        </p>
      ) : null}
      {searchParams.error && ERRORS[searchParams.error] ? (
        <p className="rounded-2xl border border-rose-300 bg-rose-50 p-4 text-sm font-semibold text-rose-900">
          {ERRORS[searchParams.error]}
        </p>
      ) : null}

      <MarketingShopOrderForm orderFor={orderFor} />
    </div>
  );
}
