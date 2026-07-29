import { NextResponse, type NextRequest } from "next/server";

const BLOCKED_HOSTS =
  /^(localhost|127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|\[?::1\]?)/i;

/**
 * Streams a remote image through Godesi. News publishers often refuse
 * hot-linked requests or answer with an HTML error page, which the browser then
 * blocks — fetching server-side and re-serving the bytes keeps the thumbnails.
 */
export async function GET(request: NextRequest) {
  const target = request.nextUrl.searchParams.get("u");
  if (!target) return new NextResponse("missing url", { status: 400 });

  let url: URL;
  try {
    url = new URL(target);
  } catch {
    return new NextResponse("bad url", { status: 400 });
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    return new NextResponse("bad protocol", { status: 400 });
  }
  if (BLOCKED_HOSTS.test(url.hostname)) {
    return new NextResponse("blocked host", { status: 400 });
  }

  try {
    const upstream = await fetch(url, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (compatible; GodesiBot/1.0; +https://godesi.com)",
        accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
        referer: `${url.protocol}//${url.host}/`,
      },
      next: { revalidate: 86400 },
    });

    if (!upstream.ok || !upstream.body) {
      return new NextResponse("upstream error", { status: 502 });
    }

    const type = upstream.headers.get("content-type") ?? "";
    const looksLikeImage = type.startsWith("image/");

    return new NextResponse(upstream.body, {
      headers: {
        "content-type": looksLikeImage ? type : "image/jpeg",
        "cache-control": "public, max-age=86400, s-maxage=604800",
        "x-content-type-options": "nosniff",
      },
    });
  } catch {
    return new NextResponse("fetch failed", { status: 502 });
  }
}
