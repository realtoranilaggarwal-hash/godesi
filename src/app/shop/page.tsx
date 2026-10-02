import type { Metadata } from "next";
import Link from "next/link";
import { siteUrl } from "@/lib/format";
import { recommendedLinks } from "@/lib/resourcesQueries";
import { LinkImpressions } from "@/components/LinkImpressions";
import { Card } from "@/components/ui";
import {
  SHOP_SHELVES,
  amazonSearchUrl,
  ebaySearchUrl,
  shopConfig,
} from "@/lib/shop";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Desi shop: Diwali decor, puja items, Indian kitchen & ethnic wear",
  description:
    "Shop Diwali and festival decor, puja essentials, Indian kitchenware, sarees and kurtas, wedding favours and Indian groceries from trusted online stores.",
  alternates: { canonical: `${siteUrl()}/shop` },
};

const OUT = "noopener noreferrer sponsored nofollow";

function StoreButton({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel={OUT}
      className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 hover:border-indigo-300 hover:text-indigo-700"
    >
      {label} →
    </a>
  );
}

export default async function ShopPage() {
  const { amazonTag, ebayCampaignId, quicklyUrl } = shopConfig();
  const pinned = await recommendedLinks(null, 24, "shop");
  const stores = pinned.length ? pinned : await recommendedLinks(null, 12);
  const hasShelfStores = Boolean(amazonTag || ebayCampaignId);

  return (
    <div className="space-y-6">
      <header className="rounded-3xl bg-gradient-to-br from-amber-50 via-rose-50 to-indigo-50 p-6">
        <h1 className="text-2xl font-black sm:text-3xl">🛍️ Desi shop</h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-700">
          Festival decor, puja items, Indian kitchenware, ethnic wear and
          groceries from online stores, picked for desi homes. Looking for a
          local business instead? See{" "}
          <Link
            href="/deals"
            className="font-semibold text-indigo-700 underline"
          >
            deals from desi businesses
          </Link>
          .
        </p>
        <p className="mt-3 text-xs text-slate-600">
          <strong>Paid links:</strong> GoDesi may earn a commission when you buy
          through links on this page, at no extra cost to you.
          {amazonTag
            ? " As an Amazon Associate I earn from qualifying purchases."
            : ""}{" "}
          Prices, stock, delivery and returns are set by each store. Shopping
          links never earn GoDesi points.
        </p>
      </header>

      {quicklyUrl ? (
        <Card className="flex flex-col gap-3 border-emerald-200 bg-emerald-50/60 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-emerald-900">
              🛒 Indian groceries delivered — Quicklly
            </h2>
            <p className="text-sm text-emerald-800">
              Atta, dal, masala, sweets, frozen food and restaurant meals
              shipped across the US.
            </p>
          </div>
          <StoreButton href={quicklyUrl} label="Shop Quicklly (paid link)" />
        </Card>
      ) : null}

      {hasShelfStores ? (
        <section className="space-y-3">
          <h2 className="text-lg font-bold">Shop by occasion</h2>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {SHOP_SHELVES.map((shelf) => (
              <li
                key={shelf.key}
                id={shelf.key}
                className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4"
              >
                <div>
                  <p className="text-2xl">{shelf.icon}</p>
                  <h3 className="mt-1 font-bold">{shelf.title}</h3>
                  <p className="mt-0.5 text-xs text-slate-600">{shelf.blurb}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {amazonTag ? (
                    <StoreButton
                      href={amazonSearchUrl(shelf.query, amazonTag)}
                      label="Amazon"
                    />
                  ) : null}
                  {ebayCampaignId ? (
                    <StoreButton
                      href={ebaySearchUrl(shelf.query, ebayCampaignId)}
                      label="eBay"
                    />
                  ) : null}
                </div>
                <p className="text-[10px] uppercase tracking-wide text-slate-400">
                  Paid links
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {stores.length ? (
        <section className="space-y-3">
          <h2 className="text-lg font-bold">More stores &amp; offers</h2>
          <LinkImpressions ids={stores.map((link) => link.id)} />
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {stores.map((link) => (
              <li
                key={link.id}
                className="rounded-2xl border border-slate-200 bg-white p-4"
              >
                <a
                  href={`/api/links/${link.id}/click`}
                  target="_blank"
                  rel={OUT}
                  className="font-bold text-indigo-800 hover:underline"
                >
                  {link.title}
                </a>
                {link.description ? (
                  <p className="mt-1 line-clamp-3 text-xs text-slate-600">
                    {link.description}
                  </p>
                ) : null}
                <p className="mt-2 text-[10px] uppercase tracking-wide text-slate-400">
                  {link.kind === "EDITORIAL" ? "Recommended" : "Paid link"}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {!quicklyUrl && !hasShelfStores && !stores.length ? (
        <p className="text-sm text-slate-600">
          The shop is being stocked — check back soon.
        </p>
      ) : null}
    </div>
  );
}
