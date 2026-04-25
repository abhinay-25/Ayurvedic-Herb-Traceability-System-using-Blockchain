/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@rainbow-me/rainbowkit'],
  outputFileTracingRoot: __dirname,
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
}

module.exports = nextConfig