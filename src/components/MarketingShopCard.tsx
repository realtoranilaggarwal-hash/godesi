import Link from "next/link";
import { MARKETING_PRODUCTS } from "@/lib/marketingShop";

export function MarketingShopCard() {
  return (
    <section className="rounded-2xl border border-orange-300 bg-orange-50 p-4">
      <p className="flex items-center justify-between gap-2">
        <span className="font-bold text-orange-900">🛒 GoDesi Marketing Shop</span>
        <span className="text-[10px] uppercase tracking-wide text-slate-500">Partner links</span>
      </p>
      <p className="mt-1 text-sm text-slate-700">
        Flags, car stickers, banners, flyers, QR keychains, pens and logo wear, printed with your
        logo. {MARKETING_PRODUCTS.length} items from {lowestPrice()}.
      </p>
      <Link
        href="/marketing-shop"
        className="mt-3 inline-flex rounded-xl bg-orange-500 px-4 py-2 text-sm font-bold text-white hover:bg-orange-600"
      >
        Open the Marketing Shop →
      </Link>
    </section>
  );
}

function lowestPrice() {
  const prices = MARKETING_PRODUCTS.map((p) => Number(p.couponPrice.replace(/[^0-9.]/g, "")));
  return `$${Math.min(...prices).toFixed(2)}`;
}
