"use client";

import { useEffect } from "react";
import { tidyBuildBuster } from "@/lib/staleBuild";

/**
 * The domain previously ran WordPress with a PWA plugin, whose service worker still
 * serves its cached "you are offline" page to returning visitors. Godesi ships no
 * service worker, so any registration found is removed along with its caches.
 */
export function UnregisterServiceWorkers() {
  useEffect(() => {
    // Rendering got this far, so a recovery reload worked: drop its marker.
    tidyBuildBuster();
    if (!("serviceWorker" in navigator)) return;

    void navigator.serviceWorker.getRegistrations().then(async (registrations) => {
      if (registrations.length === 0) return;
      await Promise.all(registrations.map((registration) => registration.unregister()));
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));
      }
    });
  }, []);

  return null;
}
