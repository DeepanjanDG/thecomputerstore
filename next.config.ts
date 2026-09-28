import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    // Admin uploads are stored in Vercel Blob when deployed.
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
    // Admin product image uploads go through server actions.
    serverActions: { bodySizeLimit: "12mb" },
  },
  async redirects() {
    return [
      { source: "/custom-pc-builder", destination: "/pc-builder", permanent: true },
      { source: "/builder", destination: "/pc-builder", permanent: true },
    ];
  },
};

export default nextConfig;
