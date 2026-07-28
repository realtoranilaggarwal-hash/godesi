/** @type {import('next').NextConfig} */
const nextConfig = {
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
