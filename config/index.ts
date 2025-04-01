/**
 * Application configuration
 */
export const config = {
  app: {
    name: "Nexora",
    description: "A modern multi-tenant Point of Sale (POS) system",
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  },
  api: {
    baseUrl: "/api",
    timeout: 10000, // 10 seconds
  },
  tanstack: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      gcTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
  auth: {
    sessionMaxAge: 30 * 24 * 60 * 60, // 30 days
  },
  features: {
    optimisticUpdates: true,
  },
};

/**
 * Environment-specific configuration
 */
export const env = {
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",
  isTest: process.env.NODE_ENV === "test",
};
