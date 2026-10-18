"use server";

import { randomInt } from "crypto";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { uniqueViolation } from "@/lib/actions";
import { awardPoints } from "@/lib/rewardsQueries";
import { dealDetails, dealSelect, liveDealWhere } from "@/lib/deals";
import { offerInterest } from "@/lib/offerInterests";
import {
  NO_DEAL_FALLBACK,
  SPIN_SLICES,
  SPIN_TOTAL_WEIGHT,
  offerSpinDay,
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

/** `bonus` counts spins earned by picked interests that are still unused. */
export type SpinStatus =
  | { state: "signed-out" }
  | { state: "unverified" }
  | { state: "ready"; daily: boolean; bonus: number }
  | { state: "spun"; result: SpinResult; bonus: number };

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

type Member = { id: string; offerInterests: string[] };

/** Picked interests whose one-off bonus spin hasn't been used yet. */
async function unusedBonusInterests(member: Member) {
  if (!member.offerInterests.length) return [];
  const used = await db.dailySpin.findMany({
    where: {
      userId: member.id,
      day: { in: member.offerInterests.map(offerSpinDay) },
    },
    select: { day: true },
  });
  const usedDays = new Set(used.map((spin) => spin.day));
  return member.offerInterests.filter((id) => !usedDays.has(offerSpinDay(id)));
}

export async function spinStatusAction(): Promise<SpinStatus> {
  const user = await getCurrentUser();
  if (!user) return { state: "signed-out" };
  if (!user.emailVerifiedAt) return { state: "unverified" };
  const [spin, bonus] = await Promise.all([
    db.dailySpin.findUnique({
      where: { userId_day: { userId: user.id, day: spinDay() } },
    }),
    unusedBonusInterests(user),
  ]);
  if (!spin) return { state: "ready", daily: true, bonus: bonus.length };
  if (bonus.length)
    return { state: "ready", daily: false, bonus: bonus.length };
  return { state: "spun", result: await resultFor(spin), bonus: 0 };
}

/**
 * The outcome is rolled here, never in the browser. Today's free spin is used
 * first, then one bonus spin per picked interest; the (member, day) unique
 * index makes a replayed or double-clicked request return the first spin.
 */
export async function spinAction(): Promise<SpinStatus> {
  const user = await getCurrentUser();
  if (!user) return { state: "signed-out" };
  if (!user.emailVerifiedAt) return { state: "unverified" };

  const today = spinDay();
  const [todaySpin, unused] = await Promise.all([
    db.dailySpin.findUnique({
      where: { userId_day: { userId: user.id, day: today } },
    }),
    unusedBonusInterests(user),
  ]);
  const bonusId = todaySpin ? unused[0] : undefined;
  if (todaySpin && !bonusId)
    return { state: "spun", result: await resultFor(todaySpin), bonus: 0 };

  const day = bonusId ? offerSpinDay(bonusId) : today;
  const bonusLeft = bonusId ? unused.length - 1 : unused.length;
  const where = { userId_day: { userId: user.id, day } };

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

  const interest = bonusId ? offerInterest(bonusId) : null;
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
        note: interest
          ? `Bonus spin for picking "${interest.label}": ${slice.label}`
          : `Daily spin: ${slice.label}`,
        skipReferralBonus: true,
      });
    }
    return {
      state: "spun",
      result: await resultFor(spin),
      bonus: bonusLeft,
    };
  } catch (error) {
    if (!uniqueViolation(error)) throw error;
    const first = await db.dailySpin.findUnique({ where });
    if (!first) throw error;
    return { state: "spun", result: await resultFor(first), bonus: bonusLeft };
  }
}
