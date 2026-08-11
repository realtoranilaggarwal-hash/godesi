"use client";

import { useState } from "react";

/**
 * Share a single station or channel. The link deep-links back to Godesi with the
 * stream pre-selected, so every share brings the visitor onto the site.
 */
export function LiveShareButton({
  path,
  label,
  kind,
}: {
  path: string;
  label: string;
  kind: "radio" | "tv";
}) {
  const [copied, setCopied] = useState(false);
  const url =
    typeof window === "undefined" ? path : `${window.location.origin}${path}`;
  const message =
    kind === "radio"
      ? `🎧 Listening to ${label} free on Godesi — ${url}`
      : `📺 Watching ${label} live free on Godesi — ${url}`;

  return (
    <span className="flex items-center gap-1.5">
      <a
        href={`https://wa.me/?text=${encodeURIComponent(message)}`}
        target="_blank"
        rel="noreferrer"
        className="rounded-lg bg-[#25D366] px-2.5 py-1 text-xs font-bold text-white hover:brightness-95"
      >
        📤 WhatsApp
      </a>
      <button
        type="button"
        onClick={async () => {
          if (navigator.share) {
            try {
              await navigator.share({ title: label, text: message, url });
              return;
            } catch {
              /* the visitor dismissed the sheet — fall through to copying */
            }
          }
          await navigator.clipboard.writeText(url);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 2000);
        }}
        className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-50"
      >
        {copied ? "Link copied ✓" : "🔗 Share"}
      </button>
    </span>
  );
}
