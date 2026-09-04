"use client";

import { useEffect } from "react";

export const JOINED_COOKIE = "godesi_joined";

declare global {
  interface Window {
    qp?: (...args: unknown[]) => void;
  }
}

/**
 * Fires Quora's CompleteRegistration once on the first page after signup.
 * `signupAction` drops a short-lived cookie; this reads and clears it, so the
 * event follows the user wherever the post-signup redirect lands.
 */
export function QuoraSignupEvent() {
  useEffect(() => {
    if (!document.cookie.split("; ").some((c) => c.startsWith(`${JOINED_COOKIE}=`))) {
      return;
    }
    document.cookie = `${JOINED_COOKIE}=; Max-Age=0; Path=/`;
    // The pixel stub loads afterInteractive, so it may land a moment after us.
    let tries = 0;
    const timer = setInterval(() => {
      if (window.qp) {
        window.qp("track", "CompleteRegistration");
        clearInterval(timer);
      } else if (++tries > 40) {
        clearInterval(timer);
      }
    }, 250);
    return () => clearInterval(timer);
  }, []);
  return null;
}
