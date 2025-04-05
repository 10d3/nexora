/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { createContext, useContext, useState } from "react";
import { useDashboard } from "./dashboard-provider";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getInventory,
  getCategories,
  getSuppliers,
} from "@/lib/actions/inventory-actions";

// Types for inventory management
export type InventoryItem = {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  minQuantity: number;
  price: number;
  cost: number;
  supplier: string;
  location: string;
  lastUpdated: Date;
  status: "in-stock" | "low-stock" | "out-of-stock" | "discontinued";
  image?: string;
};

type InventoryContextType = {
  inventory: InventoryItem[];
  categories: any[];
  suppliers: any[];
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  selectedItem: InventoryItem | null;
  setSelectedItem: (item: InventoryItem | null) => void;
  view: "all" | "low" | "category";
  setView: (view: "all" | "low" | "category") => void;
  searchQuery: string;
  setSearchQuery: (search: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
  selectedSupplier: string;
  setSelectedSupplier: (supplier: string) => void;
  statusOptions: string[];
  sortConfig: { key: keyof InventoryItem; direction: "asc" | "desc" } | null;
  setSortConfig: (
    config: { key: keyof InventoryItem; direction: "asc" | "desc" } | null
  ) => void;
  updateLocalInventory: (updatedItem: InventoryItem) => void;
  addLocalInventory: (newItem: InventoryItem) => void;
  deleteLocalInventory: (itemId: string) => void;
};

const InventoryContext = createContext<InventoryContextType | undefined>(
  undefined
);

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const { tenantId, businessType } = useDashboard();
  const queryClient = useQueryClient();
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [view, setView] = useState<"all" | "low" | "category">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedSupplier, setSelectedSupplier] = useState("all");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof InventoryItem;
    direction: "asc" | "desc";
  } | null>(null);

  // Status options for inventory items
  const statusOptions = [
    "in-stock",
    "low-stock",
    "out-of-stock",
    "discontinued",
  ];

  // Use TanStack Query for categories
  const categoriesQuery = useQuery({
    queryKey: ["categories", businessType, tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const result = await getCategories(businessType, tenantId);
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch categories");
      }
      return result.data || [];
    },
    enabled: !!tenantId,
  });

  // Use TanStack Query for suppliers
  const suppliersQuery = useQuery({
    queryKey: ["suppliers", businessType, tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const result = await getSuppliers(businessType, tenantId);
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch suppliers");
      }
      return result.data || [];
    },
    enabled: !!tenantId,
  });

  // Use TanStack Query for inventory
  const inventoryQuery = useQuery({
    queryKey: [
      "inventory",
      businessType,
      tenantId,
      selectedCategory,
      selectedStatus,
      selectedSupplier,
      searchQuery,
    ],
    queryFn: async () => {
      if (!tenantId) return [];
      const result = await getInventory(
        businessType,
        tenantId,
        selectedCategory !== "all" ? selectedCategory : undefined,
        selectedStatus !== "all" ? selectedStatus : undefined,
        selectedSupplier !== "all" ? selectedSupplier : undefined,
        searchQuery || undefined
      );
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch inventory");
      }
      return result.data || [];
    },
    enabled: !!tenantId,
  });

  // Function to manually update an inventory item in the local cache
  const updateLocalInventory = (updatedItem: InventoryItem) => {
    queryClient.setQueryData(
      [
        "inventory",
        businessType,
        tenantId,
        selectedCategory,
        selectedStatus,
        selectedSupplier,
        searchQuery,
      ],
      (oldData: any[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map((item) =>
          item.id === updatedItem.id ? updatedItem : item
        );
      }
    );
  };

  // Function to manually add an inventory item to the local cache
  const addLocalInventory = (newItem: InventoryItem) => {
    queryClient.setQueryData(
      [
        "inventory",
        businessType,
        tenantId,
        selectedCategory,
        selectedStatus,
        selectedSupplier,
        searchQuery,
      ],
      (oldData: any[] | undefined) => {
        if (!oldData) return [newItem];
        return [...oldData, newItem];
      }
    );
  };

  // Function to manually delete an inventory item from the local cache
  const deleteLocalInventory = (itemId: string) => {
    queryClient.setQueryData(
      [
        "inventory",
        businessType,
        tenantId,
        selectedCategory,
        selectedStatus,
        selectedSupplier,
        searchQuery,
      ],
      (oldData: any[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.filter((item) => item.id !== itemId);
      }
    );
  };

  const refreshData = async () => {
    await queryClient.invalidateQueries({
      queryKey: ["inventory", businessType, tenantId],
    });
    await queryClient.invalidateQueries({
      queryKey: ["categories", businessType, tenantId],
    });
    await queryClient.invalidateQueries({
      queryKey: ["suppliers", businessType, tenantId],
    });
  };

  const value = {
    inventory: inventoryQuery.data || [],
    categories: categoriesQuery.data || [],
    suppliers: suppliersQuery.data || [],
    loading:
      inventoryQuery.isLoading ||
      categoriesQuery.isLoading ||
      suppliersQuery.isLoading,
    error:
      inventoryQuery.error?.message ||
      categoriesQuery.error?.message ||
      suppliersQuery.error?.message ||
      null,
    refreshData,
    selectedItem,
    setSelectedItem,
    view,
    setView,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedStatus,
    setSelectedStatus,
    selectedSupplier,
    setSelectedSupplier,
    statusOptions,
    sortConfig,
    setSortConfig,
    updateLocalInventory,
    addLocalInventory,
    deleteLocalInventory,
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error("useInventory must be used within an InventoryProvider");
  }
  return context;
}
