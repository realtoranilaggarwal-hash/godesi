import { ImageResponse } from "next/og";
import { BADGE_SIZES, badgeSize, badgeStatus, badgeTheme } from "@/lib/badge";

export const dynamic = "force-dynamic";

const THEMES = {
  light: { bg: "#ffffff", border: "#e2e8f0", title: "#0f172a", sub: "#475569" },
  dark: { bg: "#0f172a", border: "#1e293b", title: "#ffffff", sub: "#cbd5e1" },
} as const;

/**
 * Same badge as the SVG route, as a PNG — Wix, Squarespace, Word and most email
 * clients will not render a remote SVG, and those are exactly where businesses
 * paste it.
 */
export async function GET(
  request: Request,
  { params }: { params: { slug: string } },
) {
  const url = new URL(request.url);
  const status = await badgeStatus(params.slug.replace(/\.png$/, ""));
  const size = badgeSize(url.searchParams.get("size"));
  const theme = THEMES[badgeTheme(url.searchParams.get("style"))];
  const { width, height } = BADGE_SIZES[size];
  const scale = 2;

  const heading =
    status.level === "VERIFIED"
      ? "VERIFIED ON"
      : status.level === "LISTED"
        ? "LISTED ON"
        : "FIND US ON";
  const mark =
    status.level === "VERIFIED"
      ? "#16a34a"
      : status.level === "LISTED"
        ? "#4f46e5"
        : "#94a3b8";
  const stacked = size === "square";
  // The bundled font has no ✓ glyph, so the tick is drawn rather than typed —
  // otherwise every PNG badge shows a missing-glyph box.
  const tick = (px: number) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      width={px}
      height={px}
      alt=""
      src={`data:image/svg+xml;utf8,${encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>`,
      )}`}
    />
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: stacked ? "column" : "row",
          alignItems: "center",
          justifyContent: stacked ? "center" : "space-between",
          gap: stacked ? 10 * scale : 0,
          padding: (stacked ? 12 : 14) * scale,
          background: theme.bg,
          border: `${scale}px solid ${theme.border}`,
          borderRadius: (stacked ? 20 : 12) * scale,
          fontFamily: "sans-serif",
        }}
      >
        {stacked ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 52 * scale,
              height: 52 * scale,
              borderRadius: 999,
              background: mark,
              color: "#ffffff",
            }}
          >
            {tick(30 * scale)}
          </div>
        ) : null}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: (size === "small" ? 8 : 10) * scale,
              fontWeight: 600,
              letterSpacing: 0.6 * scale,
              color: theme.sub,
            }}
          >
            {heading}
          </div>
          <div
            style={{
              fontSize: (size === "small" ? 13 : 20) * scale,
              fontWeight: 800,
              color: theme.title,
            }}
          >
            Godesi.com
          </div>
        </div>
        {stacked ? null : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: (size === "small" ? 22 : 30) * scale,
              height: (size === "small" ? 22 : 30) * scale,
              borderRadius: 999,
              background: mark,
              color: "#ffffff",
            }}
          >
            {tick((size === "small" ? 13 : 18) * scale)}
          </div>
        )}
      </div>
    ),
    {
      width: width * scale,
      height: height * scale,
      headers: { "Cache-Control": "public, max-age=600, s-maxage=3600" },
    },
  );
}
