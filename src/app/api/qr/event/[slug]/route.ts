import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { db } from "@/lib/db";
import { siteUrl } from "@/lib/format";

/** Event QR code: scanning it opens the public event page for bookings. */
export async function GET(
  request: Request,
  { params }: { params: { slug: string } },
) {
  const event = await db.event.findUnique({
    where: { slug: params.slug },
    select: { slug: true, status: true },
  });
  if (!event || event.status !== "APPROVED") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const download = new URL(request.url).searchParams.get("download") === "1";
  const png = await QRCode.toBuffer(`${siteUrl()}/events/${event.slug}?src=qr`, {
    width: 720,
    margin: 2,
    errorCorrectionLevel: "M",
    color: { dark: "#0f172a", light: "#ffffff" },
  });

  return new NextResponse(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400",
      ...(download
        ? { "Content-Disposition": `attachment; filename="godesi-event-${event.slug}-qr.png"` }
        : {}),
    },
  });
}
