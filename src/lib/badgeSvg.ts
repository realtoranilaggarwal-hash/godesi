import { BADGE_SIZES, type BadgeLevel, type BadgeSize } from "@/lib/badge";

type Theme = "light" | "dark";

const THEMES = {
  light: { bg: "#ffffff", border: "#e2e8f0", title: "#0f172a", sub: "#475569" },
  dark: { bg: "#0f172a", border: "#1e293b", title: "#ffffff", sub: "#cbd5e1" },
} as const;

/** Green reads as "checked" everywhere; unclaimed cards keep the brand indigo. */
const MARK = { VERIFIED: "#16a34a", LISTED: "#4f46e5", NONE: "#94a3b8" } as const;

const FONT = "Segoe UI, Helvetica, Arial, sans-serif";

function heading(level: BadgeLevel) {
  if (level === "VERIFIED") return "VERIFIED ON";
  if (level === "LISTED") return "LISTED ON";
  return "FIND US ON";
}

function tick(cx: number, cy: number, radius: number, colour: string) {
  const arm = radius * 0.42;
  return `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="${colour}"/>
  <path d="M ${cx - arm} ${cy} l ${arm * 0.72} ${arm * 0.72} l ${arm * 1.28} ${-arm * 1.4}" fill="none" stroke="#ffffff" stroke-width="${Math.max(radius * 0.18, 1.6)}" stroke-linecap="round" stroke-linejoin="round"/>`;
}

/**
 * Rendered as SVG so one file stays sharp from an email signature to a printed
 * flyer, and costs nothing to serve.
 */
export function badgeSvg({
  level,
  size,
  theme,
}: {
  level: BadgeLevel;
  size: BadgeSize;
  theme: Theme;
}) {
  const { width, height } = BADGE_SIZES[size];
  const colours = THEMES[theme];
  const mark = MARK[level];
  const label = `${heading(level).toLowerCase()} Godesi.com`;
  const open = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${label}">
  <rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="${size === "square" ? 20 : 12}" fill="${colours.bg}" stroke="${colours.border}"/>`;

  if (size === "small") {
    return `${open}
  ${tick(20, 20, 11, mark)}
  <text x="38" y="17" font-family="${FONT}" font-size="8" font-weight="600" fill="${colours.sub}" letter-spacing="0.5">${heading(level)}</text>
  <text x="38" y="30" font-family="${FONT}" font-size="13" font-weight="800" fill="${colours.title}">Godesi.com</text>
</svg>`;
  }

  if (size === "square") {
    return `${open}
  ${tick(80, 52, 26, mark)}
  <text x="80" y="102" text-anchor="middle" font-family="${FONT}" font-size="11" font-weight="700" fill="${colours.sub}" letter-spacing="1.2">${heading(level)}</text>
  <text x="80" y="126" text-anchor="middle" font-family="${FONT}" font-size="20" font-weight="800" fill="${colours.title}">Godesi.com</text>
</svg>`;
  }

  return `${open}
  <text x="16" y="25" font-family="${FONT}" font-size="10" font-weight="600" fill="${colours.sub}" letter-spacing="0.6">${heading(level)}</text>
  <text x="16" y="47" font-family="${FONT}" font-size="20" font-weight="800" fill="${colours.title}">Godesi.com</text>
  ${tick(176, 32, 15, mark)}
</svg>`;
}
