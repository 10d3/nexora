"use client";

import { useQuery } from "@tanstack/react-query";
import { getRestaurantStats } from "@/lib/actions/action.data";
import { useDashboard } from "@/context/dashboard-provider";

export function useRestaurantStats() {
  const { dateRange, tenantId } = useDashboard();

  return useQuery({
    queryKey: ["restaurantStats", tenantId, dateRange.from, dateRange.to],
    queryFn: async () => {
      const result = await getRestaurantStats(
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
