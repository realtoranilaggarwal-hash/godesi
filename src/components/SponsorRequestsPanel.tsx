import Link from "next/link";
import { removeSponsorAction, saveSponsorAction } from "@/app/actions/sponsors";
import { inputClass } from "@/components/ui";
import type { EventSponsorRow } from "@/lib/sponsors";

function SponsorForm({
  eventId,
  sponsor,
}: {
  eventId: string;
  sponsor?: EventSponsorRow;
}) {
  return (
    <form action={saveSponsorAction} className="grid gap-2 sm:grid-cols-6">
      <input type="hidden" name="eventId" value={eventId} />
      {sponsor ? (
        <input type="hidden" name="sponsorId" value={sponsor.id} />
      ) : (
        <input
          name="business"
          required
          placeholder="godesi.com/business/… link of their card"
          className={`${inputClass} sm:col-span-6`}
        />
      )}
      <input
        name="offer"
        maxLength={120}
        defaultValue={sponsor?.offer ?? ""}
        placeholder="Line under their photo, e.g. Refer Realtor Anil"
        className={`${inputClass} sm:col-span-3`}
      />
      <input
        name="code"
        maxLength={24}
        defaultValue={sponsor?.coupon?.active ? sponsor.coupon.code : ""}
        placeholder="Code, e.g. REALTORANIL"
        className={`${inputClass} uppercase sm:col-span-2`}
      />
      <input
        name="percent"
        type="number"
        min={1}
        max={100}
        defaultValue={
          sponsor?.coupon?.discountKind === "PERCENT"
            ? sponsor.coupon.amount
            : 10
        }
        aria-label="Percent off"
        className={`${inputClass} sm:col-span-1`}
      />
      <button
        type="submit"
        className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-bold text-white hover:bg-emerald-700 sm:col-span-6"
      >
        {sponsor?.status === "APPROVED"
          ? "Save"
          : sponsor
            ? "✓ Approve sponsor"
            : "✓ Add sponsor"}
      </button>
    </form>
  );
}

/** Organiser-only: approve sponsor requests and add sponsors by card link. */
export function SponsorRequestsPanel({
  eventId,
  sponsors,
}: {
  eventId: string;
  sponsors: EventSponsorRow[];
}) {
  const order = { REQUESTED: 0, APPROVED: 1, DECLINED: 2 } as Record<
    string,
    number
  >;
  const rows = [...sponsors].sort(
    (a, b) => (order[a.status] ?? 3) - (order[b.status] ?? 3),
  );
  return (
    <details
      id="sponsor-requests"
      className="scroll-mt-24 rounded-2xl border border-indigo-200 bg-indigo-50/50 p-4"
      open={sponsors.some((s) => s.status === "REQUESTED")}
    >
      <summary className="cursor-pointer font-bold text-indigo-900">
        🛠️ Manage sponsors (
        {sponsors.filter((s) => s.status === "APPROVED").length} approved
        {sponsors.some((s) => s.status === "REQUESTED")
          ? `, ${sponsors.filter((s) => s.status === "REQUESTED").length} waiting`
          : ""}
        ) — only you see this
      </summary>
      <div className="mt-3 space-y-4">
        {rows.map((sponsor) => (
          <div key={sponsor.id} className="space-y-2 rounded-xl bg-white p-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <Link
                href={`/business/${sponsor.business.slug}`}
                className="font-bold text-indigo-700 hover:underline"
              >
                {sponsor.business.name}
              </Link>
              <span className="text-xs font-semibold text-slate-500">
                {sponsor.status === "REQUESTED"
                  ? "⏳ Asked to sponsor"
                  : sponsor.status === "APPROVED"
                    ? "✅ Showing on the page"
                    : "Hidden"}
                {" · "}
                {sponsor.business.publicEmail || sponsor.business.owner?.email}
              </span>
            </div>
            {sponsor.message ? (
              <p className="text-sm italic text-slate-600">
                “{sponsor.message}”
              </p>
            ) : null}
            <SponsorForm eventId={eventId} sponsor={sponsor} />
            {sponsor.status !== "DECLINED" ? (
              <form action={removeSponsorAction}>
                <input type="hidden" name="eventId" value={eventId} />
                <input type="hidden" name="sponsorId" value={sponsor.id} />
                <button
                  type="submit"
                  className="text-xs font-semibold text-rose-600 hover:underline"
                >
                  {sponsor.status === "APPROVED"
                    ? "Remove from page"
                    : "Decline"}
                </button>
              </form>
            ) : null}
          </div>
        ))}
        <div className="space-y-2 rounded-xl bg-white p-3">
          <p className="text-sm font-bold">➕ Add a sponsor you signed up</p>
          <SponsorForm eventId={eventId} />
        </div>
      </div>
    </details>
  );
}
