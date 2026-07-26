import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { db } from "@/lib/db";
import { siteUrl } from "@/lib/format";

export async function GET(
  request: Request,
  { params }: { params: { slug: string } },
) {
  const business = await db.business.findUnique({
    where: { slug: params.slug },
    select: { slug: true, name: true },
  });
  if (!business) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const url = new URL(request.url);
  const download = url.searchParams.get("download") === "1";
  const target = `${siteUrl()}/b/${business.slug}?src=qr`;

  const png = await QRCode.toBuffer(target, {
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
        ? {
            "Content-Disposition": `attachment; filename="godesi-${business.slug}-qr.png"`,
          }
        : {}),
    },
  });
}
