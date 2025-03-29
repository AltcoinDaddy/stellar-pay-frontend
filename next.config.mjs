/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't attempt to bundle these Node.js things on the client
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    // Tell webpack not to bundle these problematic native modules
    config.externals = [...(config.externals || []), "sodium-native"];

    return config;
  },
  // Using Next.js experimental features to handle the libraries better
  experimental: {
    serverComponentsExternalPackages: ["stellar-sdk", "sodium-native"],
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        hostname: "www.pexelx.com",
        protocol: "https",
      },
    ],
  },
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};

// Use ES module export syntax instead of CommonJS
export default nextConfig;
