/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["m.media-amazon.com"],
    domains: ["covers.openlibrary.org"],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
