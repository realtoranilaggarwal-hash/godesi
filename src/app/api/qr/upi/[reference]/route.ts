import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { db } from "@/lib/db";
import { upiEnabled, upiIntentUrl } from "@/lib/upi";

/** QR image for a pending UPI request, scannable by any UPI app. */
export async function GET(
  _request: Request,
  { params }: { params: { reference: string } },
) {
  if (!upiEnabled()) {
    return NextResponse.json({ error: "UPI is not configured" }, { status: 503 });
  }

  const upi = await db.upiRequest.findUnique({
    where: { reference: params.reference },
    select: { reference: true, amountMinor: true, currency: true, status: true },
  });
  if (!upi || upi.status !== "PENDING") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const png = await QRCode.toBuffer(
    upiIntentUrl({
      amountMinor: upi.amountMinor,
      reference: upi.reference,
      currency: upi.currency,
    }),
    {
      width: 720,
      margin: 2,
      errorCorrectionLevel: "M",
      color: { dark: "#0f172a", light: "#ffffff" },
    },
  );

  return new NextResponse(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "no-store",
    },
  });
}
