/**
 * Puts an event in the reader's own calendar. The stored instant is absolute,
 * so both links carry UTC and land on the right local time in any calendar.
 */
function utcStamp(date: Date) {
  return `${date.toISOString().replace(/[-:]/g, "").split(".")[0]}Z`;
}

export function AddToCalendar({
  slug,
  title,
  startsAt,
  endsAt,
  place,
  details,
}: {
  slug: string;
  title: string;
  startsAt: Date;
  endsAt?: Date | null;
  place: string;
  details?: string;
}) {
  const ends = endsAt ?? new Date(startsAt.getTime() + 2 * 60 * 60 * 1000);
  const google = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${utcStamp(startsAt)}/${utcStamp(ends)}`,
    location: place,
    details: details ?? "",
  });
  const outlook = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: title,
    startdt: startsAt.toISOString(),
    enddt: ends.toISOString(),
    location: place,
    body: details ?? "",
  });
  const chip =
    "rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
        Add to calendar
      </span>
      <a className={chip} href={`/events/${slug}/calendar.ics`}>
        🗓️ Apple / Outlook (.ics)
      </a>
      <a
        className={chip}
        href={`https://calendar.google.com/calendar/render?${google.toString()}`}
        target="_blank"
        rel="noreferrer"
      >
        📆 Google Calendar
      </a>
      <a
        className={chip}
        href={`https://outlook.live.com/calendar/0/action/compose?${outlook.toString()}`}
        target="_blank"
        rel="noreferrer"
      >
        📧 Outlook.com
      </a>
    </div>
  );
}
