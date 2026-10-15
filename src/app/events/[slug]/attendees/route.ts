import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { eventAttendees } from "@/lib/eventAttendees";
import { fromMinor } from "@/lib/format";

export const dynamic = "force-dynamic";

function cell(value: string | number | null) {
  const raw = value === null ? "" : String(value);
  // Spreadsheets run cells starting with = + - @ as formulas.
  const text =
    typeof value === "string" && /^[=+\-@\t\r]/.test(raw) ? `'${raw}` : raw;
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } },
) {
  const user = await getCurrentUser();
  const event = await db.event.findUnique({
    where: { slug: params.slug },
    select: { id: true, slug: true, organizerId: true },
  });
  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!user || (user.id !== event.organizerId && !can(user, "events"))) {
    return NextResponse.json(
      { error: "Only the organiser can download attendees" },
      { status: 403 },
    );
  }

  const rows = await eventAttendees(event.id);
  const csv = [
    [
      "Name",
      "Email",
      "Phone",
      "Seats",
      "Ticket type",
      "Referred by",
      "Paid",
      "Currency",
      "Ticket code",
      "Checked in",
      "Booked on",
    ],
    ...rows.map((row) => [
      row.buyerName,
      row.buyerEmail,
      row.buyerPhone,
      row.quantity,
      row.tier?.name ?? null,
      row.referredBy,
      fromMinor(row.amountMinor),
      row.currency,
      row.code,
      row.checkedInAt ? "yes" : "no",
      row.createdAt.toISOString().slice(0, 10),
    ]),
  ]
    .map((line) => line.map(cell).join(","))
    .join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="attendees-${event.slug}.csv"`,
    },
  });
}
