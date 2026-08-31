/** The desks are dynamic and can take a second; without this the click looks ignored. */
export default function AdminLoading() {
  return (
    <div className="space-y-3 py-6" aria-busy>
      <p className="text-sm font-semibold text-slate-600">Loading the desk…</p>
      <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
      <div className="h-40 animate-pulse rounded-2xl bg-slate-100" />
    </div>
  );
}
