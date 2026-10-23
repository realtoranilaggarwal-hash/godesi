"use client";

import { useEffect, useRef } from "react";

const TAPE_CONFIG = {
  symbols: [
    { proName: "FOREXCOM:SPXUSD", title: "S&P 500" },
    { proName: "FOREXCOM:NSXUSD", title: "Nasdaq 100" },
    { proName: "FOREXCOM:DJI", title: "Dow 30" },
    { proName: "NSE:NIFTY", title: "Nifty 50" },
    { proName: "FX_IDC:USDINR", title: "USD → INR" },
    { proName: "TVC:GOLD", title: "Gold" },
    { proName: "BITSTAMP:BTCUSD", title: "Bitcoin" },
  ],
  showSymbolLogo: true,
  isTransparent: true,
  displayMode: "compact",
  colorTheme: "light",
  locale: "en",
};

/**
 * Free TradingView ticker tape — live quotes, no API key. Like the
 * Travelpayouts widgets it renders itself client-side, so it is injected
 * rather than server-rendered.
 */
export function MarketTape() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    const container = document.createElement("div");
    container.className = "tradingview-widget-container";
    const widget = document.createElement("div");
    widget.className = "tradingview-widget-container__widget";
    container.appendChild(widget);
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.async = true;
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
    script.innerHTML = JSON.stringify(TAPE_CONFIG);
    container.appendChild(script);
    host.appendChild(container);
    return () => {
      host.replaceChildren();
    };
  }, []);

  return <div ref={ref} className="min-h-12" data-widget="market-tape" />;
}
