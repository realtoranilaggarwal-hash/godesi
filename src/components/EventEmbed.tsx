"use client";

import { useState } from "react";

/**
 * The snippet an organiser pastes on their own website so their visitors can
 * book without leaving it. Every click lands on Godesi, so giving it away is
 * cheaper marketing than an advert.
 */
export function EventEmbed({
  eventUrl,
  title,
}: {
  eventUrl: string;
  title: string;
}) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [copied, setCopied] = useState(false);

  const src = `${eventUrl}/embed${theme === "dark" ? "?theme=dark" : ""}`;
  const html = `<iframe src="${src}" width="320" height="260" style="border:0;max-width:100%" loading="lazy" title="${title.replace(
    /"/g,
    "&quot;",
  )} — tickets on Godesi"></iframe>`;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
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
        <a
          href={src}
          target="_blank"
          rel="noreferrer noopener"
          className="text-xs font-semibold text-indigo-600 hover:underline"
        >
          Preview →
        </a>
      </div>

      <iframe
        src={src}
        width={320}
        height={260}
        style={{ border: 0, maxWidth: "100%" }}
        title="Embed preview"
      />

      <pre className="overflow-x-auto rounded-xl bg-slate-900 p-3 text-[11px] leading-relaxed text-slate-100">
        {html}
      </pre>
      <button
        type="button"
        onClick={() => {
          navigator.clipboard.writeText(html).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          });
        }}
        className="rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
      >
        {copied ? "Copied ✓" : "Copy the code"}
      </button>
      <p className="text-xs text-slate-500">
        Works on WordPress, Wix, Squarespace and plain HTML — paste it into a
        page as an HTML/embed block. It updates itself when the event changes.
      </p>
    </div>
  );
}
