"use client";

import { OPEN_SPIN_EVENT } from "@/components/SpinWheel";

export function OpenSpinButton({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_SPIN_EVENT))}
      className="rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 px-4 py-2 text-sm font-black text-white shadow hover:brightness-110"
    >
      {children}
    </button>
  );
}
