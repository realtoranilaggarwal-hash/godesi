"use client";

import { useState } from "react";

/** WhatsApp share plus copy-link, used on profiles, listings and events. */
export function ShareButtons({
  url,
  title,
  className = "",
}: {
  url: string;
  title: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const message = `${title} — ${url}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      <a
        href={`https://wa.me/?text=${encodeURIComponent(message)}`}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1 rounded-xl bg-[#25D366] px-3 py-2 text-sm font-semibold text-white hover:brightness-95"
      >
        <span aria-hidden>💬</span> Share on WhatsApp
      </a>
      <button
        type="button"
        onClick={copy}
        className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
      >
        <span aria-hidden>🔗</span> {copied ? "Link copied!" : "Copy link"}
      </button>
    </div>
  );
}
