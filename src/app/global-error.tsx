"use client";

import { useEffect } from "react";

/** Last-resort boundary: a layout-level crash (often a stale build) reloads once, then offers a way out. */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    const stale =
      /ChunkLoadError|Loading chunk|dynamically imported module|module script failed/i.test(
        `${error.name} ${error.message}`,
      );
    const key = "godesi-reloaded-for-build";
    if (!stale || sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    window.location.reload();
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <div className="mx-auto max-w-lg px-4 py-20 text-center">
          <h1 className="text-2xl font-black">Godesi hit an error 😕</h1>
          <p className="mt-2 text-slate-600">
            Reload the page — this is usually a stale copy of the site in your browser.
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-5 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
