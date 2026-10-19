"use server";

import { randomBytes, randomInt } from "crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser, requireUser } from "@/lib/auth";
import { type ActionState, fieldError } from "@/lib/actions";
import { endOfDay } from "@/lib/deals";
import { awardPoints, spendPoints } from "@/lib/rewardsQueries";
import { spinDay } from "@/lib/spin";
import {
  GIFT_CLAIM_LABELS,
  SCRATCH_DAILY_LIMIT,
  SCRATCH_TOTAL,
  giftSelect,
  liveGiftWhere,
  oddsForRoll,
  scratchCost,
} from "@/lib/scratch";

export type ScratchResult =
  | { error: string }
  | {
      prize: "gift" | "points" | "none";
      points: number;
      code: string | null;
      gift: {
        title: string;
        claim: string;
        business: string;
        slug: string;
        address: string | null;
      } | null;
    };

function startOfNewYorkDay() {
  const day = spinDay();
  const noonUtc = new Date(`${day}T12:00:00Z`);
  return new Date(noonUtc.getTime() - 36 * 3600 * 1000);
}

/** Buys one card with points and rolls the prize here on the server. */
export async function scratchAction(): Promise<ScratchResult> {
  const user = await getCurrentUser();
  if (!user) return { error: "Log in to scratch a card." };
  if (!user.emailVerifiedAt) return { error: "Confirm your email first." };

  const day = spinDay();
  const recent = await db.scratchCard.findMany({
    where: { userId: user.id, createdAt: { gte: startOfNewYorkDay() } },
    select: { createdAt: true },
  });
  const today = recent.filter((card) => spinDay(card.createdAt) === day).length;
  if (today >= SCRATCH_DAILY_LIMIT) {
    return {
      error: `That's ${SCRATCH_DAILY_LIMIT} cards today — come back tomorrow.`,
    };
  }

  const cost = await scratchCost();
  const cardId = randomBytes(12).toString("hex");
  const paid = await spendPoints({
    userId: user.id,
    points: cost,
    note: "Scratch & win card",
    uniqueKey: `${user.id}:SCRATCH:${cardId}`,
  });
  if (!paid) return { error: `You need ${cost} points for a card.` };

  let row: { prize: "gift" | "points" | "none"; points: number } = oddsForRoll(
    randomInt(SCRATCH_TOTAL),
  );
  let gift = null;
  if (row.prize === "gift") {
    const pool = await db.scratchGift.findMany({
      where: liveGiftWhere(),
      select: giftSelect,
    });
    const open = pool.filter((item) => item.wonCount < item.quantity);
    const pick = open.length ? open[randomInt(open.length)] : null;
    if (pick) {
      const claimed = await db.scratchGift.updateMany({
        where: { id: pick.id, wonCount: { lt: pick.quantity } },
        data: { wonCount: { increment: 1 } },
      });
      if (claimed.count) gift = pick;
    }
    if (!gift) row = { prize: "points", points: 10 };
  }

  const code = gift ? randomBytes(4).toString("hex").toUpperCase() : null;
  await db.scratchCard.create({
    data: {
      userId: user.id,
      cost,
      prize: row.prize,
      points: row.points,
      giftId: gift?.id ?? null,
      code,
    },
  });
  if (row.points) {
    await awardPoints({
      userId: user.id,
      reason: "SCRATCH_WIN",
      points: row.points,
      key: `${user.id}:SCRATCH_WIN:${cardId}`,
      note: `Scratch card: ${row.points} points`,
      skipReferralBonus: true,
    });
  }
  revalidatePath("/scratch");

  return {
    prize: row.prize,
    points: row.points,
    code,
    gift: gift
      ? {
          title: gift.title,
          claim: GIFT_CLAIM_LABELS[gift.claimHow],
          business: gift.business.name,
          slug: gift.business.slug,
          address:
            [gift.business.address, gift.business.city]
              .filter(Boolean)
              .join(", ") || null,
        }
      : null,
  };
}

const giftSchema = z.object({
  title: z
    .string()
    .trim()
    .min(4, "Say what the gift is, e.g. Free mango lassi")
    .max(80, "Keep the gift under 80 characters"),
  details: z.string().trim().max(400).optional(),
  claimHow: z.enum(["VISIT_STORE", "VISIT_WEBSITE", "POST_REVIEW"]),
  quantity: z.coerce
    .number()
    .int()
    .min(1, "Offer at least 1 gift")
    .max(500, "Up to 500 gifts at a time"),
  expiresAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

export async function addGiftAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    const business = await db.business.findUnique({
      where: { ownerId: user.id },
      select: { id: true },
    });
    if (!business) return { error: "Create your business card first." };
    const parsed = giftSchema.safeParse({
      title: formData.get("title"),
      details: formData.get("details") || undefined,
      claimHow: formData.get("claimHow"),
      quantity: formData.get("quantity"),
      expiresAt: formData.get("expiresAt") || undefined,
    });
    if (!parsed.success) return { error: parsed.error.issues[0].message };
    const expiresAt = parsed.data.expiresAt
      ? endOfDay(parsed.data.expiresAt)
      : null;
    if (expiresAt && expiresAt < new Date()) {
      return { error: "The last day is already past — pick a later date." };
    }
    await db.scratchGift.create({
      data: {
        businessId: business.id,
        title: parsed.data.title,
        details: parsed.data.details || null,
        claimHow: parsed.data.claimHow,
        quantity: parsed.data.quantity,
        expiresAt,
      },
    });
    revalidatePath("/dashboard/gifts");
    revalidatePath("/scratch");
    return {
      success:
        "Your gift is in the scratch & win prize pool. Members can win it from now.",
    };
  } catch (error) {
    return fieldError(error);
  }
}

async function ownedGift(id: string) {
  const user = await requireUser();
  const gift = await db.scratchGift.findUnique({
    where: { id },
    include: { business: { select: { ownerId: true } } },
  });
  if (!gift || (gift.business.ownerId !== user.id && user.role !== "ADMIN")) {
    return null;
  }
  return gift;
}

export async function toggleGiftAction(formData: FormData) {
  const gift = await ownedGift(String(formData.get("id") ?? ""));
  if (!gift) return;
  await db.scratchGift.update({
    where: { id: gift.id },
    data: { active: !gift.active },
  });
  revalidatePath("/dashboard/gifts");
}

/** The vendor types a winner's code to mark the gift collected. */
export async function redeemGiftCodeAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    const code = String(formData.get("code") ?? "")
      .trim()
      .toUpperCase();
    if (!code) return { error: "Type the winner's code." };
    const card = await db.scratchCard.findUnique({
      where: { code },
      include: {
        user: { select: { name: true } },
        gift: {
          select: { title: true, business: { select: { ownerId: true } } },
        },
      },
    });
    if (!card?.gift || card.gift.business.ownerId !== user.id) {
      return { error: "That code isn't for one of your gifts." };
    }
    if (card.redeemedAt) {
      return {
        error: `Already collected on ${card.redeemedAt.toLocaleDateString("en-US")}.`,
      };
    }
    await db.scratchCard.update({
      where: { id: card.id },
      data: { redeemedAt: new Date() },
    });
    revalidatePath("/dashboard/gifts");
    return {
      success: `✅ ${card.gift.title} — collected by ${card.user.name}.`,
    };
  } catch (error) {
    return fieldError(error);
  }
}
