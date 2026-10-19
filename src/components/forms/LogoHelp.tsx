"use client";

import Link from "next/link";
import { useState } from "react";

/** Tip for members without a square logo: a ready ChatGPT prompt, or ask GoDesi. */
export function LogoHelp({ name }: { name: string }) {
  const [copied, setCopied] = useState(false);
  const prompt = `Design a simple, modern square logo (1:1, 1024×1024) for "${name}". Clean flat style, bold readable text, plain background, no small details, looks good as a small round profile picture.`;

  return (
    <details className="rounded-xl bg-amber-50 p-2 text-xs text-amber-900 ring-1 ring-amber-200">
      <summary className="cursor-pointer font-semibold">
        No square logo? Make one free →
      </summary>
      <p className="mt-2">
        Long rectangle logos get cut off in the circle. Copy this into ChatGPT
        and upload the picture it makes:
      </p>
      <p className="mt-1 rounded-lg bg-white p-2 text-slate-700 ring-1 ring-amber-200">
        {prompt}
      </p>
      <div className="mt-2 flex flex-wrap gap-2 font-semibold">
        <button
          type="button"
          onClick={() => {
            void navigator.clipboard
              .writeText(prompt)
              .then(() => setCopied(true));
          }}
          className="rounded-lg bg-amber-500 px-2.5 py-1 text-white hover:bg-amber-600"
        >
          {copied ? "Copied ✓" : "Copy prompt"}
        </button>
        <a
          href="https://chatgpt.com/"
          target="_blank"
          rel="noopener"
          className="rounded-lg bg-white px-2.5 py-1 ring-1 ring-amber-300 hover:bg-amber-100"
        >
          Open ChatGPT
        </a>
        <Link
          href="/contact?topic=Make%20a%20logo%20for%20me"
          className="rounded-lg bg-white px-2.5 py-1 ring-1 ring-amber-300 hover:bg-amber-100"
        >
          Ask GoDesi to make one for me
        </Link>
      </div>
    </details>
  );
}
