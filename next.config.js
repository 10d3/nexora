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
  },
  headers: async () => {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true'
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: `*.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
          }
        ]
      }
    ];
  }
};

module.exports = nextConfig;