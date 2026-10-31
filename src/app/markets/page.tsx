import Link from "next/link";
import type { Metadata } from "next";
import { MarketTape } from "@/components/MarketTape";
import { TvWidget } from "@/components/tradingview/TvWidget";
import { DailyPredictions } from "@/components/DailyPredictions";
import { predictionsState } from "@/lib/predictions";
import { cachedCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Markets today — stocks, USD to INR, crypto, live charts",
  description:
    "Live markets on GoDesi: US and India indexes, USD to INR and remittance currencies, crypto prices, top US stocks and market news — powered by TradingView.",
};

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <h2 className="mb-2 text-sm font-bold text-slate-900">{title}</h2>
      {children}
    </section>
  );
}

export default async function MarketsPage() {
  const me = await cachedCurrentUser();
  const markets = await predictionsState(me?.id ?? null);
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-black text-slate-900">
          📈 Markets today
        </h1>
        <p className="text-sm text-slate-600">
          Live prices for US and India markets, remittance currencies and
          crypto — free quotes by TradingView.
        </p>
      </div>

      <div id="predict">
        <DailyPredictions initial={markets} signedIn={Boolean(me)} />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
        <MarketTape />
      </div>

      <Card title="Indexes, forex and crypto — tap a tab">
        <TvWidget variant="market-overview" />
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Your dollar abroad — cross rates">
          <TvWidget variant="forex-cross-rates" />
        </Card>
        <Card title="Market headlines">
          <TvWidget variant="market-news" />
        </Card>
      </div>

      <Card title="US stock screener — biggest companies first">
        <TvWidget variant="screener" />
      </Card>

      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <span>
          Quotes, charts and news by{" "}
          <a
            href="https://www.tradingview.com/?aff_id=1173084"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-indigo-600 underline"
          >
            TradingView
          </a>{" "}
          — free account unlocks more tools.
        </span>
        <span>·</span>
        <Link href="/usd-to-inr" className="font-semibold text-indigo-600">
          USD → INR remittance guide →
        </Link>
        <span>·</span>
        <a
          href="https://alternative.me/crypto/fear-and-greed-index/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-indigo-600"
        >
          Crypto fear &amp; greed index →
        </a>
      </div>
    </div>
  );
}
