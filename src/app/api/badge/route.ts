import { NextResponse } from "next/server";

/**
 * The "Listed on Godesi" badge businesses paste on their own site. Served as
 * SVG so it stays sharp at any size and costs nothing to render.
 */
const THEMES = {
  light: { bg: "#ffffff", border: "#e2e8f0", title: "#0f172a", sub: "#475569" },
  dark: { bg: "#0f172a", border: "#1e293b", title: "#ffffff", sub: "#cbd5e1" },
} as const;

type Theme = keyof typeof THEMES;

export function GET(request: Request) {
  const style = new URL(request.url).searchParams.get("style");
  const theme = THEMES[(style === "dark" ? "dark" : "light") as Theme];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="64" viewBox="0 0 200 64" role="img" aria-label="Listed on Godesi">
  <rect x="0.5" y="0.5" width="199" height="63" rx="12" fill="${theme.bg}" stroke="${theme.border}"/>
  <text x="16" y="27" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="11" font-weight="600" fill="${theme.sub}" letter-spacing="0.6">LISTED ON</text>
  <text x="16" y="48" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="21" font-weight="800" fill="${theme.title}">Godesi</text>
  <circle cx="176" cy="32" r="15" fill="#4f46e5"/>
  <text x="176" y="39" text-anchor="middle" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="16" font-weight="800" fill="#ffffff">G</text>
</svg>`;

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400, s-maxage=604800",
    },
  });
}
