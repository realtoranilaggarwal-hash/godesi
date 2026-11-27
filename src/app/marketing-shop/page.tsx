import type { Metadata } from "next";
import Link from "next/link";
import { siteUrl } from "@/lib/format";
import { MARKETING_PRODUCTS } from "@/lib/marketingShop";

export const metadata: Metadata = {
  title: "Marketing Shop: custom flags, car stickers, banners, flyers & logo gifts | GoDesi",
  description:
    "Low-cost custom marketing items for your business: logo flags, car stickers, banners, flyers, QR keychains, printed pens, vests and hoodies.",
  alternates: { canonical: `${siteUrl()}/marketing-shop` },
};

export default function MarketingShopPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-gradient-to-r from-orange-500 via-rose-500 to-indigo-600 px-5 py-8 text-white sm:px-8">
        <p className="text-xs font-bold uppercase tracking-widest text-white/80">GoDesi Marketing Shop</p>
        <h1 className="mt-2 text-3xl font-black sm:text-4xl">Market your business for a few dollars</h1>
        <p className="mt-3 max-w-2xl text-white/90">
          Order custom flags, car stickers, banners, flyers, QR keychains, pens and logo wear
          printed with your logo, phone and GoDesi QR code. Pick an item, upload your design on
          Temu and it ships to your door.
        </p>
        <p className="mt-3 text-sm text-white/90">
          Need the design? Your GoDesi page already has a QR code, and{" "}
          <Link href="/contact" className="font-bold underline">
            we can make the artwork for you
          </Link>
          .
        </p>
      </section>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MARKETING_PRODUCTS.map((p) => (
          <li key={p.href} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-4">
            <div className="text-4xl" aria-hidden>
              {p.icon}
            </div>
            <h2 className="mt-2 font-black text-slate-900">{p.name}</h2>
            <p className="mt-1 flex-1 text-sm text-slate-600">{p.blurb}</p>
            <p className="mt-3 text-sm text-slate-700">
              Coupon price <strong className="text-lg text-orange-600">{p.couponPrice}</strong>
            </p>
            <a
              href={p.href}
              target="_blank"
              rel="noopener noreferrer sponsored nofollow"
              className="mt-3 rounded-xl bg-orange-500 px-4 py-2 text-center text-sm font-bold text-white hover:bg-orange-600"
            >
              Order on Temu →
            </a>
          </li>
        ))}
      </ul>

      <p className="px-1 text-xs text-slate-500">
        These are Temu partner links: GoDesi earns a commission when you buy through them, at no
        extra cost to you. Prices are the coupon prices Temu showed when we added the items;
        Temu sets the final price, coupons and shipping.
      </p>
    </div>
  );
}
