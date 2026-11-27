"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { startMarketingShopCheckout } from "@/app/actions/marketingShop";
import {
  MARKETING_CATEGORIES,
  MARKETING_PRODUCTS,
  type MarketingCategory,
  MARKETING_SHOP_ORDER_FOR,
  type MarketingShopOrderFor,
  usd,
} from "@/lib/marketingShop";
import type { MarketingShopMember } from "@/lib/marketingShopMember";

const CART_KEY = "godesi-marketing-cart";
const DESIGNS_KEY = "godesi-marketing-designs";
const input = "w-full rounded-xl border border-slate-300 px-3 py-2 text-sm";

export function MarketingShopOrderForm({
  orderFor,
  category: initialCategory,
  member,
}: {
  orderFor: MarketingShopOrderFor;
  category?: MarketingCategory;
  member: MarketingShopMember | null;
}) {
  const [qty, setQty] = useState<Record<string, number>>({});
  const [designs, setDesigns] = useState<Record<string, string>>({});
  const [restored, setRestored] = useState(false);
  const [zoom, setZoom] = useState<{ src: string; alt: string } | null>(null);
  const zoomClose = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!zoom) return;
    const opener = document.activeElement as HTMLElement | null;
    zoomClose.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoom(null);
      // Close is the only control in the lightbox, so Tab stays on it.
      if (e.key === "Tab") {
        e.preventDefault();
        zoomClose.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      opener?.focus();
    };
  }, [zoom]);
  const loginNext = encodeURIComponent(`/marketing-shop${orderFor === "shop" ? "" : `?for=${orderFor}`}#order`);
  // Keep the cart across the log-in / join round trip.
  useEffect(() => {
    try {
      if (/[?&](paid|requested)=/.test(window.location.search)) {
        localStorage.removeItem(CART_KEY);
        localStorage.removeItem(DESIGNS_KEY);
      } else {
        const saved = JSON.parse(localStorage.getItem(CART_KEY) ?? "{}");
        if (saved && typeof saved === "object") setQty(saved);
        const savedDesigns = JSON.parse(localStorage.getItem(DESIGNS_KEY) ?? "{}");
        if (savedDesigns && typeof savedDesigns === "object") setDesigns(savedDesigns);
      }
    } catch {}
    setRestored(true);
  }, []);
  useEffect(() => {
    if (!restored) return;
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(qty));
      localStorage.setItem(DESIGNS_KEY, JSON.stringify(designs));
    } catch {}
  }, [qty, designs, restored]);
  const [category, setCategory] = useState<MarketingCategory | undefined>(initialCategory);
  const shown = MARKETING_PRODUCTS.filter((p) => !category || p.category === category);
  const chip = (active: boolean) =>
    `rounded-full border px-4 py-1.5 text-sm font-semibold ${active ? "border-orange-500 bg-orange-500 text-white" : "border-slate-300 bg-white text-slate-700 hover:border-orange-400"}`;
  const set = (id: string, n: number) => setQty((q) => ({ ...q, [id]: Math.max(0, Math.min(50, n)) }));
  const chosen = MARKETING_PRODUCTS.filter((p) => (qty[p.id] ?? 0) > 0);
  const total = chosen.reduce((sum, p) => sum + p.priceUsd * qty[p.id], 0);

  return (
    <form action={startMarketingShopCheckout} className="space-y-6">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Categories">
        <button type="button" onClick={() => setCategory(undefined)} className={chip(!category)} aria-pressed={!category}>
          All ({MARKETING_PRODUCTS.length})
        </button>
        {MARKETING_CATEGORIES.map((c) => {
          const count = MARKETING_PRODUCTS.filter((p) => p.category === c.id).length;
          return count ? (
            <button key={c.id} type="button" onClick={() => setCategory(c.id)} className={chip(category === c.id)} aria-pressed={category === c.id}>
              {c.label} ({count})
            </button>
          ) : null;
        })}
      </div>
      {MARKETING_PRODUCTS.map((p) => (
        <input key={p.id} type="hidden" name={`qty-${p.id}`} value={qty[p.id] ?? 0} />
      ))}
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {shown.map((p) => {
          const n = qty[p.id] ?? 0;
          return (
            <li key={p.id} className={`flex flex-col overflow-hidden rounded-2xl border bg-white ${n ? "border-orange-400 ring-2 ring-orange-200" : "border-slate-200"}`}>
              <button type="button" onClick={() => setZoom({ src: p.image, alt: p.name })} className="cursor-zoom-in" aria-label={`See a bigger photo of ${p.name}`}>
                <Image src={p.image} alt={p.name} width={300} height={300} className="aspect-[4/3] w-full object-cover" />
              </button>
              <div className="flex flex-1 flex-col p-3">
                <h2 className="text-sm font-black leading-tight text-slate-900">{p.name}</h2>
                {p.size ? <p className="mt-1 text-[11px] font-bold text-indigo-700">Size: {p.size}</p> : null}
                <p className="mt-1 flex-1 text-xs text-slate-600">{p.blurb}</p>
                {p.example ? (
                  <button type="button" onClick={() => setZoom({ src: p.example!, alt: `Example ${p.name} we designed` })} className="mt-2 flex cursor-zoom-in items-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50 p-1.5 text-left text-[11px] font-semibold leading-tight text-indigo-800">
                    <Image src={p.example} alt={`Example ${p.name} we designed`} width={48} height={64} className="h-12 w-auto rounded" />
                    <span>Example design: tap to see it big</span>
                  </button>
                ) : null}
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  <strong className="text-base text-orange-600">{usd(p.priceUsd)}</strong>
                  {n ? (
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => set(p.id, n - 1)} className="h-8 w-8 rounded-lg border border-slate-300 font-bold" aria-label={`Fewer ${p.name}`}>−</button>
                      <span className="w-6 text-center font-bold">{n}</span>
                      <button type="button" onClick={() => set(p.id, n + 1)} className="h-8 w-8 rounded-lg border border-slate-300 font-bold" aria-label={`More ${p.name}`}>+</button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => set(p.id, 1)} className="rounded-xl bg-orange-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-orange-600">
                      Add to order
                    </button>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      {zoom ? (
        <div role="dialog" aria-modal="true" aria-label={zoom.alt} onClick={() => setZoom(null)} className="fixed inset-0 z-[100] !mt-0 flex cursor-zoom-out items-center justify-center bg-black/80 p-4">
          <button ref={zoomClose} type="button" onClick={() => setZoom(null)} className="absolute right-4 top-4 rounded-full bg-white px-3 py-1 text-sm font-bold text-slate-900" aria-label="Close">✕ Close</button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={zoom.src} alt={zoom.alt} className="max-h-[90vh] max-w-full rounded-xl bg-white object-contain" />
        </div>
      ) : null}

      <section id="order" className="scroll-mt-24 rounded-2xl border-2 border-orange-300 bg-orange-50 p-5">
        <h2 className="text-xl font-black text-slate-900">Your order</h2>
        {chosen.length ? (
          <ul className="mt-2 space-y-1 text-sm">
            {chosen.map((p) => (
              <li key={p.id} className="space-y-1 pb-2">
                <div className="flex justify-between gap-2">
                  <span>{qty[p.id]} × {p.name}</span>
                  <strong>{usd(p.priceUsd * qty[p.id])}</strong>
                </div>
                <textarea
                  name={`design-${p.id}`}
                  value={designs[p.id] ?? ""}
                  onChange={(e) => setDesigns((d) => ({ ...d, [p.id]: e.target.value }))}
                  rows={2}
                  required
                  maxLength={300}
                  aria-label={`Design or details for ${p.name}`}
                  placeholder="Design or details for this item: text, logo, photo, colours (required)"
                  className={`${input} bg-white`}
                />
              </li>
            ))}
            <li className="flex justify-between gap-2 border-t border-orange-200 pt-2 text-base">
              <span className="font-semibold">Total</span>
              <strong>{usd(total)}</strong>
            </li>
          </ul>
        ) : (
          <p className="mt-2 text-sm text-slate-600">Tap “Add to my order” on the items you want.</p>
        )}
        {member ? (
          <>
            <div className="mt-4 rounded-xl border border-indigo-200 bg-white p-3 text-sm text-slate-700">
              Ordering as <b>{member.name}</b> ({member.email}).{" "}
              {member.qrUrl ? (
                <>
                  Your QR code will open{" "}
                  <a href={member.qrUrl} target="_blank" rel="noopener" className="font-semibold text-indigo-700 underline">
                    {member.qrUrl.replace(/^https?:\/\//, "")}
                  </a>
                  .
                </>
              ) : null}
              {!member.hasBusiness ? (
                <>
                  {" "}
                  <Link href="/add-business" className="font-semibold text-orange-600 underline">
                    Add your business page
                  </Link>{" "}
                  so your QR code and details come from it.
                </>
              ) : null}
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <input name="name" required defaultValue={member.name} placeholder="Your name" className={input} />
              <input name="phone" defaultValue={member.phone} placeholder="Phone / WhatsApp" className={input} />
              <input name="business" defaultValue={member.business} placeholder="Business name" className={input} />
              <input name="website" defaultValue={member.website} placeholder="Your website (optional)" className={input} />
              <select name="orderFor" defaultValue={orderFor} className={`${input} sm:col-span-2`}>
                {Object.entries(MARKETING_SHOP_ORDER_FOR).map(([value, label]) => (
                  <option key={value} value={value}>Add to: {label}</option>
                ))}
              </select>
              <textarea name="notes" rows={2} maxLength={450} placeholder="Anything else we should know? (optional)" className={`${input} sm:col-span-2`} />
            </div>
            <label className="mt-3 flex items-start gap-2 text-sm text-slate-700">
              <input type="checkbox" name="noReturns" required className="mt-1 h-4 w-4" />
              <span>I understand every item is custom-made for me, so it can&apos;t be returned.</span>
            </label>
            <p className="mt-3 text-xs text-slate-600">
              You enter your shipping address on the next step. After you pay, reply to our email with your logo or artwork; we design it, send you a preview, and order and ship it once you approve.
            </p>
            <button type="submit" disabled={!chosen.length} className="mt-3 w-full rounded-xl bg-orange-500 px-4 py-3 text-base font-black text-white hover:bg-orange-600 disabled:opacity-50 sm:w-auto">
              {chosen.length ? `Pay ${usd(total)} and ship to me` : "Add items to order"}
            </button>
          </>
        ) : (
          <div className="mt-4 rounded-xl border border-indigo-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-800">
              Log in or join GoDesi free to order. We use your GoDesi business page for your QR code, phone and details.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link href={`/login?next=${loginNext}`} className="rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-black text-white hover:bg-orange-600">
                Log in to order
              </Link>
              <Link href={`/signup?next=${loginNext}`} className="rounded-xl border-2 border-orange-500 px-5 py-2.5 text-sm font-black text-orange-600 hover:bg-orange-50">
                Join free
              </Link>
            </div>
            <p className="mt-2 text-xs text-slate-500">Your cart stays saved while you log in.</p>
          </div>
        )}
      </section>
    </form>
  );
}
