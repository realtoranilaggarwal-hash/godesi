const STALE =
  /ChunkLoadError|Loading chunk|Loading CSS chunk|dynamically imported module|module script failed|Unable to load script|Load failed|NetworkError|Failed to fetch|hydrat/i;

/**
 * A tab opened before a deploy asks for assets that moved, which surfaces as a
 * chunk, hydration or fetch failure. Those recover on their own with one reload.
 */
export function isStaleBuild(error: Error & { digest?: string }) {
  // A digest means the server threw: reloading would show the same page again.
  if (error.digest) return false;
  return STALE.test(`${error.name} ${error.message}`);
}

const KEY = "godesi-build-reloads";
/** A plain reload can be answered from cache with the same broken HTML. */
const BUSTER = "__fresh";

/**
 * Reloads past the cache, twice at most: a phone that kept the old document
 * needs a changed URL before it asks the network for the new one.
 */
export function reloadOnceForBuild() {
  let tries = 0;
  try {
    tries = Number(sessionStorage.getItem(KEY) ?? 0);
    sessionStorage.setItem(KEY, String(tries + 1));
  } catch {
    // Private mode without storage: reload anyway, the cache is the problem.
  }
  if (tries >= 2) return;

  const url = new URL(window.location.href);
  url.searchParams.set(BUSTER, String(Date.now()));
  void clearCaches().finally(() => window.location.replace(url.toString()));
}

/** Drops the cache buster once the page renders, so links stay shareable. */
export function tidyBuildBuster() {
  const url = new URL(window.location.href);
  if (!url.searchParams.has(BUSTER)) return;
  url.searchParams.delete(BUSTER);
  window.history.replaceState(
    null,
    "",
    `${url.pathname}${url.search}${url.hash}`,
  );
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // Nothing to tidy without storage.
  }
}

async function clearCaches() {
  if ("serviceWorker" in navigator) {
    try {
      const workers = await navigator.serviceWorker.getRegistrations();
      await Promise.all(workers.map((worker) => worker.unregister()));
    } catch {
      // A blocked registration list is not worth failing the reload over.
    }
  }
  if (!("caches" in window)) return;
  try {
    const keys = await caches.keys();
    await Promise.all(keys.map((key) => caches.delete(key)));
  } catch {
    // Cache API can be blocked; the reload alone usually clears the problem.
  }
}
