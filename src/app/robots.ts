import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/format";

/**
 * Scrapers were rendering every filtered page on the site around the clock,
 * which is what keeps the database awake and the function bill running. Search
 * engines still get the whole directory; the ones that only take content are
 * turned away, and nobody is invited to crawl search results.
 */
const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "CCBot",
  "ClaudeBot",
  "anthropic-ai",
  "Claude-Web",
  "Bytespider",
  "Amazonbot",
  "meta-externalagent",
  "FacebookBot",
  "PetalBot",
  "SemrushBot",
  "AhrefsBot",
  "MJ12bot",
  "DotBot",
  "DataForSeoBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard",
          "/admin",
          "/api",
          "/search",
          "/find",
          "/*?q=",
          "/*?city=",
          "/*?state=",
          "/*?page=",
        ],
        crawlDelay: 10,
      },
      { userAgent: AI_CRAWLERS, disallow: "/" },
    ],
    sitemap: [`${siteUrl()}/sitemap.xml`, `${siteUrl()}/news-sitemap.xml`],
  };
}
