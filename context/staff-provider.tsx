/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useDashboard } from "./dashboard-provider";
import { BusinessType } from "@prisma/client";
import { getStaff } from "@/lib/actions/staff-actions"; // Import the server action

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
};

const StaffContext = createContext<StaffContextType | undefined>(undefined);

export function StaffProvider({ children }: { children: React.ReactNode }) {
  const { tenantId, businessType } = useDashboard();
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
          "Bellhop",
        ];
      case "PHARMACIE":
        return ["Pharmacist", "Pharmacy Technician", "Consultant"];
      case "EDUCATION":
        return ["Teacher", "Instructor", "Administrator", "Counselor"];
      case "CONSTRUCTION":
        return ["Foreman", "Contractor", "Engineer", "Architect", "Laborer"];
      default:
        return ["General", "Specialist", "Manager"];
    }
  };

  const specializationOptions = getSpecializationOptions(businessType);

  const fetchData = async () => {
    if (!tenantId || !businessType) return;

    setLoading(true);
    setError(null);

    try {
      // Use the server action instead of fetch API
      const result = await getStaff(
        businessType,
        tenantId,
        search,
        specializationFilter.length > 0 ? specializationFilter : undefined
      );

      if (result.success) {
        setStaff(result.data || []);
      } else {
        setError(result.error || "Failed to fetch staff");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tenantId) {
      fetchData();
    }
  }, [tenantId, search, specializationFilter]);

  const refreshData = async () => {
    await fetchData();
  };

  const value = {
    staff,
    loading,
    error,
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
  };

  return (
    <StaffContext.Provider value={value}>{children}</StaffContext.Provider>
  );
}

export function useStaff() {
  const context = useContext(StaffContext);
  if (context === undefined) {
    throw new Error("useStaff must be used within a StaffProvider");
  }
  return context;
}