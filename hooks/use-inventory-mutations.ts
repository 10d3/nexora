/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
} from "@/lib/actions/inventory-actions";
import { toast } from "sonner";
import { useInventory } from "@/context/inventory-provider";

export function useInventoryMutation(tenantId: string) {
  const queryClient = useQueryClient();
  const { updateLocalInventory, addLocalInventory, deleteLocalInventory } = useInventory();

  const createMutation = useMutation({
    mutationFn: async (itemData: any) => {
      return createInventoryItem(tenantId, itemData);
    },
    onMutate: async (newItem) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["inventory", tenantId],
      });

      // Snapshot the previous value
      const previousInventory = queryClient.getQueryData([
        "inventory",
        tenantId,
      ]);

      // Create a temporary item with a temporary ID
      const tempItem = {
        ...newItem,
        id: `temp-${Date.now()}`,
        status: newItem.quantity === 0
          ? "out-of-stock"
          : newItem.quantity < (newItem.minQuantity || 5)
            ? "low-stock"
            : "in-stock",
        lastUpdated: new Date(),
      };

      // Add to local state for immediate UI update
      addLocalInventory(tempItem);

      // Return a context object with the snapshot
      return { previousInventory };
    },
    onError: (err, newItem, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousInventory) {
        queryClient.setQueryData(
          ["inventory", tenantId],
          context.previousInventory
        );
      }
      toast.error("Failed to create inventory item", {
        description: "Please try again later.",
      });
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Item added successfully", {
          description: `The item has been added to inventory.`,
        });
        // Invalidate and refetch
        queryClient.invalidateQueries({
          queryKey: ["inventory", tenantId],
        });
      } else {
        toast.error("Failed to create inventory item", {
          description: result.error || "Please try again later.",
        });
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ itemId, data }: { itemId: string; data: any }) => {
      return updateInventoryItem(tenantId, itemId, data);
    },
    onMutate: async ({ itemId, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["inventory", tenantId],
      });

      // Snapshot the previous value
      const previousInventory = queryClient.getQueryData([
        "inventory",
        tenantId,
      ]);

      // Get current inventory
      const currentInventory = queryClient.getQueryData<any[]>([
        "inventory",
        tenantId,
      ]) || [];

      // Find the item to update
      const itemToUpdate = currentInventory.find((item) => item.id === itemId);

      if (itemToUpdate) {
        // Create updated item
        const updatedItem = {
          ...itemToUpdate,
          ...data,
          status: data.quantity === 0
            ? "out-of-stock"
            : data.quantity < (data.minQuantity || itemToUpdate.minQuantity)
              ? "low-stock"
              : "in-stock",
          lastUpdated: new Date(),
        };

        // Update local state for immediate UI update
        updateLocalInventory(updatedItem);
      }

      // Return a context object with the snapshot
      return { previousInventory };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousInventory) {
        queryClient.setQueryData(
          ["inventory", tenantId],
          context.previousInventory
        );
      }
      toast.error("Failed to update inventory item", {
        description: "Please try again later.",
      });
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Item updated successfully", {
          description: `The item has been updated.`,
        });
        // Invalidate and refetch
        queryClient.invalidateQueries({
          queryKey: ["inventory", tenantId],
        });
      } else {
        toast.error("Failed to update inventory item", {
          description: result.error || "Please try again later.",
        });
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (itemId: string) => {
      return deleteInventoryItem(tenantId, itemId);
    },
    onMutate: async (itemId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["inventory", tenantId],
      });

      // Snapshot the previous value
      const previousInventory = queryClient.getQueryData([
        "inventory",
        tenantId,
      ]);

      // Delete from local state for immediate UI update
      deleteLocalInventory(itemId);

      // Return a context object with the snapshot
      return { previousInventory };
    },
    onError: (err, itemId, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousInventory) {
        queryClient.setQueryData(
          ["inventory",
          tenantId],
          context.previousInventory
        );
      }
      toast.error("Failed to delete inventory item", {
        description: "Please try again later.",
      });
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Item deleted successfully", {
          description: `The item has been removed from inventory.`,
        });
        // Invalidate and refetch
        queryClient.invalidateQueries({
          queryKey: ["inventory", tenantId],
        });
      } else {
        toast.error("Failed to delete inventory item", {
          description: result.error || "Please try again later.",
        });
      }
    },
  });

  return {
    createInventoryItem: createMutation.mutate,
    updateInventoryItem: updateMutation.mutate,
    deleteInventoryItem: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}