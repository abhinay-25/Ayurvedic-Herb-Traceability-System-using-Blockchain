/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@rainbow-me/rainbowkit'],
  webpack: (config, { isServer }) => {
    // Handle missing React Native dependencies
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        '@react-native-async-storage/async-storage': false,
        'pino-pretty': false,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  turbopack: {},
  serverExternalPackages: ['pino', 'pino-pretty'],
}

module.exports = nextConfig