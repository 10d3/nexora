import { getRestaurantStats } from "@/lib/actions/action.data";
import { useQuery } from "@tanstack/react-query";
// import { getRestaurantStats } from "../actions/action.data";

export function useRestaurantStats(
  tenantId: string,
  dateFrom?: Date,
  dateTo?: Date
) {
  return useQuery({
    queryKey: [
      "restaurantStats",
      tenantId,
      dateFrom?.toISOString(),
      dateTo?.toISOString(),
    ],
    queryFn: async () => {
      const result = await getRestaurantStats(tenantId, dateFrom, dateTo);
      if (result.error) {
        throw new Error(result.error);
      }
      return result;
    },
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep unused data in cache for 10 minutes
  });
}

// Create smaller, more focused queries for specific parts of the dashboard
export function useTableStats(tenantId: string) {
  return useQuery({
    queryKey: ["tableStats", tenantId],
    queryFn: async () => {
      const result = await getRestaurantStats(tenantId);
      if (result.error) {
        throw new Error(result.error);
      }

      // Extract tablesByStatus safely
      const tablesByStatus = result.tablesByStatus || [];

      // Calculate total tables from tablesByStatus if not directly available
      const totalTables = tablesByStatus.reduce(
        (sum, item) => sum + (item.value || 0),
        0
      );

      return {
        tablesByStatus,
        totalTables,
      };
    },
    staleTime: 1 * 60 * 1000, // Tables data refreshes more frequently
  });
}

export function useReservationStats(tenantId: string) {
  return useQuery({
    queryKey: ["reservationStats", tenantId],
    queryFn: async () => {
      const result = await getRestaurantStats(tenantId);
      if (result.error) {
        throw new Error(result.error);
      }
      return {
        totalReservations: result.totalReservations,
        reservationsTrend: result.reservationsTrend,
        upcomingReservations: result.upcomingReservations,
      };
    },
    staleTime: 2 * 60 * 1000,
  });
}
