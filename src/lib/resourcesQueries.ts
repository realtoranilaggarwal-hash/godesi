/**
 * The database half of resources.ts — the labels and helpers next door are safe for client components, but a module that touches Prisma cannot be bundled for the browser.
 */

import type { ResourceKind } from "@prisma/client";
import { db } from "@/lib/db";
import {
  RESOURCE_BOX_SIZE,
  ResourcePlacement,
  TagCount,
} from "@/lib/resources";

export async function tagCloud(limit = 40): Promise<TagCount[]> {
  const [links, events] = await Promise.all([
    db.resourceLink.findMany({
      where: { status: "APPROVED", active: true },
      select: { tags: true },
      take: 500,
    }),
    db.event.findMany({
      where: { status: "APPROVED" },
      select: { tags: true },
      take: 500,
    }),
  ]);

  const counts = new Map<string, number>();
  for (const row of [...links, ...events]) {
    for (const tag of row.tags) {
      const key = tag.trim().toLowerCase();
      if (key) counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }

  return Array.from(counts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
    .slice(0, limit);
}

type LinkRow = {
  id: string;
  title: string;
  description: string | null;
  tags: string[];
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

export async function recommendedLinks(
  categorySlug?: string | string[] | null,
  take = RESOURCE_BOX_SIZE,
  placement: ResourcePlacement | null = null,
) {
  const slugs = (
    Array.isArray(categorySlug)
      ? categorySlug
      : categorySlug
        ? [categorySlug]
        : []
  ).filter(Boolean);

  const eligible = await db.resourceLink.findMany({
    where: {
      status: "APPROVED",
      active: true,
      placement,
      ...(slugs.length
        ? { OR: [{ categorySlug: { in: slugs } }, { categorySlug: null }] }
        : placement
          ? {}
          : { categorySlug: null }),
    },
    orderBy: { createdAt: "desc" },
    take: 40,
    select: {
      id: true,
      title: true,
      description: true,
      tags: true,
      kind: true,
      categorySlug: true,
      impressions: true,
      impressionCap: true,
    },
  });

  const withQuota = eligible.filter(
    (link) =>
      link.impressionCap === null || link.impressions < link.impressionCap,
  );
  const targeted = withQuota.filter(
    (link) => link.categorySlug !== null && slugs.includes(link.categorySlug),
  );
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
