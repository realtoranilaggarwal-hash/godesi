"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui";

export function QrCard({ slug, shareUrl }: { slug: string; shareUrl: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "Godesi profile", url: shareUrl });
        return;
      } catch {
        // fall through to copy
      }
    }
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <Image
        src={`/api/qr/${slug}`}
        alt={`QR code for ${slug}`}
        width={200}
        height={200}
        unoptimized
        className="rounded-xl border border-slate-200"
      />
      <div className="flex w-full flex-col gap-2 sm:flex-row">
        <a
          href={`/api/qr/${slug}?download=1`}
          className="inline-flex flex-1 items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Download QR
        </a>
        <Button variant="secondary" className="flex-1" onClick={share}>
          {copied ? "Link copied!" : "Share profile"}
        </Button>
      </div>
    </div>
  );
}
