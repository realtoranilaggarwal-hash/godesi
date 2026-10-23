"use client";

import { useState } from "react";

/** Native share sheet (phones) with copy-to-clipboard fallback for the card link. */
export function CardShareButton({
  url,
  name,
  className,
}: {
  url: string;
  name: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function share() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: `${name} — GoDesi card`, url });
        return;
      } catch {
        // cancelled or unsupported — fall through to copy
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard blocked — nothing more to do
    }
  }

  return (
    <button type="button" onClick={share} className={className}>
      {copied ? "Link copied!" : "Share card"}
    </button>
  );
}
