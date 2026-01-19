/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
    ],
  },
  // Backend klasörünü build'den hariç tut
  webpack: (config, { isServer }) => {
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/backend/**', '**/node_modules/**'],
    };
    return config;
  },
  // TypeScript type checking sırasında backend'i ignore et
  typescript: {
    ignoreBuildErrors: false,
  },
  // ESLint sırasında backend'i ignore et
  eslint: {
    ignoreDuringBuilds: false,
  },
}

module.exports = nextConfig

