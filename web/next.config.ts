import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost", pathname: "/**" },
      { protocol: "https", hostname: "api.wirbooks.com.tr", pathname: "/**" },
      { protocol: "https", hostname: "wirbooks.com.tr", pathname: "/**" },
    ],
  },
};

export default nextConfig;
