import Script from "next/script";
import { convert, getRates } from "@/lib/rates";

type QuoraEventName =
  | "CompleteRegistration"
  | "Purchase"
  | "GenerateLead"
  | "AddToCart";

/** Conversion value in USD for a charge made in any supported currency. */
export async function usdValue(amountMinor: number, currency: string) {
  const usd = convert(amountMinor / 100, currency, "USD", await getRates());
  return usd ?? undefined;
}

/**
 * Fires a Quora Pixel conversion on the page it is rendered on. The base
 * pixel in the root layout defines `qp` and queues calls made before it loads.
 * `valueUsd` is the conversion value in the ad account currency (USD).
 */
export function QuoraEvent({
  event,
  valueUsd,
}: {
  event: QuoraEventName;
  valueUsd?: number;
}) {
  const value =
    typeof valueUsd === "number" && Number.isFinite(valueUsd) && valueUsd > 0
      ? `,{value:${Math.round(valueUsd * 100) / 100}}`
      : "";
  return (
    <Script
      id={`quora-${event}`}
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `(function f(n){window.qp?qp('track',${JSON.stringify(event)}${value}):n<40&&setTimeout(function(){f(n+1)},250)})(0);`,
      }}
    />
  );
}
