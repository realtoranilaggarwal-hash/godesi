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
    "Live markets on GoDesi: US and India indexes, India and US stock screeners, USD to INR and remittance currencies, gold, silver and crude prices, crypto, a US & India economic calendar and market news — powered by TradingView.",
};

const PARTNER_OFFERS = [
  {
    href: "https://shop.ledger.com/?r=d8c50c491673",
    label: "🔐 Ledger hardware wallet — secure your crypto",
  },
  {
    href: "https://coinbase.com/join/HTSC8CX",
    label: "₿ Coinbase — buy crypto, get a sign-up bonus",
  },
  {
    href: "https://join.robinhood.com/anila100",
    label: "📈 Robinhood — claim a free stock reward",
  },
  {
    href: "https://www.webull.com/s/3Khqz6Gg5kk5p7nJHn",
    label: "📊 Webull — free stocks for new accounts",
  },
];

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
          Live prices for US and India markets, remittance currencies, gold
          and crypto, plus stock screeners and an economic calendar — free
          quotes by TradingView.
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

      <Card title="Economic calendar — US & India">
        <TvWidget variant="economic-calendar" />
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="US stock screener — biggest companies first">
          <TvWidget variant="screener" />
        </Card>
        <Card title="India stock screener">
          <TvWidget variant="india-screener" />
        </Card>
      </div>

      <Card title="Crypto screener">
        <TvWidget variant="crypto-screener" />
      </Card>

      <div>
        <Card title="Start investing — our partner offers">
          <div className="grid gap-2 sm:grid-cols-2">
            {PARTNER_OFFERS.map((offer) => (
              <a
                key={offer.href}
                href={offer.href}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100"
              >
                {offer.label} →
              </a>
            ))}
          </div>
        </Card>
        <p className="mt-1 px-1 text-[11px] text-slate-500">
          Some links are referral links — GoDesi may earn a bonus at no cost to
          you. Not financial advice.
        </p>
      </div>

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
        <Link href="/crypto-fear-greed" className="font-semibold text-indigo-600">
          Crypto fear &amp; greed index →
        </Link>
      </div>
    </div>
  );
}
