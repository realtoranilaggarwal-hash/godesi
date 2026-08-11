"use client";

import { useEffect, useRef, useState } from "react";
import { setCurrencyAction } from "@/app/actions/preferences";
import { DISPLAY_CURRENCIES } from "@/lib/rates";

/** Languages Google Translate covers that matter most to the desi audience. */
const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी — Hindi" },
  { code: "gu", label: "ગુજરાતી — Gujarati" },
  { code: "pa", label: "ਪੰਜਾਬੀ — Punjabi" },
  { code: "mr", label: "मराठी — Marathi" },
  { code: "bn", label: "বাংলা — Bengali" },
  { code: "ta", label: "தமிழ் — Tamil" },
  { code: "te", label: "తెలుగు — Telugu" },
  { code: "ml", label: "മലയാളം — Malayalam" },
  { code: "kn", label: "ಕನ್ನಡ — Kannada" },
  { code: "ur", label: "اردو — Urdu" },
  { code: "ne", label: "नेपाली — Nepali" },
  { code: "es", label: "Español — Spanish" },
  { code: "fr", label: "Français — French" },
  { code: "ar", label: "العربية — Arabic" },
] as const;

const TRANSLATE_COOKIE = "googtrans";

function readLanguage() {
  const match = document.cookie.match(/(?:^|;\s*)googtrans=([^;]+)/);
  if (!match) return "en";
  const value = decodeURIComponent(match[1]).split("/");
  return value[2] || "en";
}

function writeLanguage(code: string) {
  const domain = window.location.hostname.replace(/^www\./, "");
  const value = code === "en" ? "" : `/en/${code}`;
  const expiry = code === "en" ? "Thu, 01 Jan 1970 00:00:00 GMT" : "";
  for (const scope of ["", `; domain=.${domain}`, `; domain=${domain}`]) {
    document.cookie = `${TRANSLATE_COOKIE}=${value}; path=/${scope}${
      expiry ? `; expires=${expiry}` : "; max-age=31536000"
    }`;
  }
}

/**
 * Language and currency in one control. Language runs through the free Google
 * Translate widget (auto-suggested from the browser once, then remembered);
 * currency only changes how prices are displayed, never what is charged.
 */
export function LocalePicker({
  currency,
  open: opensUp = false,
}: {
  currency: string;
  /** Opens the panel upwards, for the copy of the picker in the footer. */
  open?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [language, setLanguage] = useState("en");
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLanguage(readLanguage());
  }, []);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (box.current && !box.current.contains(event.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const chooseLanguage = (code: string) => {
    writeLanguage(code);
    window.location.reload();
  };

  const symbol =
    DISPLAY_CURRENCIES.find((item) => item.code === currency)?.flag ?? "💱";

  return (
    <div ref={box} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Change language or currency"
        className="whitespace-nowrap rounded-full bg-slate-100 px-2 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 sm:px-2.5"
      >
        🌐 {language.toUpperCase()} {symbol}
        {/* The currency code is the first thing to drop on a narrow phone bar. */}
        <span className="hidden sm:inline"> {currency}</span>
      </button>

      {open ? (
        <div
          className={`absolute z-50 mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-3 text-left shadow-xl ${
            opensUp ? "bottom-full left-0 mb-2" : "right-0"
          }`}
        >
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Language
          </p>
          <select
            value={language}
            onChange={(event) => chooseLanguage(event.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 px-2 py-1.5 text-sm"
            aria-label="Select language"
          >
            {LANGUAGES.map((item) => (
              <option key={item.code} value={item.code}>
                {item.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-[11px] text-slate-500">
            Machine translation by Google.
          </p>

          <p className="mt-3 text-xs font-bold uppercase tracking-wide text-slate-500">
            Currency
          </p>
          <form action={setCurrencyAction}>
            <select
              name="currency"
              defaultValue={currency}
              onChange={(event) => event.currentTarget.form?.requestSubmit()}
              className="mt-1 w-full rounded-xl border border-slate-300 px-2 py-1.5 text-sm"
              aria-label="Select currency"
            >
              {DISPLAY_CURRENCIES.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.flag} {item.code} — {item.label}
                </option>
              ))}
            </select>
          </form>
          <p className="mt-1 text-[11px] text-slate-500">
            Prices stay in the currency the seller posted; we show an
            approximate conversion beside them.
          </p>
        </div>
      ) : null}
    </div>
  );
}
