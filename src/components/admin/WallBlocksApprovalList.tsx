"use client";

import { useState, useTransition } from "react";
import {
  approveWallBlocksAction,
  rejectWallBlocksAction,
} from "@/app/actions/admin";

export type WallPendingRow = {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string;
  w: number;
  h: number;
  x: number;
  y: number;
  email: string;
  /** Latest order summary, e.g. "free", "coupon", "stripe $12.00" — so the
   *  desk can approve paid claims and hold unpaid ones. */
  payment: string;
};

/**
 * Free wall bricks awaiting approval: tick the rows you checked, then approve
 * or reject them all in one go. Approving publishes art on the public wall, so
 * each row needs its own deliberate tick.
 */
export function WallBlocksApprovalList({ rows }: { rows: WallPendingRow[] }) {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();

  const toggle = (id: string) =>
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const allChecked = rows.length > 0 && checked.size === rows.length;
  const toggleAll = () =>
    setChecked(allChecked ? new Set() : new Set(rows.map((r) => r.id)));

  const run = (action: (ids: string[]) => Promise<void>) => {
    const ids = Array.from(checked);
    if (!ids.length) return;
    startTransition(async () => {
      await action(ids);
      setChecked(new Set());
    });
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 pb-2">
        <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
          <input
            type="checkbox"
            checked={allChecked}
            onChange={toggleAll}
            className="h-4 w-4 accent-indigo-600"
          />
          select all
        </label>
        <span className="text-xs text-slate-400">
          {checked.size ? `${checked.size} ticked` : "tick the rows you checked"}
        </span>
        <div className="ml-auto flex gap-2">
          <button
            type="button"
            disabled={!checked.size || pending}
            onClick={() => run(approveWallBlocksAction)}
            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Approve selected
          </button>
          <button
            type="button"
            disabled={!checked.size || pending}
            onClick={() => run(rejectWallBlocksAction)}
            className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Reject selected
          </button>
        </div>
      </div>
      <ul className="divide-y divide-slate-100">
        {rows.map((block) => (
          <li
            key={block.id}
            className="flex flex-wrap items-center gap-3 py-3"
          >
            <input
              type="checkbox"
              checked={checked.has(block.id)}
              onChange={() => toggle(block.id)}
              aria-label={`select ${block.title}`}
              className="h-4 w-4 shrink-0 accent-indigo-600"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={block.imageUrl}
              alt={block.title}
              className="h-12 w-24 rounded-lg border border-slate-200 object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">
                {block.title} · {block.w}×{block.h}px at ({block.x}, {block.y}) ·{" "}
                {block.email}
              </p>
              <a
                href={block.linkUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-indigo-600"
              >
                {block.linkUrl}
              </a>
              <span className="ml-2 inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                {block.payment}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
