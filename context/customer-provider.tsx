/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useDashboard } from "./dashboard-provider";
import { getCustomers } from "@/lib/actions/customer.actions";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import db from "@/lib/services/db.service";

type CustomerContextType = {
  customers: any[];
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  selectedCustomer: any | null;
  setSelectedCustomer: (customer: any | null) => void;
  search: string;
  setSearch: (search: string) => void;
  sortBy: string;
  setSortBy: (sortBy: string) => void;
  sortOrder: "asc" | "desc";
  setSortOrder: (sortOrder: "asc" | "desc") => void;
  updateLocalCustomer: (updatedCustomer: any) => void;
  addLocalCustomer: (newCustomer: any) => void;
  removeLocalCustomer: (customerId: string) => void;
  totalCustomers: number;
  limit: number;
  setLimit: (limit: number) => void;
  offset: number;
  setOffset: (offset: number) => void;
  isOffline: boolean;
};

const CustomerContext = createContext<CustomerContextType | undefined>(
  undefined
);

export function CustomerProvider({ children }: { children: React.ReactNode }) {
  const { tenantId } = useDashboard();
  const queryClient = useQueryClient();
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("lastName");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(0);
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

  // Use TanStack Query for customers with IndexedDB fallback
  const customersQuery = useQuery({
    queryKey: ["customers", tenantId, search, sortBy, sortOrder, limit, offset],
    queryFn: async () => {
      if (!tenantId) return { data: [], meta: { total: 0 } };

      try {
        // If offline, get data from IndexedDB
        if (isOffline) {
          const customers = await db.getCustomerProfilesByTenant(tenantId);

          // Filter out deleted customers
          let filteredCustomers = customers.filter(
            (customer) => !customer.deletedAt
          );

          // Apply search filter
          if (search) {
            const searchLower = search.toLowerCase();
            filteredCustomers = filteredCustomers.filter(
              (customer) =>
                customer.firstName?.toLowerCase().includes(searchLower) ||
                customer.lastName?.toLowerCase().includes(searchLower) ||
                customer.email?.toLowerCase().includes(searchLower) ||
                customer.phone?.includes(search)
            );
          }

          // Apply sorting
          filteredCustomers.sort((a, b) => {
            const valueA = a[sortBy] || "";
            const valueB = b[sortBy] || "";

            if (typeof valueA === "string" && typeof valueB === "string") {
              return sortOrder === "asc"
                ? valueA.localeCompare(valueB)
                : valueB.localeCompare(valueA);
            }

            return sortOrder === "asc"
              ? valueA > valueB
                ? 1
                : -1
              : valueB > valueA
                ? 1
                : -1;
          });

          // Apply pagination
          const total = filteredCustomers.length;
          const paginatedCustomers = filteredCustomers.slice(
            offset,
            offset + limit
          );

          return {
            data: paginatedCustomers,
            meta: { total },
          };
        }

        // If online, get data from server
        const result = await getCustomers(
          tenantId,
          search || undefined,
          sortBy,
          sortOrder,
          limit,
          offset
        );

        if (!result.success) {
          throw new Error(result.error || "Failed to fetch customers");
        }

        // Store the fetched data in IndexedDB for offline use
        if (result.data && Array.isArray(result.data)) {
          for (const customer of result.data) {
            await db.saveCustomerProfile({
              ...customer,
              tenantId,
            });
          }
        }

        return result;
      } catch (error) {
        console.error("Error fetching customers:", error);

        // If there's an error and we have IndexedDB data, use that as fallback
        try {
          const customers = await db.getCustomerProfilesByTenant(tenantId);
          const filteredCustomers = customers.filter(
            (customer) => !customer.deletedAt
          );
          return {
            data: filteredCustomers.slice(offset, offset + limit),
            meta: { total: filteredCustomers.length },
          };
        } catch (dbError) {
          console.error("IndexedDB fallback failed:", dbError);
          throw error; // Re-throw the original error if IndexedDB also fails
        }
      }
    },
    enabled: !!tenantId,
  });

  // Function to manually update a customer in the local cache
  const updateLocalCustomer = (updatedCustomer: any) => {
    queryClient.setQueryData(
      ["customers", tenantId, search, sortBy, sortOrder, limit, offset],
      (oldData: any | undefined) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          data: oldData.data.map((customer: any) =>
            customer.id === updatedCustomer.id ? updatedCustomer : customer
          ),
        };
      }
    );
  };

  // Function to manually add a customer to the local cache
  const addLocalCustomer = (newCustomer: any) => {
    queryClient.setQueryData(
      ["customers", tenantId, search, sortBy, sortOrder, limit, offset],
      (oldData: any | undefined) => {
        if (!oldData) return { data: [newCustomer], meta: { total: 1 } };
        return {
          ...oldData,
          data: [newCustomer, ...oldData.data],
          meta: { ...oldData.meta, total: oldData.meta.total + 1 },
        };
      }
    );
  };

  // Function to manually remove a customer from the local cache
  const removeLocalCustomer = (customerId: string) => {
    queryClient.setQueryData(
      ["customers", tenantId, search, sortBy, sortOrder, limit, offset],
      (oldData: any | undefined) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          data: oldData.data.filter(
            (customer: any) => customer.id !== customerId
          ),
          meta: { ...oldData.meta, total: oldData.meta.total - 1 },
        };
      }
    );
  };

  const refreshData = async () => {
    // Invalidate React Query cache
    await queryClient.invalidateQueries({
      queryKey: ["customers", tenantId],
    });

    // If online, process any queued actions
    if (!isOffline) {
      try {
        const queuedActions = await db.getQueuedActions();
        const customerActions = queuedActions.filter((action) =>
          action.name.includes("customer")
        );

        if (customerActions.length > 0) {
          console.log(
            `Processing ${customerActions.length} queued customer actions`
          );
          // In a real app, you would process these actions here
          // This would involve calling your API endpoints with the queued data
        }
      } catch (error) {
        console.error("Error processing queued actions:", error);
      }
    }
  };

  const value = {
    customers: customersQuery.data?.data || [],
    totalCustomers: customersQuery.data?.meta?.total || 0,
    loading: customersQuery.isLoading,
    error: customersQuery.error?.message || null,
    refreshData,
    selectedCustomer,
    setSelectedCustomer,
    search,
    setSearch,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    limit,
    setLimit,
    offset,
    setOffset,
    updateLocalCustomer,
    addLocalCustomer,
    removeLocalCustomer,
    isOffline,
  };

  return (
    <CustomerContext.Provider value={value}>
      {children}
    </CustomerContext.Provider>
  );
}

export function useCustomer() {
  const context = useContext(CustomerContext);
  if (context === undefined) {
    throw new Error("useCustomer must be used within a CustomerProvider");
  }
  return context;
}
