"use server";

import { randomInt } from "crypto";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { uniqueViolation } from "@/lib/actions";
import { awardPoints } from "@/lib/rewardsQueries";
import { dealDetails, dealSelect, liveDealWhere } from "@/lib/deals";
import {
  NO_DEAL_FALLBACK,
  SPIN_SLICES,
  SPIN_TOTAL_WEIGHT,
  sliceForRoll,
  sliceIndex,
  spinDay,
} from "@/lib/spin";
import type { DealCardProps } from "@/components/DealCard";

export type SpinResult = {
  slice: number;
  label: string;
  points: number;
  deal: DealCardProps | null;
};

export type SpinStatus =
  | { state: "signed-out" }
  | { state: "unverified" }
  | { state: "ready" }
  | { state: "spun"; result: SpinResult };

async function resultFor(spin: {
  prize: string;
  points: number;
  dealId: string | null;
}) {
  const index = sliceIndex(spin.prize);
  const deal = spin.dealId
    ? await db.deal.findUnique({
        where: { id: spin.dealId },
        select: dealSelect,
      })
    : null;
  return {
    slice: index,
    label: SPIN_SLICES[index].label,
    points: spin.points,
    deal: deal
      ? {
          title: deal.title,
          details: dealDetails(deal),
          code: deal.code,
          linkUrl: deal.linkUrl,
          expiresAt: deal.expiresAt,
          business: {
            slug: deal.business.slug,
            name: deal.business.name,
            city: deal.business.city,
            logoUrl: deal.business.logoUrl,
            icon: deal.business.categoryRef?.icon,
            line:
              deal.business.subcategoryRef?.name ??
              deal.business.categoryRef?.name,
          },
        }
      : null,
  } satisfies SpinResult;
}

export async function spinStatusAction(): Promise<SpinStatus> {
  const user = await getCurrentUser();
  if (!user) return { state: "signed-out" };
  if (!user.emailVerifiedAt) return { state: "unverified" };
  const spin = await db.dailySpin.findUnique({
    where: { userId_day: { userId: user.id, day: spinDay() } },
  });
  return spin
    ? { state: "spun", result: await resultFor(spin) }
    : { state: "ready" };
}

/**
 * The outcome is rolled here, never in the browser, and the (member, day)
 * unique index makes a replayed or double-clicked request return the first spin.
 */
export async function spinAction(): Promise<SpinStatus> {
  const user = await getCurrentUser();
  if (!user) return { state: "signed-out" };
  if (!user.emailVerifiedAt) return { state: "unverified" };

  const day = spinDay();
  const where = { userId_day: { userId: user.id, day } };
  const existing = await db.dailySpin.findUnique({ where });
  if (existing) return { state: "spun", result: await resultFor(existing) };

  let slice = sliceForRoll(randomInt(SPIN_TOTAL_WEIGHT));
  let dealId: string | null = null;
  if (slice.key === "deal") {
    const live = await db.deal.findMany({
      where: { ...liveDealWhere(), business: { status: "APPROVED" } },
      select: { id: true },
    });
    if (live.length) dealId = live[randomInt(live.length)].id;
    else slice = SPIN_SLICES[sliceIndex(NO_DEAL_FALLBACK)];
  }

  try {
    const spin = await db.dailySpin.create({
      data: {
        userId: user.id,
        day,
        prize: slice.key,
        points: slice.points,
        dealId,
      },
    });
    if (spin.points > 0) {
      await awardPoints({
        userId: user.id,
        reason: "DAILY_SPIN",
        points: spin.points,
        key: day,
        note: `Daily spin: ${slice.label}`,
        skipReferralBonus: true,
      });
    }
    return { state: "spun", result: await resultFor(spin) };
  } catch (error) {
    if (!uniqueViolation(error)) throw error;
    const first = await db.dailySpin.findUnique({ where });
    if (!first) throw error;
    return { state: "spun", result: await resultFor(first) };
  }
}
