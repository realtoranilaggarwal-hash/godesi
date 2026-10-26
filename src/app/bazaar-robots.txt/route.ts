export const dynamic = "force-dynamic";

/** Robots for the oaktreebazaar.com doorway domain (rewritten to /robots.txt there). */
export function GET() {
  return new Response(
    `User-agent: *\nAllow: /\nSitemap: https://oaktreebazaar.com/sitemap.xml\n`,
    { headers: { "Content-Type": "text/plain; charset=utf-8" } },
  );
}
