"use client";

export function PrintButton({ children = "Print" }: { children?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-xl bg-slate-900 px-3 py-1.5 text-sm font-bold text-white hover:bg-slate-700 print:hidden"
    >
      {children}
    </button>
  );
}
