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

export function useCustomerMutation(tenantId: string) {
  const queryClient = useQueryClient();
  const { updateLocalCustomer, addLocalCustomer, removeLocalCustomer } = useCustomer();

  const createMutation = useMutation({
    mutationFn: async (customerData: any) => {
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
                    ? result.data
                    : customer
                ),
              };
            }
          );
        }

        toast.success("Customer created", {
          description: "The customer has been successfully created.",
        });
      } else {
        toast.error("Error", {
          description: result.error || "Failed to create customer.",
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
          description: "The customer has been successfully updated.",
        });
      } else {
        toast.error("Error", {
          description: result.error || "Failed to update customer.",
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
          description: "The customer has been successfully deleted.",
        });
      } else {
        toast.error("Error", {
          description: result.error || "Failed to delete customer.",
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
    isPending: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
  };
}