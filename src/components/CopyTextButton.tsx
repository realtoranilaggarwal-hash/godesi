"use client";

import { useState } from "react";

/** Copies `text` to the clipboard and flashes "Copied!" — for admin desks. */
export function CopyTextButton({
  text,
  className,
  children,
}: {
  text: string;
  className?: string;
  children: React.ReactNode;
}) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      className={className}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
        } catch {
          // Clipboard blocked (non-secure context) — fall back to a selection hack.
          const el = document.createElement("textarea");
          el.value = text;
          document.body.appendChild(el);
          el.select();
          document.execCommand("copy");
          el.remove();
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? "✓ Copied!" : children}
    </button>
  );
}
