/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "@/lib/actions/customer.actions";
import { toast } from "sonner";
import { useCustomer } from "@/context/customer-provider";
import db from "@/lib/services/db.service";

export function useCustomerMutation(tenantId: string) {
  const queryClient = useQueryClient();
  const {
    updateLocalCustomer,
    addLocalCustomer,
    removeLocalCustomer,
    isOffline,
  } = useCustomer();

  const createMutation = useMutation({
    mutationFn: async (customerData: any) => {
      // If offline, save to IndexedDB and return a temporary success response
      if (isOffline) {
        const tempId = `temp-${Date.now()}`;
        const tempCustomer = {
          ...customerData,
          id: tempId,
          customerSince: new Date(),
          tenantId,
        };

        await db.saveCustomerProfile(tempCustomer);

        // Queue for later sync
        await db.saveQueuedAction({
          id: crypto.randomUUID(),
          name: "create_customer",
          params: {
            data: customerData,
            tenantId,
          },
          timestamp: new Date(),
          retries: 0,
        });

        return { success: true, data: tempCustomer };
      }

      // If online, use the regular API
      return createCustomer(customerData, tenantId);
    },
    onMutate: async (newCustomer) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["customers", tenantId],
      });

      // Snapshot the previous value
      const previousCustomers = queryClient.getQueryData([
        "customers",
        tenantId,
      ]);

      // Create a temporary customer with a temporary ID
      const tempCustomer = {
        ...newCustomer,
        id: `temp-${Date.now()}`,
        customerSince: new Date(),
      };

      // Add to local state for immediate UI update
      addLocalCustomer(tempCustomer);

      // Return a context object with the snapshot
      return { previousCustomers, tempCustomer };
    },
    onError: (err, newCustomer, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(
        ["customers", tenantId],
        context?.previousCustomers
      );

      toast.error("Error", {
        description: "Failed to create customer. Please try again.",
      });
    },
    onSuccess: (result, variables, context) => {
      if (result.success) {
        // Replace the temp customer with the real one from the server
        if (result.data && context?.tempCustomer) {
          queryClient.setQueryData(
            ["customers", tenantId],
            (old: any | undefined) => {
              if (!old) return old;
              return {
                ...old,
                data: old.data.map((customer: any) =>
                  customer.id === context.tempCustomer.id
                    ? { ...result.data }
                    : customer
                ),
              };
            }
          );

          // Also update in IndexedDB if we got a server response
          if (!isOffline) {
            db.saveCustomerProfile({
              ...result.data,
              tenantId,
            }).catch((err) =>
              console.error("Error saving customer to IndexedDB:", err)
            );
          }
        }

        toast.success("Customer created", {
          description: isOffline
            ? "The customer has been saved locally and will sync when you're back online."
            : "The customer has been successfully created.",
        });
      } else {
        toast.error("Error", {
          description: result.data.error || "Failed to create customer.",
        });
      }
    },
    onSettled: () => {
      // Always refetch after error or success to make sure our local data is correct
      queryClient.invalidateQueries({
        queryKey: ["customers", tenantId],
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (customerData: any) => {
      // If offline, update in IndexedDB and return a temporary success response
      if (isOffline) {
        await db.saveCustomerProfile({
          ...customerData,
          tenantId,
        });

        // Queue for later sync
        await db.saveQueuedAction({
          id: crypto.randomUUID(),
          name: "update_customer",
          params: {
            data: customerData,
            tenantId,
          },
          timestamp: new Date(),
          retries: 0,
        });

        return { success: true, data: customerData };
      }

      // If online, use the regular API
      return updateCustomer(customerData, tenantId);
    },
    onMutate: async (updatedCustomer) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["customers", tenantId],
      });

      // Snapshot the previous value
      const previousCustomers = queryClient.getQueryData([
        "customers",
        tenantId,
      ]);

      // Update local state for immediate UI update
      updateLocalCustomer(updatedCustomer);

      // Return a context with the snapshot
      return { previousCustomers };
    },
    onError: (err, updatedCustomer, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(
        ["customers", tenantId],
        context?.previousCustomers
      );

      toast.error("Error", {
        description: "Failed to update customer. Please try again.",
      });
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Customer updated", {
          description: isOffline
            ? "The customer has been updated locally and will sync when you're back online."
            : "The customer has been successfully updated.",
        });

        // Also update in IndexedDB if we got a server response
        if (!isOffline && result.data) {
          db.saveCustomerProfile({
            ...result.data,
            tenantId,
          }).catch((err) =>
            console.error("Error updating customer in IndexedDB:", err)
          );
        }
      } else {
        toast.error("Error", {
          description: result.data.error || "Failed to update customer.",
        });
      }
    },
    onSettled: () => {
      // Always refetch after error or success to make sure our local data is correct
      queryClient.invalidateQueries({
        queryKey: ["customers", tenantId],
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (customerId: string) => {
      // If offline, queue the delete and return a temporary success response
      if (isOffline) {
        // Get the customer first to preserve it in the delete queue
        const customer = await db.getCustomerProfile(customerId);

        if (customer) {
          // Mark as deleted in IndexedDB
          await db.saveCustomerProfile({
            ...customer,
            deletedAt: new Date(),
            tenantId,
          });

          // Queue for later sync
          await db.saveQueuedAction({
            id: crypto.randomUUID(),
            name: "delete_customer",
            params: {
              customerId,
              tenantId,
            },
            timestamp: new Date(),
            retries: 0,
          });
        }

        return { success: true };
      }

      // If online, use the regular API
      return deleteCustomer(customerId, tenantId);
    },
    onMutate: async (customerId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["customers", tenantId],
      });

      // Snapshot the previous value
      const previousCustomers = queryClient.getQueryData([
        "customers",
        tenantId,
      ]);

      // Remove from local state for immediate UI update
      removeLocalCustomer(customerId);

      // Return a context with the snapshot
      return { previousCustomers };
    },
    onError: (err, customerId, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(
        ["customers", tenantId],
        context?.previousCustomers
      );

      toast.error("Error", {
        description: "Failed to delete customer. Please try again.",
      });
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Customer deleted", {
          description: isOffline
            ? "The customer has been marked for deletion and will be removed when you're back online."
            : "The customer has been successfully deleted.",
        });
      } else {
        toast.error("Error", {
          description: result.success || "Failed to delete customer.",
        });
      }
    },
    onSettled: () => {
      // Always refetch after error or success to make sure our local data is correct
      queryClient.invalidateQueries({
        queryKey: ["customers", tenantId],
      });
    },
  });

  return {
    createCustomer: createMutation.mutate,
    updateCustomer: updateMutation.mutate,
    deleteCustomer: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isPending:
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending,
  };
}
