import { db } from "@/lib/db";
import { uniqueViolation } from "@/lib/actions";
import { awardPoints } from "@/lib/rewardsQueries";

/**
 * Daily up/down calls on real markets. Prices come from Yahoo Finance's
 * public chart endpoint — no key, no cost.
 */
const MARKETS = [
  { slug: "gold", name: "Gold", emoji: "🥇", symbol: "GC=F" },
  { slug: "sp500", name: "S&P 500", emoji: "📊", symbol: "^GSPC" },
  { slug: "btc", name: "Bitcoin", emoji: "₿", symbol: "BTC-USD" },
] as const;

const OPTIONS = ["📈 Up", "📉 Down"];
const WIN_POINTS = 10;
const LOSS_POINTS = 5;

const DAY_MS = 24 * 60 * 60 * 1000;

function utcDayStart(now = new Date()) {
  return new Date(Math.floor(now.getTime() / DAY_MS) * DAY_MS);
}

/** Daily closes from Yahoo's public chart API, bucketed by UTC date. */
async function closesFor(symbol: string, from: Date, to: Date) {
  const p1 = Math.floor(from.getTime() / 1000);
  const p2 = Math.floor(to.getTime() / 1000);
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?period1=${p1}&period2=${p2}&interval=1d`;
  const res = await fetch(url, {
    cache: "no-store",
    headers: { "user-agent": "Mozilla/5.0 (X11; Linux x86_64)" },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) return [];
  const data = (await res.json())?.chart?.result?.[0];
  const times: number[] = data?.timestamp ?? [];
  const closes: (number | null)[] = data?.indicators?.quote?.[0]?.close ?? [];
  return times
    .map((t, index) => ({
      date: new Date(t * 1000).toISOString().slice(0, 10),
      close: closes[index],
    }))
    .filter((row): row is { date: string; close: number } =>
      Number.isFinite(row.close),
    );
}

/** Today's three markets, created lazily on the first read of the day. */
export async function todaysMarkets() {
  const day = utcDayStart();
  for (const market of MARKETS) {
    try {
      await db.predictionMarket.create({
        data: {
          slug: market.slug,
          day,
          question: `${market.emoji} ${market.name} — higher or lower at today's close?`,
          options: [...OPTIONS],
        },
      });
    } catch (error) {
      if (!uniqueViolation(error)) throw error;
    }
  }
  return db.predictionMarket.findMany({
    where: { day },
    orderBy: { slug: "asc" },
  });
}

export type MarketState = {
  id: string;
  question: string;
  tallies: number[];
  total: number;
  myChoice: number | null;
};

export async function predictionsState(userId: string | null) {
  const markets = await todaysMarkets();
  const out: MarketState[] = [];
  for (const market of markets) {
    const votes = await db.predictionPick.groupBy({
      by: ["choice"],
      where: { marketId: market.id },
      _count: true,
    });
    const mine = userId
      ? await db.predictionPick.findUnique({
          where: { marketId_userId: { marketId: market.id, userId } },
        })
      : null;
    out.push({
      id: market.id,
      question: market.question,
      tallies: OPTIONS.map(
        (_, index) => votes.find((row) => row.choice === index)?._count ?? 0,
      ),
      total: votes.reduce((sum, row) => sum + row._count, 0),
      myChoice: mine?.choice ?? null,
    });
  }
  return out;
}

async function pointsBalance(userId: string) {
  const sum = await db.pointsEntry.aggregate({
    where: { userId },
    _sum: { points: true },
  });
  return sum._sum.points ?? 0;
}

/**
 * Settles every open market whose day has passed. Called by the daily cron
 * after the US close; also safe to call manually. A day with no trading
 * (weekend, holiday) resolves with no outcome and nobody loses points.
 */
export async function settlePredictions() {
  const today = utcDayStart();
  const open = await db.predictionMarket.findMany({
    where: { resolvedAt: null, day: { lt: today } },
    orderBy: { day: "asc" },
    take: 60,
  });
  let settled = 0;
  for (const market of open) {
    const def = MARKETS.find((row) => row.slug === market.slug);
    if (!def) continue;

    const from = new Date(market.day.getTime() - 10 * DAY_MS);
    const to = new Date(market.day.getTime() + 2 * DAY_MS);
    let rows: { date: string; close: number }[] = [];
    try {
      rows = await closesFor(def.symbol, from, to);
    } catch {
      continue; // feed hiccup — try again next run
    }
    if (!rows.length) continue; // feed gave nothing — retry, never cancel
    const dayIso = market.day.toISOString().slice(0, 10);
    const index = rows.findIndex((row) => row.date === dayIso);

    if (index < 1) {
      // No trading that day (weekend/holiday) — cancel the round fairly.
      await db.predictionMarket.update({
        where: { id: market.id },
        data: { resolvedAt: new Date() },
      });
      continue;
    }

    const baseline = rows[index - 1].close;
    const final = rows[index].close;
    const outcome = final > baseline ? 0 : final < baseline ? 1 : null;

    // Pay picks BEFORE marking resolved: awardPoints is idempotent on its
    // `pred:<marketId>` key, so a mid-loop failure re-runs safely next cron;
    // marking first would strand the unpaid picks forever.
    const picks =
      outcome == null
        ? []
        : await db.predictionPick.findMany({
            where: { marketId: market.id },
            select: { userId: true, choice: true },
          });
    for (const pick of picks) {
      if (pick.choice === outcome) {
        await awardPoints({
          userId: pick.userId,
          reason: "PREDICT_WIN",
          points: WIN_POINTS,
          note: `${def.emoji} ${def.name} — you called it right`,
          key: `pred:${market.id}`,
        });
      } else {
        const balance = await pointsBalance(pick.userId);
        const loss = Math.min(LOSS_POINTS, Math.max(balance, 0));
        if (loss > 0) {
          await awardPoints({
            userId: pick.userId,
            reason: "PREDICT_LOSS",
            points: -loss,
            note: `${def.emoji} ${def.name} — wrong call`,
            key: `pred:${market.id}`,
            skipReferralBonus: true,
          });
        }
      }
    }

    await db.predictionMarket.update({
      where: { id: market.id },
      data: { baseline, final, outcome, resolvedAt: new Date() },
    });
    settled += 1;
  }
  return { settled, open: open.length };
}
