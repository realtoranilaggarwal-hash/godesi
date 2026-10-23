"use client";

import { useEffect, useRef } from "react";

const EMBEDS = {
  "market-overview": {
    src: "https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js",
    config: {
      colorTheme: "light",
      dateRange: "1D",
      showChart: true,
      locale: "en",
      largeChartUrl: "",
      isTransparent: true,
      showSymbolLogo: true,
      showFloatingTooltip: false,
      width: "100%",
      height: "550",
      plotLineColorGrowing: "rgba(41, 98, 255, 1)",
      plotLineColorFalling: "rgba(41, 98, 255, 1)",
      gridLineColor: "rgba(240, 243, 250, 0)",
      scaleFontColor: "rgba(19, 23, 34, 1)",
      belowLineFillColorGrowing: "rgba(41, 98, 255, 0.12)",
      belowLineFillColorFalling: "rgba(41, 98, 255, 0.12)",
      belowLineFillColorGrowingBottom: "rgba(41, 98, 255, 0)",
      belowLineFillColorFallingBottom: "rgba(41, 98, 255, 0)",
      symbolActiveColor: "rgba(41, 98, 255, 0.12)",
      tabs: [
        {
          title: "Indices",
          symbols: [
            { s: "FOREXCOM:SPXUSD", d: "S&P 500" },
            { s: "FOREXCOM:NSXUSD", d: "Nasdaq 100" },
            { s: "FOREXCOM:DJI", d: "Dow 30" },
            { s: "NSE:NIFTY", d: "Nifty 50" },
            { s: "BSE:SENSEX", d: "Sensex" },
          ],
        },
        {
          title: "Forex",
          symbols: [
            { s: "FX_IDC:USDINR", d: "USD to INR" },
            { s: "FX:EURUSD", d: "EUR to USD" },
            { s: "FX:GBPUSD", d: "GBP to USD" },
            { s: "FX_IDC:USDCAD", d: "USD to CAD" },
            { s: "FX_IDC:USDAED", d: "USD to AED" },
          ],
        },
        {
          title: "Crypto",
          symbols: [
            { s: "BITSTAMP:BTCUSD", d: "Bitcoin" },
            { s: "BITSTAMP:ETHUSD", d: "Ethereum" },
            { s: "BITSTAMP:SOLUSD", d: "Solana" },
            { s: "BITSTAMP:XRPUSD", d: "XRP" },
          ],
        },
      ],
    },
  },
  screener: {
    src: "https://s3.tradingview.com/external-embedding/embed-widget-screener.js",
    config: {
      width: "100%",
      height: 500,
      defaultColumn: "overview",
      defaultScreen: "most_capitalized",
      market: "us",
      showToolbar: true,
      colorTheme: "light",
      locale: "en",
    },
  },
  "forex-cross-rates": {
    src: "https://s3.tradingview.com/external-embedding/embed-widget-forex-cross-rates.js",
    config: {
      width: "100%",
      height: 300,
      currencies: ["USD", "INR", "PKR", "BDT", "LKR", "NPR", "AED", "GBP", "EUR", "CAD"],
      isTransparent: true,
      colorTheme: "light",
      locale: "en",
      backgroundColor: "#ffffff",
    },
  },
  "market-news": {
    src: "https://s3.tradingview.com/external-embedding/embed-widget-timeline.js",
    config: {
      feedMode: "market",
      market: "us",
      isTransparent: true,
      displayMode: "regular",
      width: "100%",
      height: 500,
      colorTheme: "light",
      locale: "en",
    },
  },
} as const;

/**
 * Free TradingView widgets — injected client-side like the Travelpayouts
 * ones, since the embed scripts render themselves where appended.
 */
export function TvWidget({ variant }: { variant: keyof typeof EMBEDS }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    const embed = EMBEDS[variant];
    const container = document.createElement("div");
    container.className = "tradingview-widget-container";
    const widget = document.createElement("div");
    widget.className = "tradingview-widget-container__widget";
    container.appendChild(widget);
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.async = true;
    script.src = embed.src;
    script.innerHTML = JSON.stringify(embed.config);
    container.appendChild(script);
    host.appendChild(container);
    return () => {
      host.replaceChildren();
    };
  }, [variant]);

  return <div ref={ref} className="min-h-24" data-widget={`tv-${variant}`} />;
}
