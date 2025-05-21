/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import { getMenuItems, getMenuCategories } from "@/lib/actions/menu.actions";

type MenuState = {
  menuItems: any[];
  categories: any[];
  isLoading: boolean;
  error: Error | null;
  currentCategoryFilter: string | null;
  currentAvailabilityFilter: boolean | null;
  currentSearchTerm: string;

  // Actions
  fetchMenuItems: (tenantId: string) => Promise<void>;
  fetchCategories: (tenantId: string) => Promise<void>;
  filterByCategory: (categoryId: string | null) => void;
  filterByAvailability: (isAvailable: boolean | null) => void;
  searchMenuItems: (searchTerm: string) => void;
};

export const useMenuStore = create<MenuState>((set, get) => ({
  menuItems: [],
  categories: [],
  isLoading: false,
  error: null,
  currentCategoryFilter: null,
  currentAvailabilityFilter: null,
  currentSearchTerm: "",

  fetchMenuItems: async (tenantId: string) => {
    if (!tenantId) return;

    set({ isLoading: true });
    try {
      const {
        currentCategoryFilter,
        currentAvailabilityFilter,
        currentSearchTerm,
      } = get();

      const response = await getMenuItems(
        tenantId,
        currentCategoryFilter || undefined,
        currentAvailabilityFilter !== null
          ? currentAvailabilityFilter
          : undefined,
        currentSearchTerm || undefined
      );

      if (response.success) {
        set({ menuItems: response.data, isLoading: false, error: null });
      } else {
        set({
          isLoading: false,
          error: new Error("Failed to fetch menu items"),
        });
      }
    } catch (error) {
      set({ isLoading: false, error: error as Error });
    }
  },

  fetchCategories: async (tenantId: string) => {
    if (!tenantId) return;

    set({ isLoading: true });
    try {
      const response = await getMenuCategories(tenantId);

      if (response.success) {
        set({ categories: response.data, isLoading: false, error: null });
      } else {
        set({
          isLoading: false,
          error: new Error("Failed to fetch categories"),
        });
      }
    } catch (error) {
      set({ isLoading: false, error: error as Error });
    }
  },

  filterByCategory: (categoryId: string | null) => {
    set({ currentCategoryFilter: categoryId });
    const { fetchMenuItems } = get();
    const tenantId = localStorage.getItem("currentTenantId");
    if (tenantId) {
      fetchMenuItems(tenantId);
    }
  },

  filterByAvailability: (isAvailable: boolean | null) => {
    set({ currentAvailabilityFilter: isAvailable });
    const { fetchMenuItems } = get();
    const tenantId = localStorage.getItem("currentTenantId");
    if (tenantId) {
      fetchMenuItems(tenantId);
    }
  },

  searchMenuItems: (searchTerm: string) => {
    set({ currentSearchTerm: searchTerm });
    const { fetchMenuItems } = get();
    const tenantId = localStorage.getItem("currentTenantId");
    if (tenantId) {
      fetchMenuItems(tenantId);
    }
  },
}));
