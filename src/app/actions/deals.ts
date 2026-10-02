"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { type ActionState, fieldError } from "@/lib/actions";
import { endOfDay, liveDealWhere, MAX_ACTIVE_DEALS } from "@/lib/deals";

const schema = z.object({
  title: z
    .string()
    .trim()
    .min(5, "Say what the offer is, e.g. 10% off your first order")
    .max(90, "Keep the headline under 90 characters"),
  details: z
    .string()
    .trim()
    .max(600, "Keep the details under 600 characters")
    .optional(),
  code: z
    .string()
    .trim()
    .max(24, "Keep the code under 24 characters")
    .regex(/^[A-Za-z0-9-]*$/, "Use letters, numbers and dashes in the code")
    .optional(),
  linkUrl: z
    .string()
    .trim()
    .url("Paste a full link starting with https://")
    .optional(),
  expiresAt: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Pick the last day from the calendar")
    .optional(),
});

function refresh(slug: string) {
  revalidatePath("/dashboard/deals");
  revalidatePath("/deals");
  revalidatePath(`/b/${slug}`);
  revalidatePath("/");
}

export async function addDealAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    const business = await db.business.findUnique({
      where: { ownerId: user.id },
    });
    if (!business) return { error: "Create your business profile first." };

    const parsed = schema.safeParse({
      title: formData.get("title"),
      details: formData.get("details") || undefined,
      code: formData.get("code") || undefined,
      linkUrl: formData.get("linkUrl") || undefined,
      expiresAt: formData.get("expiresAt") || undefined,
    });
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    const expiresAt = parsed.data.expiresAt
      ? endOfDay(parsed.data.expiresAt)
      : null;
    if (expiresAt && expiresAt < new Date()) {
      return { error: "The last day is already past — pick a later date." };
    }
    if (parsed.data.linkUrl && !/^https?:\/\//i.test(parsed.data.linkUrl)) {
      return { error: "Paste a full link starting with https://" };
    }

    const live = await db.deal.count({
      where: { businessId: business.id, ...liveDealWhere() },
    });
    if (live >= MAX_ACTIVE_DEALS) {
      return {
        error: `You can run up to ${MAX_ACTIVE_DEALS} deals at once — pause one first.`,
      };
    }

    await db.deal.create({
      data: {
        businessId: business.id,
        title: parsed.data.title,
        details: parsed.data.details || null,
        code: parsed.data.code ? parsed.data.code.toUpperCase() : null,
        linkUrl: parsed.data.linkUrl || null,
        expiresAt,
      },
    });

    refresh(business.slug);
    return {
      success: "Deal posted — it's on your card and on godesi.com/deals.",
    };
  } catch (error) {
    return fieldError(error);
  }
}

async function ownedDeal(id: string) {
  const user = await requireUser();
  const deal = await db.deal.findUnique({
    where: { id },
    include: { business: { select: { ownerId: true, slug: true } } },
  });
  if (!deal) return null;
  if (deal.business.ownerId !== user.id && user.role !== "ADMIN") {
    throw new Error("FORBIDDEN");
  }
  return deal;
}

export async function toggleDealAction(formData: FormData) {
  const deal = await ownedDeal(String(formData.get("id") ?? ""));
  if (!deal) return;
  await db.deal.update({
    where: { id: deal.id },
    data: { active: !deal.active },
  });
  refresh(deal.business.slug);
}

export async function deleteDealAction(formData: FormData) {
  const deal = await ownedDeal(String(formData.get("id") ?? ""));
  if (!deal) return;
  await db.deal.delete({ where: { id: deal.id } });
  refresh(deal.business.slug);
}
