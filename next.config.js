/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  optimizeFonts: true,
  images: { unoptimized: true },
  reactStrictMode: true,
};

module.exports = nextConfig;
