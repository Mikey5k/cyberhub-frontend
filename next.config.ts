import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable Turbopack entirely
  experimental: {
    // Empty config disables all experimental features including Turbopack
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;