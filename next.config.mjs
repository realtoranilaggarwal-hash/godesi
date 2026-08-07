/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Uploads live on Vercel Blob; without this the optimizer answers 400.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    return [
      {
        // Stale service workers must be revalidated so the kill switch reaches browsers.
        source: "/:file(sw.js|service-worker.js|superpwa-sw.js)",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        // Sessions are cookies on one host: serving www as well meant signing
        // out on one host left the other still signed in as the old member.
        source: "/:path*",
        has: [{ type: "host", value: "www.godesi.com" }],
        destination: "https://godesi.com/:path*",
        permanent: true,
      },
      {
        // Feed readers guess these paths; the real feed is /feed.xml.
        source: "/:path(feed|rss|rss.xml|atom.xml)",
        destination: "/feed.xml",
        permanent: false,
      },
      {
        // IT training grew into its own top-level category.
        source: "/categories/education-it-training-and-career-services",
        destination: "/categories/it-training",
        permanent: true,
      },
      {
        // Desi Who's Who was renamed GoDesi Elite before launch.
        source: "/desi-whos-who/:path*",
        destination: "/desi-elite/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
