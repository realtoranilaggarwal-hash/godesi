"use client";

import { useState } from "react";
import type { GigTier } from "@prisma/client";
import { buyGigAction } from "@/app/actions/gigs";
import { ActionForm } from "@/components/gigs/GigForms";
import { Field, inputClass } from "@/components/ui";
import { GIG_FEE_USD, includesList, usd } from "@/lib/gigs-shared";

export type PackageView = {
  tier: GigTier;
  name: string;
  description: string;
  includes: string | null;
  priceMinor: number;
  deliveryDays: number;
  revisions: number;
};

/** Seller's own pictures: one large, the rest as thumbnails to switch. */
export function Gallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0);
  if (!images.length) return null;
  const current = images[Math.min(active, images.length - 1)];
  return (
    <div className="space-y-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={current}
        alt={title}
        className="aspect-[16/10] w-full rounded-2xl border border-slate-200 bg-slate-100 object-cover"
      />
      {images.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((url, i) => (
            <button
              key={url}
              type="button"
              onClick={() => setActive(i)}
              className={`shrink-0 overflow-hidden rounded-xl border-2 ${
                i === active ? "border-indigo-500" : "border-transparent"
              }`}
              aria-label={`Picture ${i + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-16 w-24 object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/**
 * The sticky order box: tabs for each package, what it includes, and the brief
 * + pay form for the one selected. Mirrors the package the server will charge.
 */
export function OrderBox({
  slug,
  packages,
  canOrder,
}: {
  slug: string;
  packages: PackageView[];
  canOrder: boolean;
}) {
  const [tier, setTier] = useState<GigTier>(packages[0]?.tier ?? "BASIC");
  const pkg = packages.find((p) => p.tier === tier) ?? packages[0];
  if (!pkg) return null;
  const includes = includesList(pkg.includes);

  return (
    <div className="space-y-3">
      {packages.length > 1 ? (
        <div className="grid grid-cols-3 rounded-xl border border-slate-200 p-1 text-sm font-semibold">
          {packages.map((p) => (
            <button
              key={p.tier}
              type="button"
              onClick={() => setTier(p.tier)}
              className={`rounded-lg px-2 py-1.5 ${
                p.tier === pkg.tier
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      ) : null}

      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-bold">{pkg.name}</p>
          <p className="text-sm text-slate-600">{pkg.description}</p>
        </div>
        <span className="shrink-0 text-3xl font-black text-slate-900">
          {usd(pkg.priceMinor)}
        </span>
      </div>

      <div className="flex flex-wrap gap-3 text-sm font-semibold text-slate-700">
        <span>
          ⏱ {pkg.deliveryDays}-day delivery
        </span>
        <span>
          ↻ {pkg.revisions === 0 ? "No" : pkg.revisions} revision
          {pkg.revisions === 1 ? "" : "s"}
        </span>
      </div>

      {includes.length ? (
        <ul className="space-y-1 text-sm text-slate-700">
          {includes.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="text-emerald-600">✓</span>
              {item}
            </li>
          ))}
        </ul>
      ) : null}

      {canOrder ? (
        <ActionForm
          action={buyGigAction}
          submitLabel={`Continue · ${usd(pkg.priceMinor)}`}
          pendingLabel="Opening checkout…"
        >
          <input type="hidden" name="slug" value={slug} />
          <input type="hidden" name="tier" value={pkg.tier} />
          <Field
            label="What do you need?"
            hint="Dates, names, links, files (share a Drive link) — everything the seller needs to start."
            required
          >
            <textarea
              name="brief"
              required
              minLength={20}
              rows={4}
              className={inputClass}
              placeholder="e.g. Date of birth 12 Mar 1990, 4:20am, Jaipur. Looking for career guidance for the next two years."
            />
          </Field>
          <p className="text-xs text-slate-500">
            Paid by card through Stripe and held by Godesi until you confirm the
            work. Seller receives {usd(pkg.priceMinor - GIG_FEE_USD * 100)}; full
            refund if the seller declines or staff side with you.
          </p>
        </ActionForm>
      ) : null}
    </div>
  );
}
