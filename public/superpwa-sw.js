/**
 * Kill switch for the service worker the old WordPress site installed at this path.
 * Browsers that still have it cached serve its "Sorry, you are offline..." page over
 * the live site, so this replacement clears every cache and unregisters itself.
 */
self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
      await self.registration.unregister();
      const clients = await self.clients.matchAll({ type: "window" });
      clients.forEach((client) => client.navigate(client.url));
    })(),
  );
});
