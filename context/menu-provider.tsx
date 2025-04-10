/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMenuItems, getMenuCategories } from "@/lib/actions/menu.actions";
import { useDashboard } from "./dashboard-provider";

type MenuContextType = {
  menuItems: any[];
  categories: any[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  filterByCategory: (categoryId: string | null) => void;
  filterByAvailability: (isAvailable: boolean | null) => void;
  searchMenuItems: (searchTerm: string) => void;
  currentCategoryFilter: string | null;
  currentAvailabilityFilter: boolean | null;
  currentSearchTerm: string;
  refetchMenuItems: () => void;
};

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export function MenuProvider({
  children,
}: {
  children: React.ReactNode;
}) {
    const {tenantId} = useDashboard()
  const [currentCategoryFilter, setCurrentCategoryFilter] = useState<
    string | null
  >(null);
  const [currentAvailabilityFilter, setCurrentAvailabilityFilter] = useState<
    boolean | null
  >(null);
  const [currentSearchTerm, setCurrentSearchTerm] = useState<string>("");

  // Fetch menu items with filters
  const {
    data: menuItemsData,
    isLoading: isMenuItemsLoading,
    isError: isMenuItemsError,
    error: menuItemsError,
    refetch: refetchMenuItems,
  } = useQuery({
    queryKey: [
      "menuItems",
      tenantId,
      currentCategoryFilter,
      currentAvailabilityFilter,
      currentSearchTerm,
    ],
    queryFn: async () => {
      const response = await getMenuItems(
        tenantId as string,
        currentCategoryFilter || undefined,
        currentAvailabilityFilter !== null
          ? currentAvailabilityFilter
          : undefined,
        currentSearchTerm || undefined
      );
      return response.success ? response.data : [];
    },
    enabled: !!tenantId,
  });

  // Fetch menu categories
  const {
    data: categoriesData,
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
    error: categoriesError,
  } = useQuery({
    queryKey: ["menuCategories", tenantId],
    queryFn: async () => {
      const response = await getMenuCategories(tenantId as string);
      return response.success ? response.data : [];
    },
    enabled: !!tenantId,
  });

  // Filter functions
  const filterByCategory = useCallback((categoryId: string | null) => {
    setCurrentCategoryFilter(categoryId);
  }, []);

  const filterByAvailability = useCallback((isAvailable: boolean | null) => {
    setCurrentAvailabilityFilter(isAvailable);
  }, []);

  const searchMenuItems = useCallback((searchTerm: string) => {
    setCurrentSearchTerm(searchTerm);
  }, []);

  // Combine loading and error states
  const isLoading = isMenuItemsLoading || isCategoriesLoading;
  const isError = isMenuItemsError || isCategoriesError;
  const error = menuItemsError || categoriesError;

  const value = {
    menuItems: menuItemsData || [],
    categories: categoriesData || [],
    isLoading,
    isError,
    error,
    filterByCategory,
    filterByAvailability,
    searchMenuItems,
    currentCategoryFilter,
    currentAvailabilityFilter,
    currentSearchTerm,
    refetchMenuItems,
  };

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
}

export function useMenu() {
  const context = useContext(MenuContext);
  if (context === undefined) {
    throw new Error("useMenu must be used within a MenuProvider");
  }
  return context;
}
