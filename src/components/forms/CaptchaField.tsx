"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    grecaptcha?: { render: (el: HTMLElement, opts: object) => void };
  }
}

/** "I'm not a robot" checkbox; posts `g-recaptcha-response` with the form. */
export function CaptchaField({ siteKey }: { siteKey: string }) {
  useEffect(() => {
    if (!siteKey) return;
    if (!document.querySelector('script[src*="recaptcha/api.js"]')) {
      const script = document.createElement("script");
      script.src = "https://www.google.com/recaptcha/api.js";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }, [siteKey]);

  if (!siteKey) return null;
  return <div className="g-recaptcha" data-sitekey={siteKey} />;
}
