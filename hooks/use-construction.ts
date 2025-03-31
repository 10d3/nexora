"use client";

import { useQuery } from "@tanstack/react-query";
// import { getConstructionStats } from "@/lib/actions/construction-actions";
import { useDashboard } from "@/context/dashboard-provider";
import { getConstructionStats } from "@/lib/actions/construction-action";

export function useConstructionStats() {
  const { dateRange, tenantId } = useDashboard();

  return useQuery({
    queryKey: ["constructionStats", tenantId, dateRange.from, dateRange.to],
    queryFn: async () => {
      const result = await getConstructionStats(
        tenantId as string,
        dateRange.from,
        dateRange.to
      );
      if (result.error) {
        throw new Error(result.error);
      }
      return result;
    },
    enabled: !!tenantId,
  });
}
