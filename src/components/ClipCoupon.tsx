"use client";

import Link from "next/link";
import { CopyButton } from "@/components/CopyButton";

export type ClipCouponProps = {
  title: string;
  details?: string | null;
  code?: string | null;
  /** Shown as "Ends …"; already formatted by the caller. */
  ends?: string | null;
  /** Who is giving the offer, e.g. the business, organiser or seller. */
  issuer?: string | null;
  /** Page the coupon belongs to, printed on the downloaded copy. */
  pageUrl?: string | null;
  action?: { href: string; label: string; external?: boolean } | null;
  header?: React.ReactNode;
};

function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
) {
  const lines: string[] = [];
  for (const paragraph of text.split(/\n+/)) {
    let line = "";
    for (const word of paragraph.split(/\s+/).filter(Boolean)) {
      const next = line ? `${line} ${word}` : word;
      if (ctx.measureText(next).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = next;
      }
    }
    if (line) lines.push(line);
  }
  if (lines.length > maxLines) {
    lines.length = maxLines;
    lines[maxLines - 1] = `${lines[maxLines - 1].replace(/\s+\S*$/, "")}…`;
  }
  return lines;
}

function downloadCoupon({
  title,
  details,
  code,
  ends,
  issuer,
  pageUrl,
}: ClipCouponProps) {
  const width = 1000;
  const height = 560;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "#fff1f2";
  ctx.fillRect(30, 30, width - 60, height - 60);
  ctx.setLineDash([18, 12]);
  ctx.lineWidth = 4;
  ctx.strokeStyle = "#e11d48";
  ctx.strokeRect(30, 30, width - 60, height - 60);
  ctx.setLineDash([]);
  ctx.font = "44px sans-serif";
  ctx.fillStyle = "#e11d48";
  ctx.fillText("✂", 50, 44);

  const sans = "Helvetica, Arial, sans-serif";
  let y = 100;
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#9f1239";
  ctx.font = `bold 24px ${sans}`;
  ctx.fillText(
    (issuer ? `COUPON · ${issuer}` : "COUPON").toUpperCase().slice(0, 60),
    70,
    y,
  );

  y += 56;
  ctx.fillStyle = "#0f172a";
  ctx.font = `bold 44px ${sans}`;
  for (const line of wrapLines(ctx, title, width - 140, 2)) {
    ctx.fillText(line, 70, y);
    y += 54;
  }

  if (code) {
    y += 10;
    ctx.font = `bold 52px "Courier New", monospace`;
    const boxWidth = Math.min(width - 140, ctx.measureText(code).width + 60);
    ctx.setLineDash([10, 8]);
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#be123c";
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(70, y, boxWidth, 80);
    ctx.strokeRect(70, y, boxWidth, 80);
    ctx.setLineDash([]);
    ctx.fillStyle = "#9f1239";
    ctx.fillText(code, 100, y + 58);
    y += 112;
  }

  if (details) {
    ctx.fillStyle = "#334155";
    ctx.font = `24px ${sans}`;
    for (const line of wrapLines(ctx, details, width - 140, 3)) {
      ctx.fillText(line, 70, y);
      y += 32;
    }
  }

  ctx.fillStyle = "#64748b";
  ctx.font = `22px ${sans}`;
  const footer = [ends, pageUrl ?? "godesi.com"].filter(Boolean).join("  ·  ");
  ctx.fillText(footer, 70, height - 60);

  const link = document.createElement("a");
  link.download = `godesi-coupon-${(code || title)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40)}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

/** A dashed, scissor-marked coupon buyers can copy or save as an image. */
export function ClipCoupon(props: ClipCouponProps) {
  const { title, details, code, ends, action, header } = props;
  return (
    <div className="relative flex h-full flex-col gap-2 rounded-2xl border-2 border-dashed border-rose-400 bg-rose-50/70 p-4 pt-5">
      <span
        aria-hidden
        className="absolute -top-3.5 left-5 bg-white px-1 text-lg leading-none text-rose-500"
      >
        ✂️
      </span>
      {header}
      <p className="font-bold text-rose-900">🏷️ {title}</p>
      {details ? (
        <p className="line-clamp-4 whitespace-pre-line text-sm text-slate-700">
          {details}
        </p>
      ) : null}
      {code ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-lg border-2 border-dashed border-rose-300 bg-white px-3 py-1 font-mono text-base font-bold tracking-widest text-rose-800">
            {code}
          </span>
          <CopyButton value={code} label="Copy code" />
        </div>
      ) : null}
      <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-xs">
        {action ? (
          action.external ? (
            <a
              href={action.href}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="font-semibold text-indigo-700 hover:underline"
            >
              {action.label}
            </a>
          ) : (
            <Link
              href={action.href}
              className="font-semibold text-indigo-700 hover:underline"
            >
              {action.label}
            </Link>
          )
        ) : null}
        <button
          type="button"
          onClick={() => downloadCoupon(props)}
          className="font-semibold text-rose-700 hover:underline"
        >
          ⬇ Download coupon
        </button>
        {ends ? <span className="text-slate-500">{ends}</span> : null}
      </div>
    </div>
  );
}
