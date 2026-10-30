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
  // Picks are only valid on the market's own UTC day — after midnight the
  // close is knowable, so an unresolved past market must stay closed.
  const todayStart = new Date(
    Math.floor(Date.now() / (24 * 60 * 60 * 1000)) * (24 * 60 * 60 * 1000),
  );
  if (
    !market ||
    market.resolvedAt ||
    market.day < todayStart ||
    choice < 0 ||
    choice >= market.options.length
  ) {
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
