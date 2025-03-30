const nextConfig = {
  experimental: {
    allowedDevOrigins: [
      "localhost:3000",
      "pos.localhost:3000",
      "*.localhost:3000",
      "salon-p.localhost:3000",
      "marketing.localhost:3000",
    ],
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        "pos.localhost:3000",
        "*.localhost:3000",
        "salon-p.localhost:3000",
        "marketing.localhost:3000",
      ],
    },
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        'fs/promises': false,
        net: false,
        tls: false,
        child_process: false,
      };
    }
    return config;
  }
};

module.exports = nextConfig;