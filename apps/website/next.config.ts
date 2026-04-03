import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  transpilePackages: ["@devport/ui"],
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
