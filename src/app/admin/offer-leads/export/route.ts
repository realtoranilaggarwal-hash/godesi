import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { offerInterest } from "@/lib/offerInterests";
import { offerLeadSelect, offerLeadsWhere } from "@/lib/offerLeads";

export const dynamic = "force-dynamic";

function cell(value: string | null) {
  const text = value ?? "";
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admins only" }, { status: 403 });
  }

  const interest =
    offerInterest(new URL(request.url).searchParams.get("interest") ?? "")
      ?.id ?? null;
  const rows = await db.user.findMany({
    where: offerLeadsWhere(interest),
    select: offerLeadSelect,
    orderBy: { createdAt: "desc" },
    take: 10_000,
  });

  const csv = [
    [
      "Name",
      "Email",
      "Email confirmed",
      "Phone",
      "Location",
      "Role",
      "Wants offers on",
      "Picked on",
    ],
    ...rows.map((row) => [
      row.name,
      row.email,
      row.emailVerifiedAt ? "yes" : "no",
      row.offerPhone ?? row.phone,
      row.location,
      row.role,
      row.offerInterests
        .map((id) => offerInterest(id)?.label)
        .filter(Boolean)
        .join("; "),
      (row.offerInterestsAt ?? row.createdAt).toISOString().slice(0, 10),
    ]),
  ]
    .map((line) => line.map(cell).join(","))
    .join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="godesi-offer-leads${interest ? `-${interest}` : ""}.csv"`,
    },
  });
}
