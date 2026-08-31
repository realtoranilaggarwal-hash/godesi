import { NextResponse } from "next/server";
import { ProspectStatus, type Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { getCurrentUser, isStaff } from "@/lib/auth";
import { reachKey, reachWhere } from "@/lib/prospectReach";

/**
 * The same call list as a spreadsheet, so a moderator can work through it on
 * her phone away from the admin panel. Staff only.
 */
export const dynamic = "force-dynamic";

function cell(value: string | null) {
  const text = value ?? "";
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user || !isStaff(user)) {
    return NextResponse.json({ error: "Staff only" }, { status: 403 });
  }

  const params = new URL(request.url).searchParams;
  const category = params.get("category");
  const city = params.get("city");
  const source = params.get("source");
  const asked = params.get("status");
  const status = Object.values(ProspectStatus).find((value) => value === asked);
  const mine = params.get("mine") === "1";

  const where: Prisma.ProspectWhereInput = {
    ...reachWhere(reachKey(params.get("reach"))),
    ...(category ? { categorySlug: category } : {}),
    ...(city ? { city } : {}),
    ...(source ? { source } : {}),
    ...(status ? { status } : {}),
    ...(mine ? { ownerId: user.id } : {}),
  };

  const rows = await db.prospect.findMany({
    where,
    orderBy: [{ categorySlug: "asc" }, { name: "asc" }],
    take: 5_000,
    include: { owner: { select: { name: true } } },
  });

  const csv = [
    [
      "Name",
      "Trade",
      "Beat",
      "Town",
      "State",
      "Phone",
      "Email",
      "Website",
      "Found on",
      "Status",
      "Working it",
      "Note",
      "Their card",
    ].join(","),
    ...rows.map((row) =>
      [
        cell(row.name),
        cell(row.trade),
        cell(row.categorySlug),
        cell(row.city),
        cell(row.state),
        cell(row.phone),
        cell(row.email),
        cell(row.websiteUrl),
        cell(row.source),
        cell(row.status),
        cell(row.owner?.name ?? null),
        cell(row.note),
        cell(row.listedSlug ? `/b/${row.listedSlug}` : null),
      ].join(","),
    ),
  ].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="godesi-call-list.csv"',
    },
  });
}
