import { getConstructionStats } from "@/lib/actions/action.data";
import { useQuery } from "@tanstack/react-query";

export function useConstructionStats(
  tenantId: string,
  dateFrom?: Date,
  dateTo?: Date
) {
  return useQuery({
    queryKey: [
      "constructionStats",
      tenantId,
      dateFrom?.toISOString(),
      dateTo?.toISOString(),
    ],
    queryFn: async () => {
      const result = await getConstructionStats(tenantId, dateFrom, dateTo);
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
export function useProjectStats(tenantId: string) {
  return useQuery({
    queryKey: ["projectStats", tenantId],
    queryFn: async () => {
      const result = await getConstructionStats(tenantId);
      if (result.error) {
        throw new Error(result.error);
      }

      return {
        activeProjects: result.activeProjects,
        projectsSummary: result.projectsSummary,
        projectProgress: result.projectProgress,
        projects: result.projects,
      };
    },
    staleTime: 5 * 60 * 1000, // Project data refreshes every 5 minutes
  });
}

export function useWorkforceStats(tenantId: string) {
  return useQuery({
    queryKey: ["workforceStats", tenantId],
    queryFn: async () => {
      const result = await getConstructionStats(tenantId);
      if (result.error) {
        throw new Error(result.error);
      }
      return {
        workersOnsite: result.workersOnsite,
        workersSummary: result.workersSummary,
        workerAllocation: result.workerAllocation,
      };
    },
    staleTime: 2 * 60 * 1000, // Workforce data refreshes more frequently
  });
}

export function useEquipmentStats(tenantId: string) {
  return useQuery({
    queryKey: ["equipmentStats", tenantId],
    queryFn: async () => {
      const result = await getConstructionStats(tenantId);
      if (result.error) {
        throw new Error(result.error);
      }
      return {
        equipmentUsage: result.equipmentUsage,
        equipmentSummary: result.equipmentSummary,
        equipmentUsageTrend: result.equipmentUsageTrend,
      };
    },
    staleTime: 3 * 60 * 1000, // Equipment data refreshes every 3 minutes
  });
}

export function useTaskStats(tenantId: string) {
  return useQuery({
    queryKey: ["taskStats", tenantId],
    queryFn: async () => {
      const result = await getConstructionStats(tenantId);
      if (result.error) {
        throw new Error(result.error);
      }
      return {
        projectTimeline: result.projectTimeline,
        timelineSummary: result.timelineSummary,
        taskCompletion: result.taskCompletion,
      };
    },
    staleTime: 2 * 60 * 1000, // Task data refreshes every 2 minutes
  });
}
