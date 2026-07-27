"use client";

import { useState } from "react";

/** Shares a deep link to one section of a page — handy for pasting a single FAQ answer. */
export function ShareAnchor({
  anchor,
  title,
}: {
  anchor: string;
  title: string;
}) {
  const [copied, setCopied] = useState(false);

  const link = () =>
    typeof window === "undefined"
      ? ""
      : `${window.location.origin}${window.location.pathname}#${anchor}`;

  const copy = async () => {
    await navigator.clipboard.writeText(`${title} — ${link()}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const whatsapp = () => {
    const text = encodeURIComponent(`${title}\n${link()}`);
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener");
  };

  return (
    <div className="mt-3 flex items-center gap-3 text-xs font-semibold">
      <button
        type="button"
        onClick={copy}
        className="text-slate-500 hover:text-slate-900"
      >
        {copied ? "Link copied ✓" : "🔗 Copy link"}
      </button>
      <button
        type="button"
        onClick={whatsapp}
        className="text-emerald-600 hover:text-emerald-700"
      >
        💬 Share on WhatsApp
      </button>
    </div>
  );
}
