import { db } from "@/lib/db";
import { gaReport } from "@/lib/ga";
import { newsPath } from "@/lib/newsLinks";
import { siteTraffic } from "@/lib/traffic";

const DAY_MS = 24 * 60 * 60 * 1000;

const escape = (value: string) =>
  value.replace(
    /[&<>"]/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[char] ?? char,
  );

const h2 = (text: string) =>
  `<h2 style="margin:16px 0 6px;font-size:16px">${text}</h2>`;

/* ----------------------------- Daily news ----------------------------- */

const NEWS_TOPICS = ["general", "nri", "entertainment", "faith", "food"];

/**
 * The day's top feed headlines, one topic at a time so a busy Bollywood day
 * can't crowd out India and NRI news.
 */
export async function newsSection(base: string, now: Date, take = 6) {
  // The feed is crawled once a day, so "today's news" is what was imported in
  // the last 24h; one query per topic keeps a busy topic from filling the list.
  const where = {
    status: "PUBLISHED" as const,
    submittedById: null,
    createdAt: { gte: new Date(now.getTime() - DAY_MS), lte: now },
    publishedAt: { gte: new Date(now.getTime() - 2 * DAY_MS), lte: now },
  };
  const select = { id: true, title: true, source: true, topic: true };
  const [known, others] = await Promise.all([
    Promise.all(
      NEWS_TOPICS.map((topic) =>
        db.newsItem.findMany({
          where: { ...where, topic },
          orderBy: { publishedAt: "desc" },
          take,
          select,
        }),
      ),
    ),
    db.newsItem.findMany({
      where: { ...where, topic: { notIn: NEWS_TOPICS } },
      orderBy: { publishedAt: "desc" },
      take: take * 3,
      select,
    }),
  ]);
  const items = [...known.flat(), ...others];
  const byTopic = new Map<string, typeof items>();
  for (const item of items) {
    const list = byTopic.get(item.topic) ?? [];
    list.push(item);
    byTopic.set(item.topic, list);
  }
  const order = [
    ...NEWS_TOPICS,
    ...Array.from(byTopic.keys()).filter((t) => !NEWS_TOPICS.includes(t)),
  ];
  const picked: typeof items = [];
  for (let round = 0; picked.length < take; round++) {
    let added = false;
    for (const topic of order) {
      const item = byTopic.get(topic)?.[round];
      if (item && picked.length < take) {
        picked.push(item);
        added = true;
      }
    }
    if (!added) break;
  }
  if (!picked.length) return "";
  const rows = picked
    .map(
      (item) =>
        `<li style="margin:0 0 8px"><a href="${base}${newsPath(item)}" style="color:#4f46e5;font-weight:700;text-decoration:none">${escape(item.title)}</a><div style="color:#64748b;font-size:13px">${escape(item.source)}</div></li>`,
    )
    .join("");
  return `${h2("📰 Today's news")}<ul style="margin:0;padding-left:18px">${rows}</ul>
    <p style="margin:6px 0 0"><a href="${base}/news" style="color:#4f46e5">More news on GoDesi →</a></p>`;
}

/* ------------------------------- Markets ------------------------------ */

type Quote = { price: number; previous: number | null };

const MARKETS = [
  { label: "💵 $1 in rupees", symbol: "INR=X", format: "inr" },
  { label: "🥇 Gold (1 oz)", symbol: "GC=F", format: "usd" },
  { label: "🥈 Silver (1 oz)", symbol: "SI=F", format: "usd" },
  { label: "📊 S&P 500", symbol: "^GSPC", format: "points" },
  { label: "💻 Nasdaq", symbol: "^IXIC", format: "points" },
  { label: "🇮🇳 Nifty 50", symbol: "^NSEI", format: "points" },
  { label: "🇮🇳 Sensex", symbol: "^BSESN", format: "points" },
  { label: "₿ Bitcoin", symbol: "BTC-USD", format: "usd" },
] as const;

/** Latest price and the close before it, from Yahoo's free chart endpoint. */
async function quote(symbol: string): Promise<Quote | null> {
  for (const host of ["query2", "query1"]) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const res = await fetch(
        `https://${host}.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1d&interval=1d`,
        {
          cache: "no-store",
          headers: { "user-agent": "Mozilla/5.0 (X11; Linux x86_64)" },
          signal: AbortSignal.timeout(8000),
        },
      );
      if (!res.ok) continue;
      // eslint-disable-next-line no-await-in-loop
      const meta = (await res.json())?.chart?.result?.[0]?.meta;
      const price = Number(meta?.regularMarketPrice);
      const previous = Number(meta?.chartPreviousClose);
      if (Number.isFinite(price) && price > 0) {
        return {
          price,
          previous: Number.isFinite(previous) && previous > 0 ? previous : null,
        };
      }
    } catch {
      /* try the other host */
    }
  }
  return null;
}

/** The free exchange-rate feed the ticker uses, in case Yahoo is down. */
async function rupeeFallback(): Promise<Quote | null> {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD", {
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    const value = Number((await res.json())?.rates?.INR);
    return Number.isFinite(value) && value > 0
      ? { price: value, previous: null }
      : null;
  } catch {
    return null;
  }
}

function money(value: number, format: (typeof MARKETS)[number]["format"]) {
  if (format === "inr") return `₹${value.toFixed(2)}`;
  const digits = format === "usd" && value < 100 ? 2 : 0;
  const text = value.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
  return format === "usd" ? `$${text}` : text;
}

function change(q: Quote) {
  if (!q.previous) return "";
  const pct = ((q.price - q.previous) / q.previous) * 100;
  if (Math.abs(pct) < 0.005) return `<span style="color:#64748b">0.00%</span>`;
  const up = pct > 0;
  return `<span style="color:${up ? "#15803d" : "#b91c1c"}">${up ? "▲" : "▼"} ${Math.abs(pct).toFixed(2)}%</span>`;
}

/** Rupee, gold, silver, US and India indexes and bitcoin, with the day's move. */
export async function marketsSection(base: string) {
  const quotes = await Promise.all(
    MARKETS.map(async (market) => {
      const q =
        (await quote(market.symbol)) ??
        (market.symbol === "INR=X" ? await rupeeFallback() : null);
      return q ? { ...market, q } : null;
    }),
  );
  const rows = quotes
    .filter((row) => row !== null)
    .map(
      (row) =>
        `<tr><td style="padding:4px 8px 4px 0">${row.label}</td><td style="padding:4px 8px;text-align:right;font-weight:700">${money(row.q.price, row.format)}</td><td style="padding:4px 0 4px 8px;text-align:right;font-size:13px">${change(row.q)}</td></tr>`,
    )
    .join("");
  if (!rows) return "";
  return `${h2("📈 Markets this morning")}
    <table role="presentation" style="border-collapse:collapse;width:100%;font-size:14px">${rows}</table>
    <p style="margin:6px 0 0;font-size:12px;color:#64748b">Last price and change since the previous close. Delayed, for information only — not financial advice. <a href="${base}/markets" style="color:#4f46e5">Live charts →</a> · <a href="${base}/usd-to-inr" style="color:#4f46e5">Dollar to rupee →</a></p>`;
}

/* ------------------------------- Traffic ------------------------------ */

type Day = { date: string; visitors: number };

/** Daily visitors from Google Analytics, else from our own counter. */
async function visitorDays(): Promise<Day[]> {
  const report = await gaReport();
  if (report?.days.length) return report.days;
  const rows = await db.visitDay.findMany({
    where: { day: { gte: new Date(Date.now() - 16 * DAY_MS) } },
    orderBy: { day: "asc" },
  });
  return rows.map((row) => ({
    date: row.day.toISOString().slice(0, 10),
    visitors: row.visitors,
  }));
}

/**
 * Last full week of visitors, all-time visitors and members, so the community
 * sees GoDesi growing. The week-on-week change is only shown when it is up;
 * today is left out because it isn't over yet.
 */
export async function trafficSection(base: string, now: Date) {
  const todayKey = now.toISOString().slice(0, 10);
  const [days, total, members, newMembers] = await Promise.all([
    visitorDays().catch(() => [] as Day[]),
    siteTraffic(),
    db.user.count({ where: { bannedAt: null } }),
    db.user.count({
      where: {
        bannedAt: null,
        createdAt: { gte: new Date(now.getTime() - 7 * DAY_MS) },
      },
    }),
  ]);
  const full = days.filter((d) => d.date < todayKey);
  const sum = (list: Day[]) => list.reduce((s, d) => s + d.visitors, 0);
  const week = sum(full.slice(-7));
  const before = full.length >= 14 ? sum(full.slice(-14, -7)) : 0;
  const count = (n: number) => `<b>${n.toLocaleString("en-US")}</b>`;

  const lines: string[] = [];
  if (week) {
    const pct = before ? Math.round(((week - before) / before) * 100) : 0;
    lines.push(
      `${count(week)} visits in the last 7 days${pct > 0 ? ` <span style="color:#15803d">▲ ${pct}% on the week before</span>` : ""}`,
    );
  }
  if (total.visitors) {
    lines.push(`${count(total.visitors)} visitors since GoDesi started`);
  }
  if (members) {
    lines.push(
      `${count(members)} members${newMembers ? `, ${count(newMembers)} joined this week` : ""}`,
    );
  }
  if (!lines.length) return "";
  return `${h2("🚀 GoDesi is growing")}
    <p style="margin:0;line-height:1.6">${lines.join("<br>")}</p>
    <p style="margin:6px 0 0"><a href="${base}/traffic" style="color:#4f46e5">See live traffic →</a></p>`;
}
