import { ImageResponse } from "next/og";
import QRCode from "qrcode";
import { siteUrl } from "@/lib/format";
import { WEDDING_LAUNCH_LIMIT, WEDDING_LAUNCH_MONTHS } from "@/lib/weddingLaunch";

/** Printable expo flyer (US Letter at 150 dpi) with a QR to the vendor sign-up page. */
const WIDTH = 1275;
const HEIGHT = 1650;

export async function GET(request: Request) {
  const ref = new URL(request.url).searchParams.get("ref") || "expo";
  const target = `${siteUrl()}/wedding/vendors?ref=${encodeURIComponent(ref)}`;
  const qr = await QRCode.toDataURL(target, {
    width: 620,
    margin: 1,
    errorCorrectionLevel: "M",
    color: { dark: "#4c0519", light: "#ffffff" },
  });

  const points = [
    "List your wedding business FREE",
    "Get wedding requests from desi families",
    "Families reach you on WhatsApp",
    `First ${WEDDING_LAUNCH_LIMIT} vendors: Premium free for ${WEDDING_LAUNCH_MONTHS} months`,
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: WIDTH,
          height: HEIGHT,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          background: "linear-gradient(160deg, #e11d48 0%, #c026d3 55%, #f97316 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
          padding: 70,
        }}
      >
        <div style={{ display: "flex", fontSize: 44, fontWeight: 800, letterSpacing: 2 }}>
          GoDesi.com
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 30,
            fontSize: 92,
            fontWeight: 900,
            textAlign: "center",
            lineHeight: 1.05,
          }}
        >
          Desi Wedding Vendors
        </div>
        <div style={{ display: "flex", marginTop: 16, fontSize: 48, fontWeight: 700, opacity: 0.95 }}>
          Get more wedding customers
        </div>
        <div style={{ display: "flex", flexDirection: "column", marginTop: 44, gap: 16 }}>
          {points.map((point) => (
            <div key={point} style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 38, fontWeight: 700 }}>
              <svg width="40" height="40" viewBox="0 0 24 24">
                <path d="M4 12.5l5 5L20 6.5" fill="none" stroke="#ffffff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {point}
            </div>
          ))}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 50,
            background: "#ffffff",
            borderRadius: 36,
            padding: 22,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img src={qr} width={560} height={560} />
        </div>
        <div style={{ display: "flex", marginTop: 26, fontSize: 40, fontWeight: 800 }}>
          Scan to list free · godesi.com/wedding/vendors
        </div>
        <div style={{ display: "flex", marginTop: 14, fontSize: 28, opacity: 0.9 }}>
          Mehndi · Decor · Mandap · DJ · Dhol · Catering · Photo · Makeup · Venues · Pandits
        </div>
      </div>
    ),
    {
      width: WIDTH,
      height: HEIGHT,
      headers: {
        "Content-Disposition": 'inline; filename="godesi-wedding-vendor-flyer.png"',
        "Cache-Control": "public, max-age=86400",
      },
    },
  );
}
