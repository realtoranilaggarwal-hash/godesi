"use client";

import { useState } from "react";
import type { BadgeLevel } from "@/lib/badge";
import { badgeAlt } from "@/lib/badge";

type Props = {
  slug: string;
  name: string;
  level: BadgeLevel;
  origin: string;
};

const SIZES = [
  { id: "wide", label: "200 × 64", width: 200, height: 64 },
  { id: "small", label: "120 × 40", width: 120, height: 40 },
  { id: "square", label: "160 × 160", width: 160, height: 160 },
] as const;

type SizeId = (typeof SIZES)[number]["id"];

function query(size: SizeId, theme: "light" | "dark") {
  const params = new URLSearchParams();
  if (size !== "wide") params.set("size", size);
  if (theme === "dark") params.set("style", "dark");
  const value = params.toString();
  return value ? `?${value}` : "";
}

/**
 * Copy-paste snippet a business puts on its own website. The image is generated
 * from the live card, so the badge downgrades itself if the card is unclaimed or
 * pulled, and the link goes to the public verification page — a trust mark
 * nobody can check is worth nothing.
 */
export function BadgeEmbed({ slug, name, level, origin }: Props) {
  const [size, setSize] = useState<SizeId>("wide");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [format, setFormat] = useState<"svg" | "png">("svg");
  const [linkTo, setLinkTo] = useState<"verify" | "card">("verify");
  const [copied, setCopied] = useState("");

  const dimensions = SIZES.find((option) => option.id === size) ?? SIZES[0];
  const imageUrl = `${origin}/api/badge/${slug}${format === "png" ? "/png" : ""}${query(size, theme)}`;
  const href = linkTo === "verify" ? `${origin}/verify/${slug}` : `${origin}/b/${slug}`;
  const alt = badgeAlt(level, name);

  const html = `<a href="${href}" target="_blank" rel="noopener">\n  <img src="${imageUrl}" alt="${alt}" width="${dimensions.width}" height="${dimensions.height}" loading="lazy">\n</a>`;
  const markdown = `[![${alt}](${imageUrl})](${href})`;

  const copy = (value: string, which: string) => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(which);
      setTimeout(() => setCopied(""), 2000);
    });
  };

  const chip = (active: boolean) =>
    `rounded-full px-3 py-1 text-xs font-semibold ${
      active
        ? "bg-slate-900 text-white"
        : "border border-slate-300 text-slate-600 hover:bg-slate-50"
    }`;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="rounded-2xl bg-slate-50 p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={alt}
            width={dimensions.width}
            height={dimensions.height}
          />
        </div>
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1">
            {SIZES.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setSize(option.id)}
                className={chip(size === option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1">
            {(["light", "dark"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setTheme(option)}
                className={chip(theme === option)}
              >
                {option === "light" ? "Light" : "Dark"}
              </button>
            ))}
            {(["svg", "png"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setFormat(option)}
                className={chip(format === option)}
              >
                {option.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1">
            {(
              [
                { id: "verify", label: "Link to verification" },
                { id: "card", label: "Link to my card" },
              ] as const
            ).map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setLinkTo(option.id)}
                className={chip(linkTo === option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-500">
        PNG works everywhere — Wix, Squarespace, GoDaddy, Word and most email
        clients refuse a remote SVG. Everything else can use the sharper SVG.
      </p>

      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
          HTML — website, WordPress (paste into a Custom HTML block), Shopify
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
          Image address — for builders with an “insert image from URL” box
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <code className="min-w-0 flex-1 truncate rounded-xl bg-slate-100 px-3 py-2 text-xs text-slate-700">
            {imageUrl}
          </code>
          <button
            type="button"
            onClick={() => copy(imageUrl, "img")}
            className="rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-semibold hover:bg-slate-50"
          >
            {copied === "img" ? "Copied ✓" : "Copy"}
          </button>
          <a
            href={`${origin}/api/badge/${slug}/png${query(size, theme)}`}
            download={`godesi-badge-${slug}.png`}
            className="rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-semibold hover:bg-slate-50"
          >
            Download PNG
          </a>
        </div>
      </div>

      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
          Markdown — GitHub, Notion, blogs
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
          Plain link — WhatsApp, Instagram bio, email signature
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <code className="min-w-0 flex-1 truncate rounded-xl bg-slate-100 px-3 py-2 text-xs text-slate-700">
            {href}
          </code>
          <button
            type="button"
            onClick={() => copy(href, "url")}
            className="rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-semibold hover:bg-slate-50"
          >
            {copied === "url" ? "Copied ✓" : "Copy link"}
          </button>
        </div>
      </div>
    </div>
  );
}
