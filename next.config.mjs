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
  async redirects() {
    return [
      {
        // IT training grew into its own top-level category.
        source: "/categories/education-it-training-and-career-services",
        destination: "/categories/it-training",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
