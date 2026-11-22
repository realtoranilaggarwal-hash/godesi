import type { Metadata } from "next";
import Link from "next/link";
import { siteUrl } from "@/lib/format";
import { recommendedLinks } from "@/lib/resourcesQueries";
import { cachedLiveStoreOffers } from "@/lib/storeOffers";
import { LinkImpressions } from "@/components/LinkImpressions";
import { StoreOfferCard } from "@/components/StoreOfferCard";
import { TemuPicks } from "@/components/TemuPicks";
import { Card } from "@/components/ui";
import {
  ALIEXPRESS_AFFILIATE_URL,
  ALIEXPRESS_AUTO_PIXEL,
  ALIEXPRESS_BANNER_URL,
  ALIEXPRESS_HOME_PIXEL,
  ALIEXPRESS_WIDE_BANNER_URL,
  ALIEXPRESS_WIDE_URL,
  AMAZON_INFLUENCER_URL,
  EFAX_AFFILIATE_URL,
  EFAX_TRACKING_PIXEL,
  SHOP_SHELVES,
  TURBOTAX_AFFILIATE_URL,
  TURBOTAX_TRACKING_PIXEL,
  aliexpressShelfUrl,
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
  const general =
    pinned.length < 12 ? await recommendedLinks(null, 12 - pinned.length) : [];
  const stores = [...pinned, ...general];
  const hasShelfStores = Boolean(
    amazonTag || ebayCampaignId || ALIEXPRESS_AFFILIATE_URL,
  );
  const storeOffers = await cachedLiveStoreOffers(9);

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

      <Card className="flex flex-col gap-3 border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-amber-950">
            ⭐ Anil&apos;s Amazon picks
          </h2>
          <p className="text-sm text-amber-900">
            Browse Anil&apos;s curated products and shopping recommendations on
            Amazon.
          </p>
        </div>
        <StoreButton
          href={AMAZON_INFLUENCER_URL}
          label="Shop Anil's picks (paid link)"
        />
      </Card>

      <Card className="flex flex-col gap-3 border-rose-200 bg-rose-50/60 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-rose-950">
            🎊 AliExpress — wedding, party &amp; event supplies
          </h2>
          <p className="text-sm text-rose-900">
            Planning a New Year party, a wedding or an event promotion? Get
            decor, lights, favours, banners and tableware at low prices, shipped
            direct to your door.
          </p>
          <div className="mt-3">
            <StoreButton
              href={ALIEXPRESS_AFFILIATE_URL}
              label="Shop AliExpress (paid link)"
            />
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ALIEXPRESS_AUTO_PIXEL}
            width="1"
            height="1"
            alt=""
            aria-hidden
            className="inline-block h-px w-px"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ALIEXPRESS_HOME_PIXEL}
            width="1"
            height="1"
            alt=""
            aria-hidden
            className="inline-block h-px w-px"
          />
        </div>
        <div className="shrink-0 text-center">
          <a href={ALIEXPRESS_AFFILIATE_URL} target="_blank" rel={OUT}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={ALIEXPRESS_BANNER_URL}
              width={390}
              height={129}
              alt="AliExpress"
              className="mx-auto h-auto max-w-full"
            />
          </a>
          <p className="mt-1 text-[10px] uppercase tracking-wide text-slate-400">
            Paid link
          </p>
        </div>
      </Card>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">Business &amp; money tools</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Card className="border-sky-200 bg-sky-50/60">
            <h3 className="font-bold text-sky-950">eFax digital faxing</h3>
            <p className="mt-1 text-sm text-sky-900">
              Send and receive business faxes online with the largest digital
              faxing network.
            </p>
            <div className="mt-3">
              <StoreButton
                href={EFAX_AFFILIATE_URL}
                label="Explore eFax (paid link)"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={EFAX_TRACKING_PIXEL}
                width="1"
                height="1"
                alt=""
                aria-hidden
                className="inline-block h-px w-px"
              />
            </div>
          </Card>
          <Card className="border-emerald-200 bg-emerald-50/60">
            <h3 className="font-bold text-emerald-950">
              TurboTax Free Edition
            </h3>
            <p className="mt-1 text-sm text-emerald-900">
              File for free with TurboTax Free Edition. ~37% of filers qualify.
              Simple Form 1040 returns only (no schedules, except for EITC, CTC,
              student loan interest, and Schedule 1-A).
            </p>
            <div className="mt-3">
              <StoreButton
                href={TURBOTAX_AFFILIATE_URL}
                label="Check TurboTax eligibility (paid link)"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={TURBOTAX_TRACKING_PIXEL}
                width="1"
                height="1"
                alt=""
                aria-hidden
                className="inline-block h-px w-px"
              />
            </div>
          </Card>
        </div>
      </section>

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
                  <StoreButton
                    href={aliexpressShelfUrl(shelf.key)}
                    label="AliExpress"
                  />
                </div>
                <p className="text-[10px] uppercase tracking-wide text-slate-400">
                  Paid links
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <TemuPicks />

      {storeOffers.length ? (
        <section className="space-y-3">
          <h2 className="text-lg font-bold">
            Today&apos;s coupons &amp; sales
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {storeOffers.map((offer) => (
              <StoreOfferCard key={offer.id} offer={offer} />
            ))}
          </div>
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

      {!quicklyUrl &&
      !hasShelfStores &&
      !stores.length &&
      !storeOffers.length ? (
        <p className="text-sm text-slate-600">
          The shop is being stocked — check back soon.
        </p>
      ) : null}

      <div className="text-center">
        <a href={ALIEXPRESS_WIDE_URL} target="_blank" rel={OUT}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ALIEXPRESS_WIDE_BANNER_URL}
            width={873}
            height={201}
            className="mx-auto h-auto w-full max-w-3xl"
            alt="AliExpress"
          />
        </a>
        <p className="mt-1 text-[10px] uppercase tracking-wide text-slate-400">
          Paid link
        </p>
      </div>
    </div>
  );
}
