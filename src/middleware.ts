import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * oaktreebazaar.com is a single-page doorway: the front page renders the
 * /bazaar hub, and every other link carries visitors on to GoDesi. Serving
 * the whole site on both domains would split rankings between duplicates,
 * so non-root paths redirect instead of mirroring.
 */
const BAZAAR_HOSTS = new Set(["oaktreebazaar.com", "www.oaktreebazaar.com"]);

export function middleware(req: NextRequest) {
  // Host header, not nextUrl.hostname: locally and on some proxies the parsed
  // URL keeps the server name instead of the host the visitor asked for.
  const host = (req.headers.get("host") ?? "").toLowerCase().split(":")[0];
  if (!BAZAAR_HOSTS.has(host)) return NextResponse.next();

  const path = req.nextUrl.pathname;
  if (path === "/")
    return NextResponse.rewrite(new URL("/bazaar", req.url));
  if (path === "/sitemap.xml")
    return NextResponse.rewrite(new URL("/bazaar-sitemap.xml", req.url));
  if (path === "/robots.txt")
    return NextResponse.rewrite(new URL("/bazaar-robots.txt", req.url));

  // Bundled assets, icons, images and widgets must load for the rewritten page.
  if (path.startsWith("/_next") || path.includes("."))
    return NextResponse.next();

  return NextResponse.redirect(
    `https://godesi.com${path}${req.nextUrl.search}`,
    307,
  );
}

export const config = { matcher: "/:path*" };
