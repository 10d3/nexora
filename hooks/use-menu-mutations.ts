/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleMenuItemAvailability,
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
      const currentMenuItems = queryClient.getQueryData<any[]>([
        "menuItems",
        tenantId,
      ]) || [];

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
      const currentMenuItems = queryClient.getQueryData<any[]>([
        "menuItems",
        tenantId,
      ]) || [];

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
      const currentMenuItems = queryClient.getQueryData<any[]>([
        "menuItems",
        tenantId,
      ]) || [];

      // Toggle availability for the item
      const updatedMenuItems = currentMenuItems.map((item) => {
        if (item.id === itemId) {
          return { ...item, isAvailable: !item.isAvailable, updatedAt: new Date() };
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

  return {
    createMenuItem: createMutation.mutate,
    updateMenuItem: updateMutation.mutate,
    deleteMenuItem: deleteMutation.mutate,
    toggleMenuItemAvailability: toggleAvailabilityMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isTogglingAvailability: toggleAvailabilityMutation.isPending,
  };
}