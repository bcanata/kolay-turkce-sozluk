import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable React Dev Overlay to avoid localStorage issues during SSR
  reactStrictMode: true,
  experimental: {
    // Try to disable the error overlay
    disableOptimizedLoading: true,
  },
};

export default nextConfig;
