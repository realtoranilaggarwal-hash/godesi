"use client";

import { useEffect } from "react";

/** Languages the picker offers; the widget only loads these. */
const SUPPORTED =
  "en,hi,gu,pa,mr,bn,ta,te,ml,kn,ur,ne,es,fr,ar";

declare global {
  interface Window {
    google?: {
      translate?: {
        TranslateElement: new (
          options: { pageLanguage: string; includedLanguages: string; autoDisplay: boolean },
          element: string,
        ) => void;
      };
    };
    googleTranslateElementInit?: () => void;
  }
}

function browserLanguage() {
  const code = (navigator.language || "en").split("-")[0].toLowerCase();
  return SUPPORTED.split(",").includes(code) ? code : "en";
}

/**
 * Mounts the free Google Translate widget, hidden — the visible control is the
 * header picker, which writes the `googtrans` cookie the widget reads. On a
 * first visit the browser language is suggested once and then remembered.
 */
export function GoogleTranslate() {
  useEffect(() => {
    const hasChoice = document.cookie.includes("godesi_lang=");
    if (!hasChoice) {
      document.cookie = "godesi_lang=set; path=/; max-age=31536000; samesite=lax";
      const detected = browserLanguage();
      if (detected !== "en" && !document.cookie.includes("googtrans=")) {
        document.cookie = `googtrans=/en/${detected}; path=/; max-age=31536000`;
        window.location.reload();
        return;
      }
    }

    if (document.getElementById("google-translate-script")) return;

    window.googleTranslateElementInit = () => {
      if (!window.google?.translate) return;
      new window.google.translate.TranslateElement(
        { pageLanguage: "en", includedLanguages: SUPPORTED, autoDisplay: false },
        "google_translate_element",
      );
    };

    const script = document.createElement("script");
    script.id = "google-translate-script";
    script.src =
      "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return <div id="google_translate_element" className="hidden" />;
}
