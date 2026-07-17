import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Explicitly set the workspace root to this project directory so Turbopack
    // doesn't get confused by a package-lock.json in a parent directory.
    root: process.cwd(),
  },
  experimental: {
    serverActions: {
      // Default is 1MB, which rejects most phone-photo uploads (BizRox posts,
      // payment screenshots) before the action runs. Uploads allow up to 8MB
      // files; 10MB leaves headroom for FormData overhead.
      bodySizeLimit: "10mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "source.unsplash.com",
      },
      // YouTube thumbnails (for BizRox video posts)
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "img.youtube.com" },
    ],
  },
};

export default nextConfig;
