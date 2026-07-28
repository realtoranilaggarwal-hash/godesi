"use client";

import { useEffect } from "react";
import Link from "next/link";

/** A stale tab after a deploy asks for chunks that no longer exist — reload once instead of showing a dead screen. */
function isStaleBuild(error: Error) {
  return /ChunkLoadError|Loading chunk|Failed to fetch dynamically imported module|Importing a module script failed/i.test(
    `${error.name} ${error.message}`,
  );
}

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (!isStaleBuild(error)) return;
    const key = "godesi-reloaded-for-build";
    const last = Number(sessionStorage.getItem(key) ?? 0);
    // One reload per minute: recovers after every deploy without looping.
    if (Date.now() - last < 60_000) return;
    sessionStorage.setItem(key, String(Date.now()));
    window.location.reload();
  }, [error]);

  return (
    <div className="mx-auto max-w-lg py-16 text-center">
      <h1 className="text-2xl font-black text-slate-900">Something went wrong 😕</h1>
      <p className="mt-2 text-slate-600">
        The page failed to load. Try again — if it keeps happening, tell us and we will fix
        it.
      </p>
      {error.digest ? (
        <p className="mt-1 text-xs text-slate-400">Reference: {error.digest}</p>
      ) : null}
      <div className="mt-5 flex justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Go home
        </Link>
        <Link
          href="/contact"
          className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Report it
        </Link>
      </div>
    </div>
  );
}
