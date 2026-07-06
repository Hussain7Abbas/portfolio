import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  transpilePackages: [],
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
