/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

/**
 * Centralized query keys for consistent cache management
 */
export const queryKeys = {
  // Restaurant related keys
  restaurantStats: (tenantId: string, from?: Date, to?: Date) =>
    ["restaurantStats", tenantId, from, to] as const,

  // Kitchen display keys
  activeOrders: (tenantId: string) => ["activeOrders", tenantId] as const,

  // Add other query keys as needed
  reservations: (businessType: string, tenantId: string, filters?: any) =>
    ["reservations", businessType, tenantId, filters] as const,
};
