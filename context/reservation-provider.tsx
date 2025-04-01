/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { createContext, useContext, useState } from "react";
import { useDashboard } from "./dashboard-provider";
import { addDays, subDays } from "date-fns";
import {
  getReservations,
  getResources,
} from "@/lib/actions/reservation-actions";
import { useQuery, useQueryClient } from "@tanstack/react-query";

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
  updateLocalReservation: (updatedReservation: any) => void;
  addLocalReservation: (newReservation: any) => void;
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
  const queryClient = useQueryClient();
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

  // Use TanStack Query for resources
  const resourcesQuery = useQuery({
    queryKey: ["resources", businessType, tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const result = await getResources(businessType, tenantId);
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch resources");
      }
      return result.data || [];
    },
    enabled: !!tenantId,
  });

  // Use TanStack Query for reservations
  const reservationsQuery = useQuery({
    queryKey: [
      "reservations",
      businessType,
      tenantId,
      startDate,
      endDate,
      statusFilter,
      resourceFilter,
      search,
    ],
    queryFn: async () => {
      if (!tenantId) return [];
      const result = await getReservations(
        businessType,
        tenantId,
        startDate,
        endDate,
        statusFilter.length > 0 ? statusFilter : undefined,
        resourceFilter.length > 0 ? resourceFilter : undefined,
        search || undefined
      );
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch reservations");
      }
      return result.data || [];
    },
    enabled: !!tenantId,
  });

  // Function to manually update a reservation in the local cache
  const updateLocalReservation = (updatedReservation: any) => {
    queryClient.setQueryData(
      [
        "reservations",
        businessType,
        tenantId,
        startDate,
        endDate,
        statusFilter,
        resourceFilter,
        search,
      ],
      (oldData: any[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map((reservation) =>
          reservation.id === updatedReservation.id
            ? updatedReservation
            : reservation
        );
      }
    );
  };

  // Function to manually add a reservation to the local cache
  const addLocalReservation = (newReservation: any) => {
    queryClient.setQueryData(
      [
        "reservations",
        businessType,
        tenantId,
        startDate,
        endDate,
        statusFilter,
        resourceFilter,
        search,
      ],
      (oldData: any[] | undefined) => {
        if (!oldData) return [newReservation];
        return [...oldData, newReservation];
      }
    );
  };

  const refreshData = async () => {
    await queryClient.invalidateQueries({
      queryKey: ["reservations", businessType, tenantId],
    });
    await queryClient.invalidateQueries({
      queryKey: ["resources", businessType, tenantId],
    });
  };

  const value = {
    reservations: reservationsQuery.data || [],
    resources: resourcesQuery.data || [],
    loading: reservationsQuery.isLoading || resourcesQuery.isLoading,
    error:
      reservationsQuery.error?.message || resourcesQuery.error?.message || null,
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
    updateLocalReservation,
    addLocalReservation,
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
