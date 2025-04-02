import { getSupermarketStats } from "@/lib/actions/action.data";
import { useQuery } from "@tanstack/react-query";

export function useSupermarketStats(
  tenantId: string,
  dateFrom?: Date,
  dateTo?: Date
) {
  return useQuery({
    queryKey: [
      "supermarketStats",
      tenantId,
      dateFrom?.toISOString(),
      dateTo?.toISOString(),
    ],
    queryFn: async () => {
      const result = await getSupermarketStats(tenantId, dateFrom, dateTo);
      if (result.error) {
        throw new Error(result.error);
      }
      return result;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useSalesStats(tenantId: string) {
  return useQuery({
    queryKey: ["salesStats", tenantId],
    queryFn: async () => {
      const result = await getSupermarketStats(tenantId);
      if (result.error) {
        throw new Error(result.error);
      }
      return {
        salesToday: result.salesToday,
        salesTrend: result.salesTrend,
        transactionsToday: result.transactionsToday,
        transactionsTrend: result.transactionsTrend,
        salesTrends: result.salesTrends,
        departmentSales: result.departmentSales,
        departmentPerformance: result.departmentPerformance,
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useInventoryStats(tenantId: string) {
  return useQuery({
    queryKey: ["inventoryStats", tenantId],
    queryFn: async () => {
      const result = await getSupermarketStats(tenantId);
      if (result.error) {
        throw new Error(result.error);
      }
      return {
        inventoryItems: result.inventoryItems,
        inventorySummary: result.inventorySummary,
        inventoryTrends: result.inventoryTrends,
        topSellingProducts: result.topSellingProducts,
      };
    },
    staleTime: 10 * 60 * 1000, // Inventory data changes less frequently
  });
}

export function useDeliveryStats(tenantId: string) {
  return useQuery({
    queryKey: ["deliveryStats", tenantId],
    queryFn: async () => {
      const result = await getSupermarketStats(tenantId);
      if (result.error) {
        throw new Error(result.error);
      }
      return {
        deliveriesToday: result.deliveriesToday,
        deliveriesSummary: result.deliveriesSummary,
      };
    },
    staleTime: 15 * 60 * 1000,
  });
}