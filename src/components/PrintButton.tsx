"use client";

export function PrintButton({
  children = "Print",
  className = "rounded-xl bg-slate-900 px-3 py-1.5 text-sm font-bold text-white hover:bg-slate-700 print:hidden",
}: {
  children?: string;
  className?: string;
}) {
  return (
    <button type="button" onClick={() => window.print()} className={className}>
      {children}
    </button>
  );
}
