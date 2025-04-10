/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleMenuItemAvailability,
  createCategory,
} from "@/lib/actions/menu.actions";
import { toast } from "sonner";

export function useMenuMutations(tenantId: string) {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (itemData: any) => {
      return createMenuItem(tenantId, itemData);
    },
    onMutate: async (newItem) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["menuItems", tenantId],
      });

      // Snapshot the previous value
      const previousMenuItems = queryClient.getQueryData([
        "menuItems",
        tenantId,
      ]);

      // Create a temporary item with a temporary ID
      const tempItem = {
        ...newItem,
        id: `temp-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Optimistically update the cache
      queryClient.setQueryData(["menuItems", tenantId], (old: any) => {
        if (!old) return [tempItem];
        return [...old, tempItem];
      });

      // Return a context object with the snapshot
      return { previousMenuItems };
    },
    onError: (err, newItem, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousMenuItems) {
        queryClient.setQueryData(
          ["menuItems", tenantId],
          context.previousMenuItems
        );
      }
      toast.error("Failed to create menu item", {
        description: "Please try again later.",
      });
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Menu item created", {
          description: `${result.data.name} has been added to the menu.`,
        });
        // Invalidate and refetch
        queryClient.invalidateQueries({
          queryKey: ["menuItems", tenantId],
        });
      } else {
        toast.error("Failed to create menu item", {
          description: result.error || "Please try again later.",
        });
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ itemId, data }: { itemId: string; data: any }) => {
      return updateMenuItem(tenantId, itemId, data);
    },
    onMutate: async ({ itemId, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["menuItems", tenantId],
      });

      // Snapshot the previous value
      const previousMenuItems = queryClient.getQueryData([
        "menuItems",
        tenantId,
      ]);

      // Get current menu items
      const currentMenuItems =
        queryClient.getQueryData<any[]>(["menuItems", tenantId]) || [];

      // Create updated menu items array
      const updatedMenuItems = currentMenuItems.map((item) => {
        if (item.id === itemId) {
          return { ...item, ...data, updatedAt: new Date() };
        }
        return item;
      });

      // Optimistically update the cache
      queryClient.setQueryData(["menuItems", tenantId], updatedMenuItems);

      // Return a context with the previous value
      return { previousMenuItems };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context to roll back
      if (context?.previousMenuItems) {
        queryClient.setQueryData(
          ["menuItems", tenantId],
          context.previousMenuItems
        );
      }
      toast.error("Failed to update menu item", {
        description: "Please try again later.",
      });
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Menu item updated", {
          description: `${result.data.name} has been updated.`,
        });
        // Invalidate and refetch
        queryClient.invalidateQueries({
          queryKey: ["menuItems", tenantId],
        });
      } else {
        toast.error("Failed to update menu item", {
          description: result.error || "Please try again later.",
        });
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (itemId: string) => {
      return deleteMenuItem(tenantId, itemId);
    },
    onMutate: async (itemId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["menuItems", tenantId],
      });

      // Snapshot the previous value
      const previousMenuItems = queryClient.getQueryData([
        "menuItems",
        tenantId,
      ]);

      // Get current menu items
      const currentMenuItems =
        queryClient.getQueryData<any[]>(["menuItems", tenantId]) || [];

      // Filter out the deleted item
      const updatedMenuItems = currentMenuItems.filter(
        (item) => item.id !== itemId
      );

      // Optimistically update the cache
      queryClient.setQueryData(["menuItems", tenantId], updatedMenuItems);

      // Return a context with the previous value
      return { previousMenuItems };
    },
    onError: (err, itemId, context) => {
      // If the mutation fails, use the context to roll back
      if (context?.previousMenuItems) {
        queryClient.setQueryData(
          ["menuItems", tenantId],
          context.previousMenuItems
        );
      }
      toast.error("Failed to delete menu item", {
        description: "Please try again later.",
      });
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Menu item deleted", {
          description: "The item has been removed from the menu.",
        });
        // Invalidate and refetch
        queryClient.invalidateQueries({
          queryKey: ["menuItems", tenantId],
        });
      } else {
        toast.error("Failed to delete menu item", {
          description: result.error || "Please try again later.",
        });
      }
    },
  });

  const toggleAvailabilityMutation = useMutation({
    mutationFn: async (itemId: string) => {
      return toggleMenuItemAvailability(tenantId, itemId);
    },
    onMutate: async (itemId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["menuItems", tenantId],
      });

      // Snapshot the previous value
      const previousMenuItems = queryClient.getQueryData([
        "menuItems",
        tenantId,
      ]);

      // Get current menu items
      const currentMenuItems =
        queryClient.getQueryData<any[]>(["menuItems", tenantId]) || [];

      // Toggle availability for the item
      const updatedMenuItems = currentMenuItems.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            isAvailable: !item.isAvailable,
            updatedAt: new Date(),
          };
        }
        return item;
      });

      // Optimistically update the cache
      queryClient.setQueryData(["menuItems", tenantId], updatedMenuItems);

      // Return a context with the previous value
      return { previousMenuItems };
    },
    onError: (err, itemId, context) => {
      // If the mutation fails, use the context to roll back
      if (context?.previousMenuItems) {
        queryClient.setQueryData(
          ["menuItems", tenantId],
          context.previousMenuItems
        );
      }
      toast.error("Failed to update menu item availability", {
        description: "Please try again later.",
      });
    },
    onSuccess: (result) => {
      if (result.success) {
        const status = result.data.isAvailable ? "available" : "unavailable";
        toast.success(`Menu item is now ${status}`, {
          description: `${result.data.name} has been updated.`,
        });
        // Invalidate and refetch
        queryClient.invalidateQueries({
          queryKey: ["menuItems", tenantId],
        });
      } else {
        toast.error("Failed to update menu item availability", {
          description: result.error || "Please try again later.",
        });
      }
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (categoryData: {
      name: string;
      description?: string;
    }) => {
      return createCategory(tenantId, categoryData);
    },
    onMutate: async (newCategory) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["menuCategories", tenantId],
      });

      // Snapshot the previous value
      const previousCategories = queryClient.getQueryData([
        "menuCategories",
        tenantId,
      ]);

      // Create a temporary category with a temporary ID
      const tempCategory = {
        ...newCategory,
        id: `temp-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Optimistically update the cache
      queryClient.setQueryData(["menuCategories", tenantId], (old: any) => {
        if (!old) return [tempCategory];
        return [...old, tempCategory];
      });

      // Return a context object with the snapshot
      return { previousCategories };
    },
    onError: (err, newCategory, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousCategories) {
        queryClient.setQueryData(
          ["menuCategories", tenantId],
          context.previousCategories
        );
      }
      toast.error("Failed to create category", {
        description: "Please try again later.",
      });
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Category created", {
          description: `${result.data.name} has been added to categories.`,
        });
        // Invalidate and refetch
        queryClient.invalidateQueries({
          queryKey: ["menuCategories", tenantId],
        });
      } else {
        toast.error("Failed to create category", {
          description: result.error || "Please try again later.",
        });
      }
    },
  });

  // Wrap the createCategory mutation to return a Promise with the result
  const createCategoryWithPromise = async (categoryData: {
    name: string;
    description?: string;
  }) => {
    return new Promise<{ success: boolean; data?: any; error?: string }>(
      (resolve) => {
        createCategoryMutation.mutate(categoryData, {
          onSuccess: (result) => {
            resolve(result);
          },
          onError: (error: any) => {
            resolve({
              success: false,
              error: error.message || "Failed to create category",
            });
          },
        });
      }
    );
  };

  return {
    createMenuItem: createMutation.mutate,
    updateMenuItem: updateMutation.mutate,
    deleteMenuItem: deleteMutation.mutate,
    toggleMenuItemAvailability: toggleAvailabilityMutation.mutate,
    createCategory: createCategoryWithPromise,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isTogglingAvailability: toggleAvailabilityMutation.isPending,
    isCreatingCategory: createCategoryMutation.isPending,
  };
}
