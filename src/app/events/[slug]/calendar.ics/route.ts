import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { siteUrl } from "@/lib/format";

export const dynamic = "force-dynamic";

/** Folds a line at 75 octets, the way the iCalendar format requires. */
function fold(line: string) {
  const chunks: string[] = [];
  let rest = line;
  while (rest.length > 73) {
    chunks.push(rest.slice(0, 73));
    rest = rest.slice(73);
  }
  chunks.push(rest);
  return chunks.join("\r\n ");
}

function escapeText(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/** 2026-08-22T20:00:00Z → 20260822T200000Z, the only form every app reads. */
function stamp(date: Date) {
  return `${date.toISOString().replace(/[-:]/g, "").split(".")[0]}Z`;
}

/**
 * One event as a calendar file. The stored instant is absolute, so writing it
 * in UTC lands on the right local time in Google, Apple and Outlook without
 * shipping a timezone definition.
 */
export async function GET(
  _request: Request,
  { params }: { params: { slug: string } },
) {
  const event = await db.event.findUnique({
    where: { slug: params.slug },
    select: {
      slug: true,
      title: true,
      description: true,
      startsAt: true,
      endsAt: true,
      updatedAt: true,
      venue: true,
      hallName: true,
      address: true,
      city: true,
      state: true,
      country: true,
      status: true,
    },
  });
  if (!event || event.status === "REJECTED") {
    return new NextResponse("Event not found", { status: 404 });
  }

  const url = `${siteUrl()}/events/${event.slug}`;
  const ends =
    event.endsAt ?? new Date(event.startsAt.getTime() + 2 * 60 * 60 * 1000);
  const place = [
    event.hallName,
    event.venue,
    event.address,
    event.city,
    event.state,
    event.country,
  ]
    .filter(Boolean)
    .join(", ");

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Godesi//Events//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${event.slug}@godesi.com`,
    `DTSTAMP:${stamp(event.updatedAt)}`,
    `DTSTART:${stamp(event.startsAt)}`,
    `DTEND:${stamp(ends)}`,
    fold(`SUMMARY:${escapeText(event.title)}`),
    fold(`LOCATION:${escapeText(place)}`),
    fold(
      `DESCRIPTION:${escapeText(
        `${event.description ?? ""}\n\nDetails: ${url}`.trim(),
      )}`,
    ),
    fold(`URL:${url}`),
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return new NextResponse(`${lines.join("\r\n")}\r\n`, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${event.slug}.ics"`,
      "Cache-Control": "public, max-age=300",
    },
  });
}
