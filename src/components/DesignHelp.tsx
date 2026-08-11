"use client";

import { useState } from "react";

function promptFor(width: number, height: number) {
  return `Design a web banner advert for my business, exactly ${width} x ${height} pixels (PNG or JPG, under 500 KB).
Business: [your business name] — [what you sell] in [your city].
Headline: [short offer, max 5 words]. Below it: [one supporting line, max 8 words].
Include my logo (I will upload it) and a clear button that says "[Call to action]".
Style: bright, colourful and friendly, easy to read on a phone, keep all text well inside the edges, no small print.
Give me the finished image at exactly ${width} x ${height} pixels.`;
}

/**
 * Most advertisers have no creative. Rather than lose the sale we hand them a
 * ready-made prompt and open ChatGPT so they can generate the banner themselves.
 */
export function DesignHelp({
  size,
}: {
  size: { width: number; height: number };
}) {
  const [copied, setCopied] = useState(false);
  const prompt = promptFor(size.width, size.height);

  return (
    <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-3">
      <p className="text-sm font-bold text-indigo-900">
        No banner yet? Get one designed in a minute
      </p>
      <p className="mt-1 text-xs text-indigo-700">
        Open ChatGPT, paste the prompt below, fill in the details in brackets, then
        download the image and upload it here.
      </p>

      <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap break-words rounded-xl bg-white p-3 text-xs text-slate-700">
        {prompt}
      </pre>

      <div className="mt-2 flex flex-wrap gap-2">
        <a
          href="https://chatgpt.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
        >
          Open ChatGPT →
        </a>
        <button
          type="button"
          onClick={() => {
            void navigator.clipboard.writeText(prompt).then(() => setCopied(true));
          }}
          className="rounded-xl border border-indigo-300 px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-white"
        >
          {copied ? "Prompt copied" : "Copy the prompt"}
        </button>
      </div>
    </div>
  );
}
