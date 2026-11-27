"use client";

import Image from "next/image";
import { useState } from "react";
import { startMarketingShopCheckout } from "@/app/actions/marketingShop";
import {
  MARKETING_PRODUCTS,
  MARKETING_SHOP_ORDER_FOR,
  type MarketingShopOrderFor,
  usd,
} from "@/lib/marketingShop";

const input = "w-full rounded-xl border border-slate-300 px-3 py-2 text-sm";

export function MarketingShopOrderForm({ orderFor }: { orderFor: MarketingShopOrderFor }) {
  const [qty, setQty] = useState<Record<string, number>>({});
  const set = (id: string, n: number) => setQty((q) => ({ ...q, [id]: Math.max(0, Math.min(50, n)) }));
  const chosen = MARKETING_PRODUCTS.filter((p) => (qty[p.id] ?? 0) > 0);
  const total = chosen.reduce((sum, p) => sum + p.priceUsd * qty[p.id], 0);

  return (
    <form action={startMarketingShopCheckout} className="space-y-6">
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MARKETING_PRODUCTS.map((p) => {
          const n = qty[p.id] ?? 0;
          return (
            <li key={p.id} className={`flex flex-col overflow-hidden rounded-2xl border bg-white ${n ? "border-orange-400 ring-2 ring-orange-200" : "border-slate-200"}`}>
              <Image src={p.image} alt={p.name} width={600} height={600} className="aspect-square w-full object-cover" />
              <div className="flex flex-1 flex-col p-4">
                <h2 className="font-black text-slate-900">{p.name}</h2>
                <p className="mt-1 flex-1 text-sm text-slate-600">{p.blurb}</p>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <strong className="text-lg text-orange-600">{usd(p.priceUsd)}</strong>
                  {n ? (
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => set(p.id, n - 1)} className="h-8 w-8 rounded-lg border border-slate-300 font-bold" aria-label={`Fewer ${p.name}`}>−</button>
                      <span className="w-6 text-center font-bold">{n}</span>
                      <button type="button" onClick={() => set(p.id, n + 1)} className="h-8 w-8 rounded-lg border border-slate-300 font-bold" aria-label={`More ${p.name}`}>+</button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => set(p.id, 1)} className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-bold text-white hover:bg-orange-600">
                      Add to my order
                    </button>
                  )}
                </div>
                <input type="hidden" name={`qty-${p.id}`} value={n} />
              </div>
            </li>
          );
        })}
      </ul>

      <section id="order" className="scroll-mt-24 rounded-2xl border-2 border-orange-300 bg-orange-50 p-5">
        <h2 className="text-xl font-black text-slate-900">Your order</h2>
        {chosen.length ? (
          <ul className="mt-2 space-y-1 text-sm">
            {chosen.map((p) => (
              <li key={p.id} className="flex justify-between gap-2">
                <span>{qty[p.id]} × {p.name}</span>
                <strong>{usd(p.priceUsd * qty[p.id])}</strong>
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
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <input name="name" required placeholder="Your name" className={input} />
          <input name="email" type="email" required placeholder="Email" className={input} />
          <input name="phone" placeholder="Phone / WhatsApp" className={input} />
          <input name="business" placeholder="Business name" className={input} />
          <input name="page" placeholder="Your GoDesi page or website (optional)" className={`${input} sm:col-span-2`} />
          <select name="orderFor" defaultValue={orderFor} className={input}>
            {Object.entries(MARKETING_SHOP_ORDER_FOR).map(([value, label]) => (
              <option key={value} value={value}>Add to: {label}</option>
            ))}
          </select>
          <textarea name="notes" rows={2} maxLength={450} placeholder="Text to print, colours, sizes (optional)" className={`${input} sm:col-span-2`} />
        </div>
        <p className="mt-3 text-xs text-slate-600">
          You enter your shipping address on the next step. After you pay, reply to our email with your logo; we send a design preview before we ship.
        </p>
        <button type="submit" disabled={!chosen.length} className="mt-3 w-full rounded-xl bg-orange-500 px-4 py-3 text-base font-black text-white hover:bg-orange-600 disabled:opacity-50 sm:w-auto">
          {chosen.length ? `Pay ${usd(total)} and ship to me` : "Add items to order"}
        </button>
      </section>
    </form>
  );
}
