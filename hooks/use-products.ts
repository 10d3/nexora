"use client";

import { useQuery } from "@tanstack/react-query";
import { getProducts, getProductStats } from "@/lib/actions/action.data";
import { useDashboard } from "@/context/dashboard-provider";

// Assuming we have a way to get the current tenant ID
// This could come from a context, auth provider, etc.
// const TENANT_ID = "tenant_123"; // Replace with actual tenant ID or fetch logic

export function useProducts() {
  const { businessType, tenantId } = useDashboard();

  return useQuery({
    queryKey: ["products", businessType, tenantId],
    queryFn: async () => {
      const result = await getProducts(businessType, tenantId as string);
      if (result.error) {
        throw new Error(result.error);
      }
      return result.products;
    },
  });
}

export function useProductStats() {
  const { businessType, dateRange, tenantId } = useDashboard();

  return useQuery({
    queryKey: [
      "productStats",
      businessType,
      tenantId,
      dateRange.from,
      dateRange.to,
    ],
    queryFn: async () => {
      const result = await getProductStats(businessType, tenantId as string, dateRange.from, dateRange.to);
      if (result.error) {
        throw new Error(result.error);
      }
      return result;
    },
  });
}
