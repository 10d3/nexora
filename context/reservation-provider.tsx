/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useDashboard } from "./dashboard-provider";
import { addDays, subDays } from "date-fns";
import {
  getReservations,
  getResources,
} from "@/lib/actions/reservation-actions";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import db, { IReservation } from "@/lib/services/db.service";

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
  isOffline: boolean;
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
  const [isOffline, setIsOffline] = useState(false);

  // Check online status on mount and when it changes
  useEffect(() => {
    const handleOnlineStatus = () => {
      setIsOffline(!navigator.onLine);
    };

    // Set initial status
    setIsOffline(!navigator.onLine);

    // Add event listeners
    window.addEventListener("online", handleOnlineStatus);
    window.addEventListener("offline", handleOnlineStatus);

    // Clean up
    return () => {
      window.removeEventListener("online", handleOnlineStatus);
      window.removeEventListener("offline", handleOnlineStatus);
    };
  }, []);

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

      try {
        // If offline, get data from IndexedDB
        if (isOffline) {
          const resources = await db.getResourcesByTenant(tenantId);
          return resources;
        }

        // If online, get data from server
        const result = await getResources(businessType, tenantId);
        if (!result.success) {
          throw new Error(result.error || "Failed to fetch resources");
        }

        // Store the fetched data in IndexedDB for offline use
        if (result.data && Array.isArray(result.data)) {
          for (const resource of result.data) {
            await db.saveResource({
              ...resource,
              tenantId,
              status: 'capacity' in resource ? resource.status : "AVAILABLE"
            });
          }
        }

        return result.data || [];
      } catch (error) {
        console.error("Error fetching resources:", error);

        // If there's an error and we have IndexedDB data, use that as fallback
        try {
          const resources = await db.getResourcesByTenant(tenantId);
          return resources;
        } catch (dbError) {
          console.error("IndexedDB fallback failed:", dbError);
          throw error;
        }
      }
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

      try {
        // If offline, get data from IndexedDB
        if (isOffline) {
          const reservations = await db.getReservationsByTenant(tenantId);

          // Filter reservations based on date range
          let filteredReservations = reservations.filter((reservation) => {
            const start = new Date(reservation.reservationTime);
            return start >= startDate && start <= endDate;
          });

          // Apply status filter
          if (statusFilter.length > 0) {
            filteredReservations = filteredReservations.filter((reservation) =>
              statusFilter.includes(reservation.status)
            );
          }

          // Apply resource filter
          if (resourceFilter.length > 0) {
            filteredReservations = filteredReservations.filter((reservation) =>
              resourceFilter.includes(reservation.tableId || "")
            );
          }

          // Apply search filter
          if (search) {
            const searchLower = search.toLowerCase();
            filteredReservations = filteredReservations.filter(
              (reservation) =>
                reservation.customerName?.toLowerCase().includes(searchLower) ||
                reservation.specialRequests?.toLowerCase().includes(searchLower)
            );
          }

          return filteredReservations;
        }

        // If online, get data from server
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

        // Store the fetched data in IndexedDB for offline use
        if (result.data && Array.isArray(result.data)) {
          for (const reservation of result.data) {
            // Map API response to IReservation format
            const mappedReservation: IReservation = {
              id: reservation.id,
              customerName: reservation.customerName,
              customerPhone: reservation.customerPhone,
              customerEmail: reservation.customerEmail,
              specialRequests: reservation.notes,
              status: reservation.status,
              partySize: reservation.size,
              reservationTime: new Date(reservation.startTime),
              endTime: reservation.endTime
                ? new Date(reservation.endTime)
                : null,
              tableId: reservation.resourceId,
              tenantId,
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            await db.saveReservation(mappedReservation);
          }
        }

        return result.data || [];
      } catch (error) {
        console.error("Error fetching reservations:", error);

        // If there's an error and we have IndexedDB data, use that as fallback
        try {
          const reservations = await db.getReservationsByTenant(tenantId);
          return reservations;
        } catch (dbError) {
          console.error("IndexedDB fallback failed:", dbError);
          throw error;
        }
      }
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
    isOffline,
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
