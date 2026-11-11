import { HEALTH_DISCLAIMER } from "@/lib/wellness";

export function HealthDisclaimer({
  extra,
  className = "",
}: {
  extra?: string | null;
  className?: string;
}) {
  return (
    <aside
      role="note"
      className={`rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900 ${className}`}
    >
      <p className="font-bold">⚕️ Health disclaimer</p>
      {extra ? <p className="mt-1">{extra}</p> : null}
      <p className="mt-1">{HEALTH_DISCLAIMER}</p>
    </aside>
  );
}
