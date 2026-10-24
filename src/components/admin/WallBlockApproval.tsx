"use client";

import { useState } from "react";
import {
  approveWallBlockAction,
  rejectWallBlockAction,
} from "@/app/actions/admin";

/**
 * Free-brick approval needs a deliberate tick before the button lights up —
 * approving publishes art on the public wall, so it can't be a stray click.
 */
export function WallBlockApproval({ id }: { id: string }) {
  const [checked, setChecked] = useState(false);
  return (
    <div className="flex flex-wrap items-center gap-2">
      <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          className="h-4 w-4 accent-emerald-600"
        />
        checked art + link
      </label>
      <form action={approveWallBlockAction}>
        <input type="hidden" name="id" value={id} />
        <button
          type="submit"
          disabled={!checked}
          className="rounded-lg bg-emerald-600 px-2 py-1 text-xs font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          approve
        </button>
      </form>
      <form action={rejectWallBlockAction}>
        <input type="hidden" name="id" value={id} />
        <button
          type="submit"
          className="rounded-lg border border-red-200 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
        >
          reject
        </button>
      </form>
    </div>
  );
}
