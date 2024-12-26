/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["m.media-amazon.com"],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
