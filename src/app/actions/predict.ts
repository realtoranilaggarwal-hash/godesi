"use server";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { uniqueViolation } from "@/lib/actions";
import {
  predictionsState,
  type MarketState,
} from "@/lib/predictions";

export type PickResult =
  | { ok: true; markets: MarketState[] }
  | { ok: false; error: string };

export async function pickPredictionAction(
  marketId: string,
  choice: number,
): Promise<PickResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Sign in to play" };

  const market = await db.predictionMarket.findUnique({
    where: { id: marketId },
  });
  if (!market || market.resolvedAt || choice < 0 || choice >= market.options.length) {
    return { ok: false, error: "That market is closed" };
  }

  try {
    await db.predictionPick.create({
      data: { marketId, userId: user.id, choice },
    });
  } catch (error) {
    if (!uniqueViolation(error)) throw error;
  }

  return { ok: true, markets: await predictionsState(user.id) };
}
