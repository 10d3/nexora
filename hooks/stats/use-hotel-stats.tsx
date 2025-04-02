import { getHotelStats } from "@/lib/actions/action.data";
import { useQuery } from "@tanstack/react-query";

export function useHotelStats(
  tenantId: string,
  dateFrom?: Date,
  dateTo?: Date
) {
  return useQuery({
    queryKey: [
      "hotelStats",
      tenantId,
      dateFrom?.toISOString(),
      dateTo?.toISOString(),
    ],
    queryFn: async () => {
      const result = await getHotelStats(tenantId, dateFrom, dateTo);
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
export function useRoomStats(tenantId: string) {
  return useQuery({
    queryKey: ["roomStats", tenantId],
    queryFn: async () => {
      const result = await getHotelStats(tenantId);
      if (result.error) {
        throw new Error(result.error);
      }
      return {
        roomsByStatus: result.roomsByStatus,
        totalRooms: result.totalRooms,
        occupiedRooms: result.occupiedRooms,
        availableRooms: result.availableRooms,
        maintenanceRooms: result.maintenanceRooms,
        occupancyRate: result.occupancyRate,
        occupancyTrend: result.occupancyTrend,
      };
    },
    staleTime: 1 * 60 * 1000, // Room data refreshes more frequently
  });
}

export function useGuestStats(tenantId: string) {
  return useQuery({
    queryKey: ["guestStats", tenantId],
    queryFn: async () => {
      const result = await getHotelStats(tenantId);
      if (result.error) {
        throw new Error(result.error);
      }
      return {
        currentGuests: result.currentGuests,
        guestsSummary: result.guestsSummary,
        checkInsToday: result.checkInsToday,
        checkInsSummary: result.checkInsSummary,
        checkOutsToday: result.checkOutsToday,
        checkOutsSummary: result.checkOutsSummary,
        upcomingCheckIns: result.upcomingCheckIns,
      };
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useRevenueStats(tenantId: string) {
  return useQuery({
    queryKey: ["revenueStats", tenantId],
    queryFn: async () => {
      const result = await getHotelStats(tenantId);
      if (result.error) {
        throw new Error(result.error);
      }
      return {
        revPAR: result.revPAR,
        revPARTrend: result.revPARTrend,
      };
    },
    staleTime: 10 * 60 * 1000, // Revenue data doesn't change as frequently
  });
}