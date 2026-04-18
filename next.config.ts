import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/projects/moto", destination: "/projects/moto/index.html" },
    ];
  },
};

export default nextConfig;
