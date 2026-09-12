/** @type {import('next').NextConfig} */
const nextConfig = {
  // Tags every asset request with the build that asked for it, so Vercel's skew
  // protection can serve an open tab its own build instead of failing chunks.
  deploymentId: process.env.VERCEL_DEPLOYMENT_ID,
  images: {
    // Uploads live on Vercel Blob; without this the optimizer answers 400.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
        pathname: "/**",
      },
      // Avatars that Google and Facebook sign-in hand us.
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.fbcdn.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "graph.facebook.com",
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
        // The wall lives on the content desk alongside blog, events and news.
        source: "/admin/:desk(wall|social)",
        destination: "/admin/content#social",
        permanent: false,
      },
      {
        // The live visitor map and global chat were retired; live TV replaces
        // the page anyone reaching /live was looking for.
        source: "/live",
        destination: "/live-tv",
        permanent: false,
      },
      {
        // Desi Who's Who was renamed GoDesi Elite before launch.
        source: "/desi-whos-who/:path*",
        destination: "/desi-elite/:path*",
        permanent: true,
      },
      // Search engines still hold URLs from the old WordPress/Osclass godesi.com.
      { source: "/index.php", destination: "/", permanent: true },
      { source: "/index.php/:path*", destination: "/", permanent: true },
      {
        source: "/:lang(en|de|es|fr|it|nl|da|fi|pl|pt|ru|cs|zh|el|ro|th|hi)/:path*",
        destination: "/",
        permanent: true,
      },
      { source: "/:path(listing|vendor|vendors|product|products|shop|item)/:rest*", destination: "/categories", permanent: true },
      { source: "/:path(listing-category|category)/:rest*", destination: "/categories", permanent: true },
      { source: "/:path(vendors|products)", destination: "/categories", permanent: true },
      { source: "/add-listing", destination: "/add-business", permanent: true },
      { source: "/:path(your-name|yourname|your-business)", destination: "/add-business?utm_source=social", permanent: false },
      { source: "/about-us", destination: "/about", permanent: true },
      { source: "/privacy-policy", destination: "/privacy", permanent: true },
      { source: "/:path(author|user)/:rest*", destination: "/people", permanent: true },
      { source: "/wp-login.php", destination: "/login", permanent: true },
    ];
  },
};

export default nextConfig;
