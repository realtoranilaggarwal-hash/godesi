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

/** Reloads at most once a minute, so a genuine crash still shows the message. */
export function reloadOnceForBuild() {
  const key = "godesi-reloaded-for-build";
  try {
    const last = Number(sessionStorage.getItem(key) ?? 0);
    if (Date.now() - last < 60_000) return;
    sessionStorage.setItem(key, String(Date.now()));
  } catch {
    // Private mode without storage: reload anyway, the browser cache is the fix.
  }
  void clearCaches().finally(() => window.location.reload());
}

async function clearCaches() {
  if (!("caches" in window)) return;
  try {
    const keys = await caches.keys();
    await Promise.all(keys.map((key) => caches.delete(key)));
  } catch {
    // Cache API can be blocked; the reload alone usually clears the problem.
  }
}
