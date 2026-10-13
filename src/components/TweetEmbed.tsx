"use client";

import Script from "next/script";
import { useRef } from "react";

declare global {
  interface Window {
    twttr?: { widgets?: { load: (element?: HTMLElement) => void } };
  }
}

/**
 * One tweet, drawn by X's own widget so it looks and links exactly as on X.
 * Until the widget loads (or if a blocker stops it) the quote and link show.
 */
export function TweetEmbed({
  url,
  author,
  handle,
  text,
}: {
  url: string;
  author: string;
  handle: string | null;
  text: string;
}) {
  const box = useRef<HTMLDivElement>(null);

  return (
    <div ref={box} className="min-w-0 [&_.twitter-tweet]:!my-0">
      <blockquote
        className="twitter-tweet rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700"
        data-dnt="true"
      >
        <p className="whitespace-pre-line">{text}</p>
        <span className="mt-2 block text-xs text-slate-500">
          — {author}
          {handle ? ` (${handle})` : ""}{" "}
          <a href={url} className="font-semibold text-indigo-600">
            View on X ↗
          </a>
        </span>
      </blockquote>
      <Script
        src="https://platform.twitter.com/widgets.js"
        strategy="lazyOnload"
        onReady={() => {
          if (box.current) window.twttr?.widgets?.load(box.current);
        }}
      />
    </div>
  );
}
