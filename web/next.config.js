const { existsSync } = require("node:fs");
const path = require("node:path");
const dotenv = require("dotenv");

/** Tek .env: ENV_PATH → /root/data/.env → web/.env */
function resolveEnvPath() {
  if (process.env.ENV_PATH) return process.env.ENV_PATH;
  if (existsSync("/root/data/.env")) return "/root/data/.env";
  return path.join(process.cwd(), ".env");
}

dotenv.config({ path: resolveEnvPath(), override: true });

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    staticWorkerRequestDeduping: false,
  },
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost", pathname: "/**" },
      { protocol: "https", hostname: "api.wirbooks.com.tr", pathname: "/**" },
      { protocol: "https", hostname: "wirbooks.com.tr", pathname: "/**" },
    ],
  },
};

module.exports = nextConfig;