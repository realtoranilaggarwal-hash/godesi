import { Card } from "@/components/ui";
import { eventAttendees, referralTally } from "@/lib/eventAttendees";

export async function EventAttendees({
  eventId,
  slug,
  askReferredBy,
}: {
  eventId: string;
  slug: string;
  askReferredBy: boolean;
}) {
  const rows = await eventAttendees(eventId);
  const seats = rows.reduce((sum, row) => sum + row.quantity, 0);
  const showReferrals =
    askReferredBy || rows.some((row) => Boolean(row.referredBy));
  const tally = showReferrals ? referralTally(rows) : [];

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-bold">Attendees</h2>
          <p className="text-xs text-slate-500">
            Only you and the GoDesi events desk see this · {rows.length}{" "}
            booking(s), {seats} seat(s)
          </p>
        </div>
        {rows.length ? (
          <a
            href={`/events/${slug}/attendees`}
            className="text-sm font-semibold text-indigo-600 hover:underline"
          >
            ⬇ Download CSV
          </a>
        ) : null}
      </div>

      {tally.length ? (
        <div className="mt-3 rounded-xl bg-amber-50 p-3">
          <p className="text-xs font-bold uppercase tracking-wide text-amber-900">
            Top referrers
          </p>
          <ul className="mt-1 flex flex-wrap gap-2 text-sm">
            {tally.slice(0, 10).map((item) => (
              <li
                key={item.name}
                className="rounded-full bg-white px-3 py-1 font-semibold text-amber-900 ring-1 ring-amber-200"
              >
                {item.name} · {item.seats} seat{item.seats === 1 ? "" : "s"}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {rows.length ? (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="py-1 pr-3">Name</th>
                <th className="py-1 pr-3">Contact</th>
                <th className="py-1 pr-3">Seats</th>
                {showReferrals ? (
                  <th className="py-1 pr-3">Referred by</th>
                ) : null}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.slice(0, 200).map((row) => (
                <tr key={row.code}>
                  <td className="py-1.5 pr-3 font-semibold">
                    {row.buyerName}
                    {row.checkedInAt ? (
                      <span className="ml-1 text-xs text-emerald-700">
                        ✓ in
                      </span>
                    ) : null}
                  </td>
                  <td className="py-1.5 pr-3 text-slate-600">
                    {row.buyerEmail}
                    {row.buyerPhone ? ` · ${row.buyerPhone}` : ""}
                  </td>
                  <td className="py-1.5 pr-3">
                    {row.quantity}
                    {row.tier ? ` · ${row.tier.name}` : ""}
                  </td>
                  {showReferrals ? (
                    <td className="py-1.5 pr-3">{row.referredBy ?? "—"}</td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length > 200 ? (
            <p className="mt-2 text-xs text-slate-500">
              Showing the first 200 — download the CSV for everyone.
            </p>
          ) : null}
        </div>
      ) : (
        <p className="mt-2 text-sm text-slate-600">No bookings yet.</p>
      )}
    </Card>
  );
}
