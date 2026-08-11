"use client";

import { useState } from "react";

export function CopyButton({
  value,
  label = "Copy",
}: {
  value: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-700 hover:bg-slate-300"
    >
      {copied ? "Copied" : label}
    </button>
  );
}
