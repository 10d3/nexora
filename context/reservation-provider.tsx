/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useDashboard } from "./dashboard-provider";
import { addDays, subDays } from "date-fns";
import {
  getReservations,
  getResources,
} from "@/lib/actions/reservation-actions";

type ReservationContextType = {
  reservations: any[];
  resources: any[];
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  selectedReservation: any | null;
  setSelectedReservation: (reservation: any | null) => void;
  view: "table" | "board" | "calendar";
  setView: (view: "table" | "board" | "calendar") => void;
  search: string;
  setSearch: (search: string) => void;
  startDate: Date;
  setStartDate: (date: Date) => void;
  endDate: Date;
  setEndDate: (date: Date) => void;
  statusFilter: string[];
  setStatusFilter: (status: string[]) => void;
  resourceFilter: string[];
  setResourceFilter: (resources: string[]) => void;
  statusOptions: string[];
};

const ReservationContext = createContext<ReservationContextType | undefined>(
  undefined
);

export function ReservationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { tenantId, businessType } = useDashboard();
  const [reservations, setReservations] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReservation, setSelectedReservation] = useState<any | null>(
    null
  );
  const [view, setView] = useState<"table" | "board" | "calendar">("table");
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState(subDays(new Date(), 7));
  const [endDate, setEndDate] = useState(addDays(new Date(), 30));
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [resourceFilter, setResourceFilter] = useState<string[]>([]);

  // Status options based on the ReservationStatus enum
  const statusOptions = [
    "PENDING",
    "CONFIRMED",
    "CANCELLED",
    "COMPLETED",
    "NO_SHOW",
    "WAITING_LIST",
  ];

  const fetchData = async () => {
    if (!tenantId) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch resources
      const resourcesResult = await getResources(businessType, tenantId);

      if (resourcesResult.success) {
        setResources(resourcesResult.data || []);
      } else {
        setError(resourcesResult.error || "Failed to fetch resources");
      }

      // Fetch reservations
      const reservationsResult = await getReservations(
        businessType,
        tenantId,
        startDate,
        endDate,
        statusFilter.length > 0 ? statusFilter : undefined,
        resourceFilter.length > 0 ? resourceFilter : undefined,
        search || undefined
      );

      if (reservationsResult.success) {
        setReservations(reservationsResult.data || []);
      } else {
        setError(reservationsResult.error || "Failed to fetch reservations");
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
  }, [tenantId, startDate, endDate, statusFilter, resourceFilter, search]);

  const refreshData = async () => {
    await fetchData();
  };

  const value = {
    reservations,
    resources,
    loading,
    error,
    refreshData,
    selectedReservation,
    setSelectedReservation,
    view,
    setView,
    search,
    setSearch,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    statusFilter,
    setStatusFilter,
    resourceFilter,
    setResourceFilter,
    statusOptions,
  };

  return (
    <ReservationContext.Provider value={value}>
      {children}
    </ReservationContext.Provider>
  );
}

export function useReservation() {
  const context = useContext(ReservationContext);
  if (context === undefined) {
    throw new Error("useReservation must be used within a ReservationProvider");
  }
  return context;
}
