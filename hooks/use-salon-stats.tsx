import { getSalonStats } from "@/lib/actions/action.data";
import { useQuery } from "@tanstack/react-query";

export function useSalonStats(
  tenantId: string,
  dateFrom?: Date,
  dateTo?: Date
) {
  return useQuery({
    queryKey: [
      "salonStats",
      tenantId,
      dateFrom?.toISOString(),
      dateTo?.toISOString(),
    ],
    queryFn: async () => {
      const result = await getSalonStats(tenantId, dateFrom, dateTo);
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
export function useAppointmentStats(tenantId: string) {
  return useQuery({
    queryKey: ["appointmentStats", tenantId],
    queryFn: async () => {
      const result = await getSalonStats(tenantId);
      if (result.error) {
        throw new Error(result.error);
      }
      return {
        appointmentsToday: result.appointmentsToday,
        appointmentsTrend: result.appointmentsTrend,
        upcomingAppointments: result.upcomingAppointments,
      };
    },
    staleTime: 1 * 60 * 1000, // Appointment data refreshes more frequently
  });
}

export function useStaffStats(tenantId: string) {
  return useQuery({
    queryKey: ["staffStats", tenantId],
    queryFn: async () => {
      const result = await getSalonStats(tenantId);
      if (result.error) {
        throw new Error(result.error);
      }
      return {
        availableStaff: result.availableStaff,
        staffSummary: result.staffSummary,
        staffUtilization: result.staffUtilization,
      };
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useServiceStats(tenantId: string) {
  return useQuery({
    queryKey: ["serviceStats", tenantId],
    queryFn: async () => {
      const result = await getSalonStats(tenantId);
      if (result.error) {
        throw new Error(result.error);
      }
      return {
        avgServiceTime: result.avgServiceTime,
        serviceTimeSummary: result.serviceTimeSummary,
        serviceTimeData: result.serviceTimeData,
      };
    },
    staleTime: 10 * 60 * 1000, // Service time data doesn't change as frequently
  });
}

export function useCustomerStats(tenantId: string) {
  return useQuery({
    queryKey: ["customerStats", tenantId],
    queryFn: async () => {
      const result = await getSalonStats(tenantId);
      if (result.error) {
        throw new Error(result.error);
      }
      return {
        customerRetention: result.customerRetention,
        retentionTrend: result.retentionTrend,
      };
    },
    staleTime: 30 * 60 * 1000, // Customer retention data changes slowly
  });
}