"use client";

import { useState } from "react";

/** WhatsApp share and copy-link for one Chatter post. */
export function ChatterShare({ url, text }: { url: string; text: string }) {
  const [copied, setCopied] = useState(false);
  const whatsapp = `https://wa.me/?text=${encodeURIComponent(`${text} — ${url}`)}`;

  return (
    <span className="inline-flex items-center gap-3">
      <a
        href={whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs font-semibold text-emerald-700 hover:underline"
      >
        WhatsApp
      </a>
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } catch {
            window.prompt("Copy this link", url);
          }
        }}
        className="text-xs font-semibold text-slate-500 hover:text-slate-800"
      >
        {copied ? "Copied ✓" : "🔗 Copy link"}
      </button>
    </span>
  );
}
