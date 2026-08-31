"use client";

import { useEffect, useState } from "react";

type Rail = {
  key: string;
  label: string;
  glyph: string;
  style: string;
  href: (url: string, title: string, message: string) => string;
};

/** The five people actually use for a desi business page, in that order. */
const RAIL: Rail[] = [
  {
    key: "whatsapp",
    label: "WhatsApp",
    glyph: "💬",
    style: "bg-[#25D366] text-white",
    href: (_url, _title, message) => `https://wa.me/?text=${message}`,
  },
  {
    key: "facebook",
    label: "Facebook",
    glyph: "f",
    style: "bg-[#1877F2] text-white",
    href: (url) => `https://www.facebook.com/sharer/sharer.php?u=${url}`,
  },
  {
    key: "x",
    label: "X",
    glyph: "𝕏",
    style: "bg-black text-white",
    href: (url, title) => `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    glyph: "in",
    style: "bg-[#0A66C2] text-white",
    href: (url) => `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
  },
  {
    key: "email",
    label: "Email",
    glyph: "✉",
    style: "bg-slate-500 text-white",
    href: (_url, title, message) => `mailto:?subject=${title}&body=${message}`,
  },
];

/**
 * A sticky share rail down the left edge of a page, so a visitor can pass the
 * page on without scrolling back to the buttons. Desktop only: on a phone the
 * in-page share buttons and the browser's own share sheet do the job, and a
 * floating rail would sit on top of the content.
 */
export function ShareRail({ title }: { title: string }) {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  if (!url) return null;

  const message = `${title} — ${url}`;
  const encoded = {
    url: encodeURIComponent(url),
    title: encodeURIComponent(title),
    message: encodeURIComponent(message),
  };

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
    <aside
      aria-label="Share this page"
      className="fixed left-3 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white/95 p-2 shadow-lg backdrop-blur xl:flex"
    >
      <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
        share
      </span>
      {RAIL.map((network) => (
        <a
          key={network.key}
          href={network.href(encoded.url, encoded.title, encoded.message)}
          target="_blank"
          rel="noreferrer"
          title={`Share on ${network.label}`}
          aria-label={`Share on ${network.label}`}
          className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold leading-none hover:brightness-110 ${network.style}`}
        >
          <span aria-hidden>{network.glyph}</span>
        </a>
      ))}
      <button
        type="button"
        onClick={copy}
        title="Copy link"
        aria-label="Copy link"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 text-sm text-slate-600 hover:bg-slate-50"
      >
        <span aria-hidden>{copied ? "✓" : "🔗"}</span>
      </button>
    </aside>
  );
}
