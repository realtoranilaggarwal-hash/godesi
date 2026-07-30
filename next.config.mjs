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
