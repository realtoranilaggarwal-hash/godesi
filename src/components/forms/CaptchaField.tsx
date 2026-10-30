"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, opts: { action: string }) => Promise<string>;
    };
  }
}

/**
 * Invisible reCAPTCHA v3: loads api.js for the site key and injects a fresh
 * token into `g-recaptcha-response` on each form submit.
 */
export function CaptchaField({ siteKey }: { siteKey: string }) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!siteKey) return;
    if (!document.querySelector('script[src*="recaptcha/api.js"]')) {
      const script = document.createElement("script");
      script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
      script.async = true;
      document.head.appendChild(script);
    }

    const input = inputRef.current;
    const form = input?.closest("form");
    if (!input || !form) return;

    let pending = false;
    const onSubmit = (event: Event) => {
      if (pending) return;
      const grecaptcha = window.grecaptcha;
      if (!grecaptcha?.execute) return;
      event.preventDefault();
      pending = true;
      grecaptcha.ready(() => {
        grecaptcha
          .execute(siteKey, { action: "submit" })
          .then((token) => {
            input.value = token;
            form.requestSubmit();
          })
          .catch(() => form.requestSubmit())
          .finally(() => {
            pending = false;
          });
      });
    };
    form.addEventListener("submit", onSubmit);
    return () => form.removeEventListener("submit", onSubmit);
  }, [siteKey]);

  if (!siteKey) return null;
  return <input ref={inputRef} type="hidden" name="g-recaptcha-response" />;
}
