import type { ReactNode } from "react";

export function LegalPage({
  title,
  updated = "July 2026",
  children,
}: {
  title: string;
  updated?: string;
  children: ReactNode;
}) {
  return (
    <article className="mx-auto max-w-3xl space-y-4">
      <header>
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-sm text-slate-500">Last updated {updated}</p>
      </header>
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 text-sm leading-6 text-slate-700 [&_h2]:mt-5 [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-slate-900 [&_li]:ml-5 [&_li]:list-disc">
        {children}
      </div>
    </article>
  );
}
