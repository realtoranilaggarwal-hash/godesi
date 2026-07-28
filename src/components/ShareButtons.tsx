"use client";

import { useEffect, useState } from "react";

type Network = {
  key: string;
  label: string;
  glyph: string;
  style: string;
  href: (url: string, title: string, message: string) => string;
};

const NETWORKS: Network[] = [
  {
    key: "facebook",
    label: "Facebook",
    glyph: "f",
    style: "bg-[#1877F2] text-white",
    href: (url) => `https://www.facebook.com/sharer/sharer.php?u=${url}`,
  },
  {
    key: "x",
    label: "X (Twitter)",
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
    key: "telegram",
    label: "Telegram",
    glyph: "✈",
    style: "bg-[#26A5E4] text-white",
    href: (url, title) => `https://t.me/share/url?url=${url}&text=${title}`,
  },
  {
    key: "reddit",
    label: "Reddit",
    glyph: "👾",
    style: "bg-[#FF4500] text-white",
    href: (url, title) => `https://www.reddit.com/submit?url=${url}&title=${title}`,
  },
  {
    key: "pinterest",
    label: "Pinterest",
    glyph: "P",
    style: "bg-[#E60023] text-white",
    href: (url, title) =>
      `https://pinterest.com/pin/create/button/?url=${url}&description=${title}`,
  },
  {
    key: "tumblr",
    label: "Tumblr",
    glyph: "t",
    style: "bg-[#35465C] text-white",
    href: (url, title) =>
      `https://www.tumblr.com/widgets/share/tool?canonicalUrl=${url}&caption=${title}`,
  },
  {
    key: "line",
    label: "LINE",
    glyph: "L",
    style: "bg-[#06C755] text-white",
    href: (url, title) => `https://social-plugins.line.me/lineit/share?url=${url}&text=${title}`,
  },
  {
    key: "sms",
    label: "SMS",
    glyph: "📱",
    style: "bg-slate-700 text-white",
    href: (_url, _title, message) => `sms:?&body=${message}`,
  },
  {
    key: "email",
    label: "Email",
    glyph: "✉",
    style: "bg-slate-500 text-white",
    href: (_url, title, message) => `mailto:?subject=${title}&body=${message}`,
  },
];

/** Share to any major network, used on profiles, listings, events and rewards. */
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
  const [canNativeShare, setCanNativeShare] = useState(false);
  const message = `${title} — ${url}`;
  const encoded = {
    url: encodeURIComponent(url),
    title: encodeURIComponent(title),
    message: encodeURIComponent(message),
  };

  useEffect(() => {
    setCanNativeShare(typeof navigator.share === "function");
  }, []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  async function nativeShare() {
    try {
      await navigator.share({ title, text: title, url });
    } catch {
      /* the visitor cancelled the sheet */
    }
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex flex-wrap gap-2">
        <a
          href={`https://wa.me/?text=${encoded.message}`}
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

      <div className="flex flex-wrap items-center gap-1.5">
        {NETWORKS.map((network) => (
          <a
            key={network.key}
            href={network.href(encoded.url, encoded.title, encoded.message)}
            target="_blank"
            rel="noreferrer"
            title={`Share on ${network.label}`}
            aria-label={`Share on ${network.label}`}
            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold leading-none hover:brightness-110 ${network.style}`}
          >
            <span aria-hidden>{network.glyph}</span>
          </a>
        ))}
        {canNativeShare ? (
          <button
            type="button"
            onClick={nativeShare}
            className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <span aria-hidden>📤</span> More apps
          </button>
        ) : null}
      </div>
    </div>
  );
}
