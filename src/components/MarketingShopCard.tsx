import Link from "next/link";
import { MARKETING_PRODUCTS, type MarketingShopOrderFor, marketingShopFromUsd, usd } from "@/lib/marketingShop";

export function MarketingShopCard({ orderFor }: { orderFor?: MarketingShopOrderFor }) {
  return (
    <section className="rounded-2xl border border-orange-300 bg-orange-50 p-4">
      <p className="font-bold text-orange-900">🛒 Add marketing items to your order</p>
      <p className="mt-1 text-sm text-slate-700">
        Flags, car stickers, banners, flyers, QR keychains, pens and logo wear, designed with your
        logo and GoDesi QR code and shipped to you. {MARKETING_PRODUCTS.length} items from{" "}
        {usd(marketingShopFromUsd())}.
      </p>
      <Link
        href={orderFor ? `/marketing-shop?for=${orderFor}` : "/marketing-shop"}
        className="mt-3 inline-flex rounded-xl bg-orange-500 px-4 py-2 text-sm font-bold text-white hover:bg-orange-600"
      >
        Open the GoDesi Marketing Shop →
      </Link>
    </section>
  );
}
