"use client";

import { useQuery } from "@tanstack/react-query";
import { getOrders, getOrderStats } from "@/lib/actions/action.data";
import { useDashboard } from "@/context/dashboard-provider";

// Assuming we have a way to get the current tenant ID
// const TENANT_ID = "tenant_123"; // Replace with actual tenant ID or fetch logic

export function useOrders(limit = 10) {
  const { businessType, tenantId } = useDashboard();

  return useQuery({
    queryKey: ["orders", businessType, tenantId, limit],
    queryFn: async () => {
      const result = await getOrders(businessType, tenantId as string, limit);
      if (result.error) {
        throw new Error(result.error);
      }
      return result.orders;
    },
  });
}

export function useOrderStats() {
  const { businessType, dateRange, tenantId } = useDashboard();

  return useQuery({
    queryKey: [
      "orderStats",
      businessType,
      tenantId,
      dateRange.from,
      dateRange.to,
    ],
    queryFn: async () => {
      const result = await getOrderStats(
        businessType,
        tenantId as string,
        dateRange.from,
        dateRange.to
      );
      if (result.error) {
        throw new Error(result.error);
      }
      return result;
    },
  });
}
