"use client";

import { useState } from "react";

/**
 * Copy-paste snippet a business puts on its own website. The link back to the
 * listing is what search engines follow, so the badge doubles as marketing and
 * as an honest, business-owned backlink.
 */
export function BadgeEmbed({ listingUrl }: { listingUrl: string }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [copied, setCopied] = useState("");

  const origin = new URL(listingUrl).origin;
  const badgeUrl = `${origin}/api/badge${theme === "dark" ? "?style=dark" : ""}`;
  const html = `<a href="${listingUrl}" target="_blank" rel="noopener">\n  <img src="${badgeUrl}" alt="Listed on Godesi" width="200" height="64" loading="lazy">\n</a>`;
  const markdown = `[![Listed on Godesi](${badgeUrl})](${listingUrl})`;

  const copy = (value: string, which: string) => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(which);
      setTimeout(() => setCopied(""), 2000);
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={badgeUrl} alt="Listed on Godesi" width={200} height={64} />
        <div className="flex gap-1 text-xs font-semibold">
          {(["light", "dark"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setTheme(option)}
              className={`rounded-full px-3 py-1 ${
                theme === option
                  ? "bg-slate-900 text-white"
                  : "border border-slate-300 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {option === "light" ? "Light" : "Dark"}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
          HTML — for your website
        </p>
        <pre className="mt-1 overflow-x-auto rounded-xl bg-slate-900 p-3 text-[11px] leading-relaxed text-slate-100">
          {html}
        </pre>
        <button
          type="button"
          onClick={() => copy(html, "html")}
          className="mt-1 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
        >
          {copied === "html" ? "Copied ✓" : "Copy HTML"}
        </button>
      </div>

      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
          Markdown — for GitHub, Notion, blogs
        </p>
        <pre className="mt-1 overflow-x-auto rounded-xl bg-slate-100 p-3 text-[11px] text-slate-700">
          {markdown}
        </pre>
        <button
          type="button"
          onClick={() => copy(markdown, "md")}
          className="mt-1 rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-semibold hover:bg-slate-50"
        >
          {copied === "md" ? "Copied ✓" : "Copy Markdown"}
        </button>
      </div>

      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
          Plain link — for WhatsApp, Instagram bio, email signature
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <code className="min-w-0 flex-1 truncate rounded-xl bg-slate-100 px-3 py-2 text-xs text-slate-700">
            {listingUrl}
          </code>
          <button
            type="button"
            onClick={() => copy(listingUrl, "url")}
            className="rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-semibold hover:bg-slate-50"
          >
            {copied === "url" ? "Copied ✓" : "Copy link"}
          </button>
        </div>
      </div>
    </div>
  );
}
