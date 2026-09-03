"use client";

import { useState } from "react";
import type { GigTier } from "@prisma/client";
import { ImageDropzone } from "@/components/ImageDropzone";
import { Button, Field, inputClass } from "@/components/ui";
import {
  GIG_MAX_USD,
  GIG_MIN_USD,
  MAX_DELIVERY_DAYS,
  MAX_GIG_FAQ,
  MAX_GIG_IMAGES,
  MAX_GIG_TAGS,
  MAX_REVISIONS,
  TIERS,
  TIER_LABEL,
  type GigFaq,
} from "@/lib/gigs-shared";

export type EditablePackage = {
  tier: GigTier;
  name: string;
  description: string;
  includes: string | null;
  priceMinor: number;
  deliveryDays: number;
  revisions: number;
};

export type EditableGig = {
  title: string;
  description: string;
  tags: string[];
  images: string[];
  faq: GigFaq[];
  packages: EditablePackage[];
};

const TIER_HINT: Record<GigTier, string> = {
  BASIC: "The starter — required.",
  STANDARD: "More scope or a faster turnaround.",
  PREMIUM: "Everything, priority, most revisions.",
};

function PackageFields({
  tier,
  pkg,
  enabled,
  onToggle,
}: {
  tier: GigTier;
  pkg?: EditablePackage;
  enabled: boolean;
  onToggle?: (on: boolean) => void;
}) {
  const prefix = `pkg_${tier}_`;
  return (
    <div
      className={`rounded-2xl border p-4 ${
        enabled ? "border-indigo-200 bg-indigo-50/40" : "border-dashed border-slate-300"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="font-bold">{TIER_LABEL[tier]}</p>
          <p className="text-xs text-slate-500">{TIER_HINT[tier]}</p>
        </div>
        {onToggle ? (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name={`${prefix}on`}
              value="1"
              checked={enabled}
              onChange={(e) => onToggle(e.target.checked)}
            />
            Offer this
          </label>
        ) : null}
      </div>
      {enabled ? (
        <div className="mt-3 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Package name" required>
              <input
                name={`${prefix}name`}
                required
                minLength={2}
                maxLength={40}
                defaultValue={pkg?.name ?? TIER_LABEL[tier]}
                className={inputClass}
              />
            </Field>
            <Field label={`Price in US$ (${GIG_MIN_USD}–${GIG_MAX_USD})`} required>
              <input
                name={`${prefix}priceUsd`}
                type="number"
                required
                min={GIG_MIN_USD}
                max={GIG_MAX_USD}
                step={1}
                defaultValue={
                  pkg ? pkg.priceMinor / 100 : tier === "BASIC" ? 25 : tier === "STANDARD" ? 50 : 100
                }
                className={inputClass}
              />
            </Field>
          </div>
          <Field label="One line on what this package gets them" required>
            <input
              name={`${prefix}description`}
              required
              minLength={10}
              maxLength={300}
              defaultValue={pkg?.description}
              className={inputClass}
            />
          </Field>
          <Field label="What's included" hint="One item per line, e.g. “PDF report”, “30-min call”.">
            <textarea
              name={`${prefix}includes`}
              maxLength={1000}
              rows={3}
              defaultValue={pkg?.includes ?? ""}
              className={inputClass}
            />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={`Delivery in days (1–${MAX_DELIVERY_DAYS})`} required>
              <input
                name={`${prefix}deliveryDays`}
                type="number"
                required
                min={1}
                max={MAX_DELIVERY_DAYS}
                step={1}
                defaultValue={pkg?.deliveryDays ?? 3}
                className={inputClass}
              />
            </Field>
            <Field label={`Revisions (0–${MAX_REVISIONS})`}>
              <input
                name={`${prefix}revisions`}
                type="number"
                min={0}
                max={MAX_REVISIONS}
                step={1}
                defaultValue={pkg?.revisions ?? 1}
                className={inputClass}
              />
            </Field>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/**
 * Everything a seller fills in for a gig: the pitch, up to three packages,
 * their own pictures, tags and an FAQ. Rendered inside ActionForm so the
 * server action receives one FormData.
 */
export function GigEditor({ gig }: { gig?: EditableGig }) {
  const [images, setImages] = useState<string[]>(gig?.images ?? []);
  const [faq, setFaq] = useState<GigFaq[]>(
    gig?.faq.length ? gig.faq : [{ q: "", a: "" }],
  );
  const [enabled, setEnabled] = useState<Record<GigTier, boolean>>({
    BASIC: true,
    STANDARD: gig?.packages.some((p) => p.tier === "STANDARD") ?? false,
    PREMIUM: gig?.packages.some((p) => p.tier === "PREMIUM") ?? false,
  });

  return (
    <div className="space-y-5">
      <Field label="Title" required hint="Say the outcome: “Kundli reading with 30-min call”, not “Astrology”.">
        <input
          name="title"
          required
          minLength={6}
          maxLength={80}
          defaultValue={gig?.title}
          className={inputClass}
        />
      </Field>
      <Field label="About this gig" required hint="Your own words. Who it is for, what you need from them, what they get back.">
        <textarea
          name="description"
          required
          minLength={40}
          maxLength={3000}
          rows={5}
          defaultValue={gig?.description}
          className={inputClass}
        />
      </Field>

      <section className="space-y-3">
        <h3 className="font-bold">Packages</h3>
        <p className="text-xs text-slate-500">
          Buyers pick one. Basic is required; add Standard and Premium to sell
          more for more. Every package stays between ${GIG_MIN_USD} and $
          {GIG_MAX_USD}.
        </p>
        {TIERS.map((tier) => (
          <PackageFields
            key={tier}
            tier={tier}
            pkg={gig?.packages.find((p) => p.tier === tier)}
            enabled={enabled[tier]}
            onToggle={
              tier === "BASIC"
                ? undefined
                : (on) => setEnabled((prev) => ({ ...prev, [tier]: on }))
            }
          />
        ))}
      </section>

      <section className="space-y-2">
        <h3 className="font-bold">Your pictures</h3>
        <p className="text-xs text-slate-500">
          Up to {MAX_GIG_IMAGES} of your own work — samples, screenshots, you at
          work. The first is the cover. Nothing copied from another site.
        </p>
        {images.length ? (
          <div className="flex flex-wrap gap-2">
            {images.map((url, i) => (
              <div key={url} className="relative">
                <input type="hidden" name="images" value={url} />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt=""
                  className="h-20 w-28 rounded-xl border border-slate-200 object-cover"
                />
                {i === 0 ? (
                  <span className="absolute left-1 top-1 rounded bg-black/60 px-1.5 text-[10px] font-bold text-white">
                    Cover
                  </span>
                ) : null}
                <button
                  type="button"
                  onClick={() => setImages((prev) => prev.filter((u) => u !== url))}
                  className="absolute -right-1.5 -top-1.5 h-5 w-5 rounded-full bg-rose-600 text-xs font-bold text-white"
                  aria-label="Remove picture"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        ) : null}
        {images.length < MAX_GIG_IMAGES ? (
          <ImageDropzone
            purpose="gig"
            multiple
            label="Add a picture of your work"
            onUploaded={(url) =>
              setImages((prev) =>
                prev.length < MAX_GIG_IMAGES && !prev.includes(url) ? [...prev, url] : prev,
              )
            }
          />
        ) : null}
      </section>

      <Field
        label="Tags"
        hint={`Up to ${MAX_GIG_TAGS}, separated by commas — e.g. “kundli, astrology, marriage match”. Used for search and similar gigs.`}
      >
        <input
          name="tags"
          maxLength={200}
          defaultValue={gig?.tags.join(", ")}
          className={inputClass}
        />
      </Field>

      <section className="space-y-2">
        <h3 className="font-bold">FAQ</h3>
        <p className="text-xs text-slate-500">
          Questions buyers ask before ordering. Up to {MAX_GIG_FAQ}; leave blank to skip.
        </p>
        {faq.map((row, i) => (
          <div key={i} className="grid gap-2 rounded-xl border border-slate-200 p-3 sm:grid-cols-[1fr_2fr_auto]">
            <input
              name="faq_q"
              placeholder="Question"
              maxLength={160}
              value={row.q}
              onChange={(e) =>
                setFaq((prev) => prev.map((r, j) => (j === i ? { ...r, q: e.target.value } : r)))
              }
              className={inputClass}
            />
            <input
              name="faq_a"
              placeholder="Answer"
              maxLength={600}
              value={row.a}
              onChange={(e) =>
                setFaq((prev) => prev.map((r, j) => (j === i ? { ...r, a: e.target.value } : r)))
              }
              className={inputClass}
            />
            <Button
              type="button"
              variant="ghost"
              className="!py-1.5 text-rose-600"
              onClick={() => setFaq((prev) => (prev.length > 1 ? prev.filter((_, j) => j !== i) : [{ q: "", a: "" }]))}
            >
              Remove
            </Button>
          </div>
        ))}
        {faq.length < MAX_GIG_FAQ ? (
          <Button
            type="button"
            variant="secondary"
            className="!py-1.5"
            onClick={() => setFaq((prev) => [...prev, { q: "", a: "" }])}
          >
            + Add a question
          </Button>
        ) : null}
      </section>
    </div>
  );
}
