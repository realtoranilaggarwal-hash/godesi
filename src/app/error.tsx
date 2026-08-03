"use client";

import { useEffect } from "react";
import Link from "next/link";
import { isStaleBuild, reloadOnceForBuild } from "@/lib/staleBuild";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (isStaleBuild(error)) reloadOnceForBuild();
  }, [error]);

  return (
    <div className="mx-auto max-w-lg py-16 text-center">
      <h1 className="text-2xl font-black text-slate-900">
        Something went wrong 😕
      </h1>
      <p className="mt-2 text-slate-600">
        The page failed to load. Try again — if it keeps happening, tell us and
        we will fix it.
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
