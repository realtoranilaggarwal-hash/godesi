"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { type ActionState, fieldError } from "@/lib/actions";
import { requestCurrency } from "@/lib/currency";
import { siteUrl, toMinor } from "@/lib/format";
import { getStripe, stripeEnabled } from "@/lib/stripe";
import { findBlockedTerm } from "@/lib/moderation";
import {
  RESOURCE_PLACEMENTS,
  type ResourcePlacement,
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
  tag: z.string().trim().max(30).optional(),
  kind: z.enum(["AFFILIATE", "SPONSORED", "EDITORIAL"]),
  placement: z.string().trim().optional(),
});

function parseLink(formData: FormData) {
  return linkSchema.safeParse({
    title: formData.get("title"),
    url: formData.get("url"),
    categorySlug: formData.get("categorySlug") || undefined,
    tag: formData.get("tag") || undefined,
    kind: formData.get("kind") ?? "SPONSORED",
    placement: formData.get("placement") || undefined,
  });
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

  const impressions = resourcePackOrThrow(String(formData.get("impressions") ?? ""));
  const currency = requestCurrency();
  const amountMinor = toMinor(resourcePrice(currency, impressions));

  if (!stripeEnabled()) redirect("/resources/new?error=stripe_unavailable");

  const link = await db.resourceLink.create({
    data: {
      title: parsed.data.title,
      url: parsed.data.url,
      categorySlug: parsed.data.categorySlug || null,
      tag: parsed.data.tag ?? null,
      kind: parsed.data.kind,
      status: "PENDING",
      active: false,
      submittedById: user.id,
    },
  });

  const order = await db.resourceOrder.create({
    data: { linkId: link.id, userId: user.id, impressions, amountMinor, currency },
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
    if (user.role !== "ADMIN") throw new Error("FORBIDDEN");

    const parsed = parseLink(formData);
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    const capValue = String(formData.get("impressionCap") ?? "").trim();
    const impressionCap = capValue ? Number(capValue) : null;
    if (impressionCap !== null && (!Number.isInteger(impressionCap) || impressionCap < 1)) {
      return { error: "Views must be a whole number, or blank for unlimited." };
    }

    const id = String(formData.get("id") ?? "");
    const data = {
      title: parsed.data.title,
      url: parsed.data.url,
      categorySlug: parsed.data.categorySlug || null,
      tag: parsed.data.tag ?? null,
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
  if (user.role !== "ADMIN") throw new Error("FORBIDDEN");

  const id = String(formData.get("id") ?? "");
  const link = await db.resourceLink.findUnique({ where: { id } });
  if (!link) return;

  await db.resourceLink.update({
    where: { id },
    data: { active: !link.active, status: link.active ? link.status : "APPROVED" },
  });

  revalidatePath("/resources");
  revalidatePath("/admin");
}

/** Admin: approve or reject a paid submission before it enters the rotation. */
export async function reviewResourceLinkAction(formData: FormData) {
  const user = await requireUser();
  if (user.role !== "ADMIN") throw new Error("FORBIDDEN");

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

export async function deleteResourceLinkAction(formData: FormData) {
  const user = await requireUser();
  if (user.role !== "ADMIN") throw new Error("FORBIDDEN");

  await db.resourceLink.deleteMany({ where: { id: String(formData.get("id") ?? "") } });

  revalidatePath("/resources");
  revalidatePath("/admin");
}
