/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { createContext, useContext, useState } from "react";
import { useDashboard } from "./dashboard-provider";
import { getCustomers } from "@/lib/actions/customer.actions";
import { useQuery, useQueryClient } from "@tanstack/react-query";

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

  // Use TanStack Query for customers
  const customersQuery = useQuery({
    queryKey: ["customers", tenantId, search, sortBy, sortOrder, limit, offset],
    queryFn: async () => {
      if (!tenantId) return { data: [], meta: { total: 0 } };
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
      return result;
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
    await queryClient.invalidateQueries({
      queryKey: ["customers", tenantId],
    });
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
