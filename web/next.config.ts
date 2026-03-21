import { existsSync } from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

/** Tek .env: ENV_PATH → /root/data/.env → web/.env */
function resolveEnvPath(): string {
  if (process.env.ENV_PATH) return process.env.ENV_PATH;
  if (existsSync("/root/data/.env")) return "/root/data/.env";
  return path.join(process.cwd(), ".env");
}

dotenv.config({ path: resolveEnvPath(), override: true });

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
