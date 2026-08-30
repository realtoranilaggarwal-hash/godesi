"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type State = "empty" | "checking" | "free" | "taken" | "invalid";

/**
 * The homepage hook: type a name, see instantly whether godesi.com/<name> is
 * still free, and go straight to claiming it.
 */
export function HandleClaim({ tone = "hero" }: { tone?: "hero" | "plain" }) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [state, setState] = useState<State>("empty");
  const [message, setMessage] = useState<string | null>(null);

  // Same normalisation the server applies, so the box never shows a name that
  // differs from the one that would be claimed.
  const handle = value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/^@+/, "");

  useEffect(() => {
    if (!handle) {
      setState("empty");
      setMessage(null);
      return;
    }
    setState("checking");
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/handle?u=${encodeURIComponent(handle)}`,
        );
        const data: { state: State; message?: string } = await response.json();
        setState(data.state);
        setMessage(data.message ?? null);
      } catch {
        setState("empty");
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [handle]);

  const dark = tone === "hero";

  return (
    <div className="max-w-xl">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (handle) router.push(`/claim?u=${encodeURIComponent(handle)}`);
        }}
        className={`flex flex-col gap-2 rounded-2xl p-2 sm:flex-row sm:items-center ${
          dark ? "bg-white/15" : "border border-slate-300 bg-white"
        }`}
      >
        <div
          className={`flex flex-1 items-center rounded-xl px-3 py-2 ${
            dark ? "bg-white" : "bg-slate-50"
          }`}
        >
          <span className="whitespace-nowrap text-sm font-semibold text-slate-400">
            godesi.com/
          </span>
          <input
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="yourname"
            autoCapitalize="none"
            autoComplete="off"
            spellCheck={false}
            aria-label="Your Godesi name"
            className="w-full bg-transparent px-1 text-sm font-bold text-slate-900 outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={!handle}
          className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-60"
        >
          Claim it →
        </button>
      </form>

      <p
        className={`mt-2 min-h-5 text-xs font-semibold ${
          dark ? "text-white" : "text-slate-700"
        }`}
        aria-live="polite"
      >
        {state === "checking" ? "Checking…" : null}
        {state === "free" ? `✅ godesi.com/${handle} is free — grab it` : null}
        {state === "taken"
          ? `❌ godesi.com/${handle} is taken — try another`
          : null}
        {state === "invalid" ? `⚠️ ${message}` : null}
      </p>
    </div>
  );
}
