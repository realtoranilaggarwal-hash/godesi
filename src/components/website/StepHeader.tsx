import { WEBSITE_STEPS } from "@/lib/websiteBuilder";

export function StepHeader({
  step,
  title,
  lead,
}: {
  step: number;
  title: string;
  lead?: string;
}) {
  return (
    <header className="space-y-3">
      <ol className="flex flex-wrap gap-1 text-xs">
        {WEBSITE_STEPS.map((label, index) => {
          const n = index + 1;
          const tone =
            n < step
              ? "bg-emerald-100 text-emerald-800"
              : n === step
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-500";
          return (
            <li key={label} className={`rounded-full px-2.5 py-1 font-medium ${tone}`}>
              {n < step ? "✓" : n}&nbsp;{label}
            </li>
          );
        })}
      </ol>
      <div>
        <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">{title}</h1>
        {lead ? <p className="mt-1 text-slate-600">{lead}</p> : null}
      </div>
    </header>
  );
}
