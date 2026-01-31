/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone', // For Docker and optimized deployments
  images: {
    unoptimized: true, // Optional: for environments without Image Optimization
  },
}

module.exports = nextConfig
