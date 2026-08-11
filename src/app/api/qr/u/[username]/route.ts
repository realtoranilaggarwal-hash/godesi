import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { db } from "@/lib/db";
import { siteUrl } from "@/lib/format";
import { normalizeUsername } from "@/lib/profiles";

/** Personal QR code: scanning it opens godesi.com/<username>. */
export async function GET(
  request: Request,
  { params }: { params: { username: string } },
) {
  const username = normalizeUsername(decodeURIComponent(params.username));
  const user = await db.user.findUnique({
    where: { username },
    select: { username: true },
  });
  if (!user?.username) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const download = new URL(request.url).searchParams.get("download") === "1";
  const png = await QRCode.toBuffer(`${siteUrl()}/${user.username}?src=qr`, {
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
            "Content-Disposition": `attachment; filename="godesi-${user.username}-qr.png"`,
          }
        : {}),
    },
  });
}
