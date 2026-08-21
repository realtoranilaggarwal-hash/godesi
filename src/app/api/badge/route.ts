import { NextResponse } from "next/server";
import { badgeSize, badgeTheme } from "@/lib/badge";
import { badgeSvg } from "@/lib/badgeSvg";

/**
 * The generic badge, kept for snippets pasted before badges became per-business.
 * It cannot claim a business is listed or verified — nothing identifies which
 * business asked for it — so it renders the neutral "find us on" wording, and
 * /badge now hands out `/api/badge/<slug>` instead.
 */
export function GET(request: Request) {
  const url = new URL(request.url);
  const svg = badgeSvg({
    level: "NONE",
    size: badgeSize(url.searchParams.get("size")),
    theme: badgeTheme(url.searchParams.get("style")),
  });

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400, s-maxage=604800",
    },
  });
}
