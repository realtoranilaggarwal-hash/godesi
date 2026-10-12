import Link from "next/link";
import type { Festival } from "@/lib/festivals";
import { amazonSearchUrl, ebaySearchUrl, shopConfig } from "@/lib/shop";

const OUT = "noopener noreferrer sponsored nofollow";

function StoreButton({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel={OUT}
      className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-800 hover:border-amber-400 hover:text-amber-700"
    >
      {label} →
    </a>
  );
}

/** "Shop for …" store searches for one or more festivals; hidden until a store ID is set. */
export function FestivalShop({
  festivals,
  title,
}: {
  festivals: Pick<Festival, "name" | "emoji" | "shop">[];
  title: string;
}) {
  const { amazonTag, ebayCampaignId } = shopConfig();
  if (!amazonTag && !ebayCampaignId) return null;
  const items = festivals.flatMap((festival) =>
    festival.shop.map((item) => ({ ...item, festival })),
  );
  if (!items.length) return null;

  return (
    <section className="space-y-3 rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-rose-50 p-5">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2 className="text-lg font-bold">🛍️ {title}</h2>
        <Link
          href="/shop"
          className="text-sm font-semibold text-indigo-600 hover:underline"
        >
          More in the desi shop →
        </Link>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <li
            key={`${item.festival.name}-${item.label}`}
            className="flex flex-col justify-between gap-2 rounded-2xl border border-slate-200 bg-white p-3"
          >
            <p className="font-semibold">
              {festivals.length > 1 ? `${item.festival.emoji} ` : ""}
              {item.label}
            </p>
            <div className="flex flex-wrap gap-2">
              {amazonTag ? (
                <StoreButton
                  href={amazonSearchUrl(item.query, amazonTag)}
                  label="Amazon"
                />
              ) : null}
              {ebayCampaignId ? (
                <StoreButton
                  href={ebaySearchUrl(item.query, ebayCampaignId)}
                  label="eBay"
                />
              ) : null}
            </div>
          </li>
        ))}
      </ul>
      <p className="text-xs text-slate-500">
        <strong>Paid links:</strong> GoDesi may earn a commission when you buy
        through these links, at no extra cost to you.
        {amazonTag
          ? " As an Amazon Associate I earn from qualifying purchases."
          : ""}{" "}
        Prices, stock and delivery are set by each store.
      </p>
    </section>
  );
}
