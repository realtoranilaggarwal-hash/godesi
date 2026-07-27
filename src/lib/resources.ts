import type { ResourceKind } from "@prisma/client";
import { db } from "@/lib/db";
import type { Currency } from "@/lib/currency";
import { formatMoney } from "@/lib/format";

/** Links are sold per 1,000 views — the simplest unit advertisers understand. */
export const RESOURCE_PACKS = [1_000, 5_000, 10_000] as const;
export type ResourcePack = (typeof RESOURCE_PACKS)[number];

export const RESOURCE_CPM: Record<Currency, number> = { USD: 10, INR: 799 };

export const RESOURCE_KIND_LABELS: Record<ResourceKind, string> = {
  AFFILIATE: "Affiliate",
  SPONSORED: "Sponsored",
  EDITORIAL: "Editorial",
};

/** How many links a "Recommended links" box shows. */
export const RESOURCE_BOX_SIZE = 4;

export function resourcePackOrThrow(value: string): ResourcePack {
  const impressions = Number(value);
  const match = RESOURCE_PACKS.find((pack) => pack === impressions);
  if (!match) throw new Error("Unknown views pack");
  return match;
}

export function resourcePrice(currency: Currency, impressions: number) {
  const gross = (RESOURCE_CPM[currency] * impressions) / 1000;
  return currency === "INR" ? Math.round(gross) : Math.round(gross * 100) / 100;
}

export function formatResourcePrice(currency: Currency, impressions: number) {
  return formatMoney(resourcePrice(currency, impressions), currency);
}

type LinkRow = {
  id: string;
  title: string;
  tag: string | null;
  kind: ResourceKind;
  impressions: number;
  impressionCap: number | null;
};

/** Weighted towards links with the most views still owed, as banners are. */
function rotate(links: LinkRow[], take: number) {
  const pool = links.map((link) => ({
    link,
    weight:
      link.impressionCap === null
        ? 1
        : Math.max(1, link.impressionCap - link.impressions),
  }));

  const picked: LinkRow[] = [];
  while (picked.length < take && pool.length) {
    const total = pool.reduce((sum, entry) => sum + entry.weight, 0);
    let target = Math.random() * total;
    let index = pool.length - 1;
    for (let i = 0; i < pool.length; i += 1) {
      target -= pool[i].weight;
      if (target <= 0) {
        index = i;
        break;
      }
    }
    picked.push(pool[index].link);
    pool.splice(index, 1);
  }
  return picked;
}

/**
 * Links for a "Recommended links" box. Links tagged with the page's category come
 * first; untargeted links fill the rest so a box is never nearly empty.
 */
export async function recommendedLinks(
  categorySlug?: string | null,
  take = RESOURCE_BOX_SIZE,
) {
  const eligible = await db.resourceLink.findMany({
    where: {
      status: "APPROVED",
      active: true,
      ...(categorySlug
        ? { OR: [{ categorySlug }, { categorySlug: null }] }
        : { categorySlug: null }),
    },
    orderBy: { createdAt: "desc" },
    take: 40,
    select: {
      id: true,
      title: true,
      tag: true,
      kind: true,
      categorySlug: true,
      impressions: true,
      impressionCap: true,
    },
  });

  const withQuota = eligible.filter(
    (link) => link.impressionCap === null || link.impressions < link.impressionCap,
  );
  const targeted = withQuota.filter((link) => link.categorySlug === categorySlug);
  const general = withQuota.filter((link) => link.categorySlug === null);

  const picked = rotate(targeted, take);
  if (picked.length < take) {
    picked.push(...rotate(general, take - picked.length));
  }
  return picked;
}

/** Counts a view and retires the link once its purchased views are delivered. */
export async function countLinkImpression(linkId: string) {
  const counted = await db.$executeRaw`
    UPDATE "ResourceLink"
    SET impressions = impressions + 1
    WHERE id = ${linkId}
      AND active = true
      AND status = 'APPROVED'
      AND ("impressionCap" IS NULL OR impressions < "impressionCap")
  `;

  if (!counted) return false;

  await db.$executeRaw`
    UPDATE "ResourceLink"
    SET active = false
    WHERE id = ${linkId}
      AND "impressionCap" IS NOT NULL
      AND impressions >= "impressionCap"
  `;

  return true;
}
