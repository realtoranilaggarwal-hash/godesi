"use client";

import { useEffect, useState } from "react";
import { readLanguage, writeLanguage } from "@/components/LocalePicker";

/** One-tap switch of the whole page to Gujarati (and back) via Google Translate. */
export function GujaratiButton({ className = "" }: { className?: string }) {
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    setLanguage(readLanguage());
  }, []);

  const gujarati = language === "gu";

  return (
    <button
      type="button"
      translate="no"
      onClick={() => {
        writeLanguage(gujarati ? "en" : "gu");
        window.location.reload();
      }}
      className={`notranslate inline-flex items-center gap-1 rounded-xl border border-orange-300 bg-orange-50 px-3 py-2 text-sm font-bold text-orange-800 hover:bg-orange-100 ${className}`}
    >
      <span aria-hidden>🌐</span>
      {gujarati ? "Read in English" : "ગુજરાતીમાં વાંચો · Read in Gujarati"}
    </button>
  );
}
