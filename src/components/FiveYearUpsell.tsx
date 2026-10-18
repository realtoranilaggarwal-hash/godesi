"use client";

import { useRef, useState, type ReactNode } from "react";
import { OfferCountdown } from "@/components/OfferCountdown";

/**
 * Wraps the yearly Featured buy buttons. The first click on any of them opens
 * a pop-up offering five years at half price with this month's code; "No"
 * carries on with the click the visitor made.
 */
export function FiveYearUpsell({
  code,
  endsAt,
  offerLabel,
  listLabel,
  perYearLabel,
  yearLabel,
  href,
  children,
}: {
  code: string;
  endsAt: string;
  offerLabel: string;
  listLabel: string;
  perYearLabel: string;
  yearLabel: string;
  href: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const decided = useRef(false);
  const resume = useRef<(() => void) | null>(null);

  function intercept(event: React.SyntheticEvent, next: () => void) {
    if (decided.current) return;
    event.preventDefault();
    event.stopPropagation();
    resume.current = next;
    setOpen(true);
  }

  return (
    <div
      onSubmitCapture={(event) => {
        const form = event.target as HTMLFormElement;
        const submitter = (event.nativeEvent as SubmitEvent).submitter;
        intercept(event, () => form.requestSubmit(submitter ?? undefined));
      }}
      onClickCapture={(event) => {
        const link = (event.target as HTMLElement).closest("a");
        if (link && !link.closest("[role=dialog]"))
          intercept(event, () => link.click());
      }}
    >
      {children}
      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="five-year-upsell-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
        >
          <div className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6 text-center shadow-xl">
            <p className="text-4xl">🔥</p>
            <h2 id="five-year-upsell-title" className="text-xl font-black">
              Upgrade to 5 years for {offerLabel}?
            </h2>
            <p className="text-sm text-slate-600">
              Five years of Featured is{" "}
              <span className="line-through">{listLabel}</span>, but with this
              month&apos;s code it&apos;s just{" "}
              <strong className="text-slate-900">{offerLabel}</strong> —
              that&apos;s {perYearLabel} a year instead of {yearLabel}.
            </p>
            <div className="rounded-xl border-2 border-dashed border-amber-400 bg-amber-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                This month&apos;s code
              </p>
              <p className="font-mono text-2xl font-black tracking-wider">
                {code}
              </p>
              <p className="text-xs text-amber-800">
                Expires at the end of this month, in{" "}
                <OfferCountdown endsAt={endsAt} />
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row-reverse">
              <a
                href={href}
                onClick={() => {
                  decided.current = true;
                  setOpen(false);
                }}
                className="flex-1 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Yes, 5 years for {offerLabel}
              </a>
              <button
                type="button"
                onClick={() => {
                  decided.current = true;
                  setOpen(false);
                  resume.current?.();
                }}
                className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50"
              >
                No, keep 1 year
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
