import { ImageResponse } from "next/og";
import QRCode from "qrcode";

export type QrStyle = "business" | "professional" | "personal";

const STYLES: Record<
  QrStyle,
  { frame: string; dark: string; label: string; icon: string }
> = {
  business: { frame: "#4f46e5", dark: "#1e1b4b", label: "Business card", icon: "🏪" },
  professional: { frame: "#0891b2", dark: "#083344", label: "Professional", icon: "🎓" },
  personal: { frame: "#db2777", dark: "#500724", label: "Personal profile", icon: "🙋" },
};

const SIZE = 720;

/**
 * A square QR image framed in the profile type's colour. Free members get a
 * "Made on GoDesi.com" line underneath; Featured members get a clean one.
 */
export async function brandedQr({
  target,
  style,
  name,
  featured,
  filename,
  download,
}: {
  target: string;
  style: QrStyle;
  name: string;
  featured: boolean;
  filename: string;
  download: boolean;
}) {
  const look = STYLES[style];
  const qr = await QRCode.toDataURL(target, {
    width: 520,
    margin: 1,
    errorCorrectionLevel: "M",
    color: { dark: look.dark, light: "#ffffff" },
  });

  const image = new ImageResponse(
    (
      <div
        style={{
          width: SIZE,
          height: SIZE,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          background: look.frame,
          padding: 24,
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontSize: 30,
            fontWeight: 800,
            maxWidth: SIZE - 60,
            overflow: "hidden",
            whiteSpace: "nowrap",
          }}
        >
          <span>{look.icon}</span>
          <span>{look.label}</span>
          <span style={{ opacity: 0.85, fontWeight: 600 }}>
            · {name.length > 26 ? `${name.slice(0, 25)}…` : name}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            background: "#ffffff",
            borderRadius: 28,
            padding: 14,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img src={qr} width={featured ? 560 : 520} height={featured ? 560 : 520} />
        </div>
        {featured ? (
          <div style={{ display: "flex", height: 8 }} />
        ) : (
          <div style={{ display: "flex", fontSize: 26, fontWeight: 700 }}>
            Made on GoDesi.com — get yours free
          </div>
        )}
      </div>
    ),
    { width: SIZE, height: SIZE },
  );

  const headers = new Headers(image.headers);
  headers.set("Cache-Control", "public, max-age=3600");
  if (download) {
    headers.set("Content-Disposition", `attachment; filename="${filename}"`);
  }
  return new Response(image.body, { status: 200, headers });
}
