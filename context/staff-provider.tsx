/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { createContext, useContext, useState } from "react";
import { useDashboard } from "./dashboard-provider";
import { BusinessType } from "@prisma/client";
import { getStaff } from "@/lib/actions/staff-actions";
import { useQuery, useQueryClient } from "@tanstack/react-query";

type StaffContextType = {
  staff: any[];
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  selectedStaff: any | null;
  setSelectedStaff: (staff: any | null) => void;
  view: "table" | "grid" | "calendar";
  setView: (view: "table" | "grid" | "calendar") => void;
  search: string;
  setSearch: (search: string) => void;
  specializationFilter: string[];
  setSpecializationFilter: (specializations: string[]) => void;
  specializationOptions: string[];
  updateLocalStaff: (updatedStaff: any) => void;
};

const StaffContext = createContext<StaffContextType | undefined>(undefined);

export function StaffProvider({ children }: { children: React.ReactNode }) {
  const { tenantId, businessType } = useDashboard();
  const queryClient = useQueryClient();
  const [selectedStaff, setSelectedStaff] = useState<any | null>(null);
  const [view, setView] = useState<"table" | "grid" | "calendar">("table");
  const [search, setSearch] = useState("");
  const [specializationFilter, setSpecializationFilter] = useState<string[]>(
    []
  );

  // Specialization options based on business type
  const getSpecializationOptions = (businessType: BusinessType): string[] => {
    switch (businessType) {
      case "SALON":
        return [
          "Hair Stylist",
          "Colorist",
          "Nail Technician",
          "Makeup Artist",
          "Esthetician",
        ];
      case "SERVICE":
        return ["Technician", "Consultant", "Specialist", "Therapist"];
      case "RESTAURANT":
        return ["Chef", "Waiter", "Bartender", "Host", "Kitchen Staff"];
      case "HOTEL":
        return [
          "Receptionist",
          "Concierge",
          "Housekeeper",
          "Maintenance",
          "Manager",
        ];
      default:
        return ["Manager", "Associate", "Specialist"];
    }
  };

  const specializationOptions = getSpecializationOptions(
    businessType || "RETAIL"
  );

  // Fetch staff data using React Query
  const {
    data: staffData = [],
    isLoading: loading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ["staff", businessType, tenantId, search, specializationFilter],
    queryFn: async () => {
      const result = await getStaff(
        businessType || "RETAIL",
        tenantId || "",
        search,
        specializationFilter.length > 0 ? specializationFilter : undefined
      );

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch staff");
      }

      return result.data;
    },
    enabled: !!tenantId && !!businessType,
  });

  // Function to refresh data
  const refreshData = async () => {
    await refetch();
  };

  // Function to update local staff data (for optimistic updates)
  const updateLocalStaff = (updatedStaff: any) => {
    queryClient.setQueryData(
      ["staff", businessType, tenantId, search, specializationFilter],
      (oldData: any[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map((staff) =>
          staff.id === updatedStaff.id ? updatedStaff : staff
        );
      }
    );
  };

  return (
    <StaffContext.Provider
      value={{
        staff: staffData,
        loading,
        error: queryError ? (queryError as Error).message : null,
        refreshData,
        selectedStaff,
        setSelectedStaff,
        view,
        setView,
        search,
        setSearch,
        specializationFilter,
        setSpecializationFilter,
        specializationOptions,
        updateLocalStaff,
      }}
    >
      {children}
    </StaffContext.Provider>
  );
}

export function useStaff() {
  const context = useContext(StaffContext);
  if (context === undefined) {
    throw new Error("useStaff must be used within a StaffProvider");
  }
  return context;
}
