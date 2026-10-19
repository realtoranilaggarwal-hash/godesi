import { ImageResponse } from "next/og";
import QRCode from "qrcode";
import { siteUrl } from "@/lib/format";

export type QrStyle = "business" | "professional" | "personal";

const STYLES: Record<
  QrStyle,
  { frame: string; dark: string; label: string; icon: string }
> = {
  business: {
    frame: "#4f46e5",
    dark: "#1e1b4b",
    label: "Business card",
    icon: "🏪",
  },
  professional: {
    frame: "#0891b2",
    dark: "#083344",
    label: "Professional",
    icon: "🎓",
  },
  personal: {
    frame: "#db2777",
    dark: "#500724",
    label: "Personal profile",
    icon: "🙋",
  },
};

const SIZE = 720;
const QR_SIZE = 600;

/** The GoDesi logo for the middle of the code, served from /public; null if it can't be fetched. */
async function logoDataUrl() {
  try {
    const response = await fetch(`${siteUrl()}/qr-logo.png`, {
      next: { revalidate: 86400 },
    });
    if (!response.ok) return null;
    const bytes = Buffer.from(await response.arrayBuffer());
    return `data:image/png;base64,${bytes.toString("base64")}`;
  } catch {
    return null;
  }
}

/**
 * A square QR image framed in the profile type's colour with the GoDesi logo in
 * the middle. Free members also get "GoDesi.com" under the logo.
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
  const [qr, logo] = await Promise.all([
    // High error correction so the logo in the middle doesn't stop it scanning.
    QRCode.toDataURL(target, {
      width: QR_SIZE,
      margin: 1,
      errorCorrectionLevel: "H",
      color: { dark: look.dark, light: "#ffffff" },
    }),
    logoDataUrl(),
  ]);
  const badge = Math.round(QR_SIZE * 0.24);

  const image = new ImageResponse(
    <div
      style={{
        width: SIZE,
        height: SIZE,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
        background: look.frame,
        padding: 20,
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
          position: "relative",
          background: "#ffffff",
          borderRadius: 28,
          padding: 12,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img src={qr} width={QR_SIZE} height={QR_SIZE} />
        <div
          style={{
            position: "absolute",
            left: 12 + (QR_SIZE - badge) / 2,
            top: 12 + (QR_SIZE - badge) / 2,
            width: badge,
            height: badge,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "#ffffff",
            borderRadius: 22,
            border: `5px solid ${look.frame}`,
          }}
        >
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
            <img
              src={logo}
              width={featured ? badge - 24 : badge - 44}
              height={featured ? badge - 24 : badge - 44}
            />
          ) : null}
          {featured && logo ? null : (
            <span style={{ fontSize: 17, fontWeight: 800, color: look.dark }}>
              GoDesi.com
            </span>
          )}
        </div>
      </div>
    </div>,
    { width: SIZE, height: SIZE },
  );

  const headers = new Headers(image.headers);
  headers.set("Cache-Control", "public, max-age=3600");
  if (download) {
    headers.set("Content-Disposition", `attachment; filename="${filename}"`);
  }
  return new Response(image.body, { status: 200, headers });
}
