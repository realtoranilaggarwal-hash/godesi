import { NextResponse } from "next/server";
import { badgeSize, badgeStatus, badgeTheme } from "@/lib/badge";
import { badgeSvg } from "@/lib/badgeSvg";

export const dynamic = "force-dynamic";

/**
 * The badge a business pastes on its own website. It re-reads the card on every
 * request (behind a short cache) so a card that is pulled, unclaimed or
 * downgraded stops calling itself verified within the hour, wherever it is
 * embedded.
 */
export async function GET(
  request: Request,
  { params }: { params: { slug: string } },
) {
  const url = new URL(request.url);
  const slug = params.slug.replace(/\.svg$/, "");
  const status = await badgeStatus(slug);

  const svg = badgeSvg({
    level: status.level,
    size: badgeSize(url.searchParams.get("size")),
    theme: badgeTheme(url.searchParams.get("style")),
  });

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      // Short enough that a revoked badge corrects itself quickly, long enough
      // that a busy advertiser's site is not querying us on every page view.
      "Cache-Control": "public, max-age=600, s-maxage=3600",
    },
  });
}
