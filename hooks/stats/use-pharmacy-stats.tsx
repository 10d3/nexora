import { getPharmacyStats } from "@/lib/actions/action.data";
import { useQuery } from "@tanstack/react-query";

export function usePharmacyStats(
  tenantId: string,
  dateFrom?: Date,
  dateTo?: Date
) {
  return useQuery({
    queryKey: [
      "pharmacyStats",
      tenantId,
      dateFrom?.toISOString(),
      dateTo?.toISOString(),
    ],
    queryFn: async () => {
      const result = await getPharmacyStats(tenantId, dateFrom, dateTo);
      if (result.error) {
        throw new Error(result.error);
      }
      return result;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function usePrescriptionStats(tenantId: string) {
  return useQuery({
    queryKey: ["prescriptionStats", tenantId],
    queryFn: async () => {
      const result = await getPharmacyStats(tenantId);
      if (result.error) {
        throw new Error(result.error);
      }
      return {
        prescriptionsToday: result.prescriptionsToday,
        prescriptionsSummary: result.prescriptionsSummary,
        totalPrescriptions: result.totalPrescriptions,
        prescriptionTrends: result.prescriptionTrends,
        prescriptionTracking: result.prescriptionTracking,
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useInventoryStats(tenantId: string) {
  return useQuery({
    queryKey: ["inventoryStats", tenantId],
    queryFn: async () => {
      const result = await getPharmacyStats(tenantId);
      if (result.error) {
        throw new Error(result.error);
      }
      return {
        inventoryItems: result.inventoryItems,
        inventorySummary: result.inventorySummary,
        expiringSoon: result.expiringSoon,
        expiringSummary: result.expiringSummary,
        expiringMedications: result.expiringMedications,
        inventoryTrends: result.inventoryTrends,
        medicationCategories: result.medicationCategories,
      };
    },
    staleTime: 10 * 60 * 1000, // Inventory data changes less frequently
  });
}

export function useInsuranceClaimsStats(tenantId: string) {
  return useQuery({
    queryKey: ["insuranceClaimsStats", tenantId],
    queryFn: async () => {
      const result = await getPharmacyStats(tenantId);
      if (result.error) {
        throw new Error(result.error);
      }
      return {
        insuranceClaims: result.insuranceClaims,
        claimsSummary: result.claimsSummary,
      };
    },
    staleTime: 15 * 60 * 1000, // Claims data changes less frequently
  });
}