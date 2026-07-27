import Link from "next/link";
import {
  HIRING_STEPS,
  PLATFORM_DISCLAIMER,
  TRADING_DISCLAIMER,
  TRADING_TIPS,
} from "@/lib/safety";

/** Sidebar trust box — shown next to listings, vendors and marketplace pages. */
export function NeedHelpBox({ about }: { about?: string }) {
  const reportHref = about
    ? `/report?about=${encodeURIComponent(about)}`
    : "/report";

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
      <h2 className="text-base font-bold text-amber-900">Need help?</h2>
      <ul className="mt-2 space-y-2 text-sm">
        <li>
          <Link href={reportHref} className="font-semibold text-amber-900 hover:underline">
            🚩 Report an issue
          </Link>
        </li>
        <li>
          <Link href="/safety" className="font-semibold text-amber-900 hover:underline">
            🛡️ How to hire safely
          </Link>
        </li>
        <li>
          <Link
            href="/safety#buy-sell"
            className="font-semibold text-amber-900 hover:underline"
          >
            🤝 Safe buying &amp; selling tips
          </Link>
        </li>
      </ul>
      <p className="mt-3 text-xs leading-relaxed text-amber-900/80">
        {PLATFORM_DISCLAIMER}
      </p>
    </div>
  );
}

/** Collapsed checklist for listing and vendor pages. */
export function HiringChecklist() {
  return (
    <details className="rounded-2xl border border-slate-200 bg-white p-4">
      <summary className="cursor-pointer text-sm font-bold text-slate-900">
        🛡️ Before you hire — 8 quick checks
      </summary>
      <ol className="mt-3 grid gap-2 sm:grid-cols-2">
        {HIRING_STEPS.map((step, index) => (
          <li key={step.title} className="text-sm text-slate-600">
            <span className="font-semibold text-slate-800">
              {index + 1}. {step.title}
            </span>
            <ul className="mt-0.5 space-y-0.5">
              {step.points.map((point) => (
                <li key={point}>• {point}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
      <p className="mt-3 text-xs text-slate-500">
        {PLATFORM_DISCLAIMER}{" "}
        <Link href="/report" className="font-semibold text-indigo-600">
          Report an issue
        </Link>
        .
      </p>
    </details>
  );
}

/** Buy & sell guidance for marketplace category and listing pages. */
export function TradingTips({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="rounded-2xl border border-sky-200 bg-sky-50/70 p-4">
        <h2 className="text-base font-bold text-sky-900">🤝 Safety tips</h2>
        <ul className="mt-2 space-y-1 text-sm text-sky-900/90">
          {TRADING_TIPS.map((tip) => (
            <li key={tip.title}>
              {tip.icon} {tip.title}
            </li>
          ))}
        </ul>
        <Link
          href="/safety#buy-sell"
          className="mt-3 inline-block text-sm font-semibold text-sky-800 hover:underline"
        >
          Read the full guide →
        </Link>
        <p className="mt-2 text-xs text-sky-900/70">{TRADING_DISCLAIMER}</p>
      </div>
    );
  }

  return (
    <section
      id="buy-sell"
      className="rounded-2xl border border-slate-200 bg-white p-4"
    >
      <h2 className="text-lg font-bold text-slate-900">
        Safe buying &amp; selling tips
      </h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {TRADING_TIPS.map((tip) => (
          <div key={tip.title} className="rounded-2xl bg-slate-50 p-3">
            <p className="text-sm font-bold text-slate-900">
              {tip.icon} {tip.title}
            </p>
            <ul className="mt-1 space-y-0.5 text-sm text-slate-600">
              {tip.points.map((point) => (
                <li key={point}>• {point}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-slate-500">{TRADING_DISCLAIMER}</p>
    </section>
  );
}
