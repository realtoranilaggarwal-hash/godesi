"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { can, requireUser } from "@/lib/auth";
import { type ActionState, fieldError } from "@/lib/actions";
import { requestCurrency } from "@/lib/currency";
import { siteUrl, toMinor } from "@/lib/format";
import { getStripe, stripeEnabled } from "@/lib/stripe";
import { findBlockedTerm } from "@/lib/moderation";
import {
  RESOURCE_PLACEMENTS,
  type ResourcePlacement,
  duplicateLinkIds,
  normalizeLinkUrl,
  resourcePackOrThrow,
  resourcePrice,
} from "@/lib/resources";

function knownPlacement(value?: string): ResourcePlacement | null {
  const match = RESOURCE_PLACEMENTS.find((option) => option.value === value);
  return match ? match.value : null;
}

const linkSchema = z.object({
  title: z.string().trim().min(4, "Give the link a clear title").max(90),
  url: z
    .string()
    .trim()
    .url("Enter a full URL starting with https://")
    .refine(
      (value) => value.startsWith("http://") || value.startsWith("https://"),
      "Only http:// and https:// links are allowed",
    ),
  categorySlug: z.string().trim().optional(),
  description: z.string().trim().max(140).optional(),
  tags: z.string().trim().max(200).optional(),
  kind: z.enum(["AFFILIATE", "SPONSORED", "EDITORIAL"]),
  placement: z.string().trim().optional(),
});

/** Comma separated tags become a clean, lower-case list for the tag cloud. */
function readTags(value?: string) {
  const seen = new Set<string>();
  for (const raw of (value ?? "").split(",")) {
    const tag = raw.trim().replace(/^#/, "").slice(0, 30).toLowerCase();
    if (tag) seen.add(tag);
    if (seen.size >= 8) break;
  }
  return Array.from(seen);
}

function parseLink(formData: FormData) {
  return linkSchema.safeParse({
    title: formData.get("title"),
    url: formData.get("url"),
    categorySlug: formData.get("categorySlug") || undefined,
    description: formData.get("description") || undefined,
    tags: formData.get("tags") || undefined,
    kind: formData.get("kind") ?? "SPONSORED",
    placement: formData.get("placement") || undefined,
  });
}

/** The id of a link already pointing at this address, ignoring one being edited. */
async function existingLinkId(url: string, exceptId?: string) {
  const wanted = normalizeLinkUrl(url);
  const rows = await db.resourceLink.findMany({
    select: { id: true, url: true },
  });
  return (
    rows.find(
      (row) => row.id !== exceptId && normalizeLinkUrl(row.url) === wanted,
    )?.id ?? null
  );
}

/**
 * Buys a views pack for a submitted link. The link stays pending until payment
 * clears and an admin approves it, so nothing unreviewed can appear in a box.
 */
export async function startLinkCheckoutAction(formData: FormData) {
  const user = await requireUser();
  const parsed = parseLink(formData);
  if (!parsed.success) redirect("/resources/new?error=invalid");

  const blocked = findBlockedTerm(`${parsed.data.title} ${parsed.data.url}`);
  if (blocked) redirect("/resources/new?error=blocked");

  if (await existingLinkId(parsed.data.url)) {
    redirect("/resources/new?error=duplicate");
  }

  const impressions = resourcePackOrThrow(
    String(formData.get("impressions") ?? ""),
  );
  const currency = requestCurrency();
  const amountMinor = toMinor(resourcePrice(currency, impressions));

  if (!stripeEnabled()) redirect("/resources/new?error=stripe_unavailable");

  const link = await db.resourceLink.create({
    data: {
      title: parsed.data.title,
      url: parsed.data.url,
      categorySlug: parsed.data.categorySlug || null,
      description: parsed.data.description ?? null,
      tags: readTags(parsed.data.tags),
      kind: parsed.data.kind,
      status: "PENDING",
      active: false,
      submittedById: user.id,
    },
  });

  const order = await db.resourceOrder.create({
    data: {
      linkId: link.id,
      userId: user.id,
      impressions,
      amountMinor,
      currency,
    },
  });

  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    customer_email: user.email,
    client_reference_id: user.id,
    metadata: {
      kind: "resource",
      resourceOrderId: order.id,
      linkId: link.id,
      userId: user.id,
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: currency.toLowerCase(),
          unit_amount: amountMinor,
          product_data: {
            name: `Godesi recommended link — ${impressions.toLocaleString()} views`,
            description: parsed.data.title,
          },
        },
      },
    ],
    success_url: `${siteUrl()}/resources?paid={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl()}/resources/new?error=cancelled`,
  });

  if (!session.url) redirect("/resources/new?error=stripe_session");
  redirect(session.url);
}

/** Admin: add an editorial or pre-agreed link straight into the rotation. */
export async function saveResourceLinkAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    if (!can(user, "resources")) throw new Error("FORBIDDEN");

    const parsed = parseLink(formData);
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    const capValue = String(formData.get("impressionCap") ?? "").trim();
    const impressionCap = capValue ? Number(capValue) : null;
    if (
      impressionCap !== null &&
      (!Number.isInteger(impressionCap) || impressionCap < 1)
    ) {
      return { error: "Views must be a whole number, or blank for unlimited." };
    }

    const id = String(formData.get("id") ?? "");
    if (await existingLinkId(parsed.data.url, id || undefined)) {
      return { error: "That web address is already in the list." };
    }

    const data = {
      title: parsed.data.title,
      url: parsed.data.url,
      categorySlug: parsed.data.categorySlug || null,
      description: parsed.data.description ?? null,
      tags: readTags(parsed.data.tags),
      kind: parsed.data.kind,
      placement: knownPlacement(parsed.data.placement),
      impressionCap,
      status: "APPROVED" as const,
      active: true,
    };

    if (id) await db.resourceLink.update({ where: { id }, data });
    else await db.resourceLink.create({ data });

    revalidatePath("/resources");
    revalidatePath("/admin");
    return { success: id ? "Link updated." : "Link added." };
  } catch (error) {
    return fieldError(error);
  }
}

export async function toggleResourceLinkAction(formData: FormData) {
  const user = await requireUser();
  if (!can(user, "resources")) throw new Error("FORBIDDEN");

  const id = String(formData.get("id") ?? "");
  const link = await db.resourceLink.findUnique({ where: { id } });
  if (!link) return;

  await db.resourceLink.update({
    where: { id },
    data: {
      active: !link.active,
      status: link.active ? link.status : "APPROVED",
    },
  });

  revalidatePath("/resources");
  revalidatePath("/admin");
}

/** Admin: approve or reject a paid submission before it enters the rotation. */
export async function reviewResourceLinkAction(formData: FormData) {
  const user = await requireUser();
  if (!can(user, "resources")) throw new Error("FORBIDDEN");

  const id = String(formData.get("id") ?? "");
  const approve = formData.get("decision") === "approve";

  await db.resourceLink.updateMany({
    where: { id },
    data: approve
      ? { status: "APPROVED", active: true }
      : { status: "REJECTED", active: false },
  });

  revalidatePath("/resources");
  revalidatePath("/admin");
}

/**
 * Admin: drop every extra copy of a link that is already in the list, keeping
 * the copy an advertiser paid for or the one carrying the traffic.
 */
export async function removeDuplicateResourceLinksAction() {
  const user = await requireUser();
  if (!can(user, "resources")) throw new Error("FORBIDDEN");

  const links = await db.resourceLink.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      url: true,
      impressions: true,
      clicks: true,
      _count: { select: { orders: true } },
    },
  });

  const extras = duplicateLinkIds(
    links.map((link) => ({
      id: link.id,
      url: link.url,
      impressions: link.impressions,
      clicks: link.clicks,
      paid: link._count.orders > 0,
    })),
  );
  if (extras.length) {
    await db.resourceLink.deleteMany({ where: { id: { in: extras } } });
  }

  revalidatePath("/resources");
  revalidatePath("/admin/resources");
  revalidatePath("/admin");
}

export async function deleteResourceLinkAction(formData: FormData) {
  const user = await requireUser();
  if (!can(user, "resources")) throw new Error("FORBIDDEN");

  await db.resourceLink.deleteMany({
    where: { id: String(formData.get("id") ?? "") },
  });

  revalidatePath("/resources");
  revalidatePath("/admin");
}
