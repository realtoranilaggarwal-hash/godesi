import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { siteUrl } from "@/lib/format";

/**
 * The QR encodes the server-issued ticket code. Only the ticket holder, the event
 * organiser or an admin can render it.
 */
export async function GET(request: Request, { params }: { params: { code: string } }) {
  const ticket = await db.ticket.findUnique({
    where: { code: params.code },
    select: { code: true, status: true, userId: true, event: { select: { organizerId: true } } },
  });
  if (!ticket || ticket.status !== "CONFIRMED") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const user = await getCurrentUser();
  const allowed =
    user &&
    (user.role === "ADMIN" || user.id === ticket.userId || user.id === ticket.event.organizerId);
  if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const download = new URL(request.url).searchParams.get("download") === "1";
  const png = await QRCode.toBuffer(`${siteUrl()}/tickets/${ticket.code}`, {
    width: 720,
    margin: 2,
    errorCorrectionLevel: "M",
    color: { dark: "#0f172a", light: "#ffffff" },
  });

  return new NextResponse(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "private, no-store",
      ...(download
        ? { "Content-Disposition": `attachment; filename="godesi-ticket-${ticket.code}.png"` }
        : {}),
    },
  });
}
