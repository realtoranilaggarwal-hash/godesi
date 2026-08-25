import type { Prospect } from "@prisma/client";
import { db } from "@/lib/db";
import { CATEGORY_TREE, subcategorySlug } from "@/lib/categories";
import { slugify } from "@/lib/slug";

/**
 * Turns a call-list row into an unclaimed starter card.
 *
 * Only the facts travel: name, trade, town, street, website, and the phone and
 * email — and those two are stored but never rendered, because a card with no
 * owner shows no contact details. That is the point of the exercise: the girl
 * rings the business, the owner claims the card and pays to have their number
 * and email shown on it. Nothing written or photographed by anybody else is
 * copied, so the page carries facts and a claim button until the owner fills it
 * in, and stays out of Google until they do.
 */

export type PublishOutcome =
  | { ok: true; slug: string; created: boolean }
  | { ok: false; reason: "no-phone" | "no-beat" | "duplicate" };

type PublishableProspect = Pick<
  Prospect,
  | "id"
  | "name"
  | "trade"
  | "categorySlug"
  | "subcategorySlug"
  | "city"
  | "state"
  | "address"
  | "phone"
  | "email"
  | "websiteUrl"
  | "source"
  | "sourceUrl"
  | "listedSlug"
>;

function knownBeat(slug: string | null) {
  return CATEGORY_TREE.some((entry) => entry.slug === slug) ? slug : null;
}

/** Keeps the trade as a subcategory only when it is one we actually publish. */
function beatChild(parentSlug: string, prospect: PublishableProspect) {
  if (prospect.subcategorySlug) return prospect.subcategorySlug;

  const parent = CATEGORY_TREE.find((entry) => entry.slug === parentSlug);
  const match = parent?.children.find(
    (child) => child.toLowerCase() === prospect.trade.trim().toLowerCase(),
  );
  return match ? subcategorySlug(parentSlug, match) : null;
}

async function freeSlug(name: string, city: string | null) {
  const base = slugify([name, city].filter(Boolean).join(" ")) || "business";
  for (let attempt = 0; attempt < 25; attempt += 1) {
    const slug = attempt ? `${base}-${attempt + 1}` : base;
    // eslint-disable-next-line no-await-in-loop
    const taken = await db.business.findUnique({ where: { slug }, select: { id: true } });
    if (!taken) return slug;
  }
  return `${base}-${Date.now().toString(36)}`;
}

export async function publishProspectCard(
  prospect: PublishableProspect,
): Promise<PublishOutcome> {
  if (!prospect.phone) return { ok: false, reason: "no-phone" };

  const beat = knownBeat(prospect.categorySlug);
  if (!beat) return { ok: false, reason: "no-beat" };

  /** A re-run must find its own rows again rather than card them twice. */
  const fromSameSource = await db.business.findUnique({
    where: { sourceUrl: prospect.sourceUrl },
    select: { slug: true },
  });
  if (fromSameSource) {
    await db.prospect.update({
      where: { id: prospect.id },
      data: { listedSlug: fromSameSource.slug },
    });
    return { ok: true, slug: fromSameSource.slug, created: false };
  }

  const city = prospect.city?.trim() || null;
  const sameName = await db.business.findFirst({
    where: {
      name: prospect.name,
      ...(city ? { city } : {}),
    },
    select: { slug: true },
  });
  if (sameName) {
    await db.prospect.update({
      where: { id: prospect.id },
      data: { listedSlug: sameName.slug },
    });
    return { ok: false, reason: "duplicate" };
  }

  const slug = await freeSlug(prospect.name, city);

  await db.business.create({
    data: {
      slug,
      name: prospect.name,
      category: beat,
      categorySlug: beat,
      subcategorySlug: beatChild(beat, prospect),
      city: city ?? "USA",
      state: prospect.state,
      country: "USA",
      address: prospect.address,
      websiteUrl: prospect.websiteUrl,
      // Held for the owner to reveal on a paid plan; an unclaimed card shows neither.
      phone: prospect.phone,
      publicEmail: prospect.email,
      source: prospect.source,
      sourceUrl: prospect.sourceUrl,
      status: "APPROVED",
    },
  });

  await db.prospect.update({
    where: { id: prospect.id },
    data: { listedSlug: slug },
  });

  return { ok: true, slug, created: true };
}
