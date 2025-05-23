/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createOrder,
  updateOrderStatus,
  updatePaymentType,
  deleteOrder,
} from "@/lib/actions/order-actions";
import { OrderStatus, PaymentType } from "@prisma/client";
import { useDashboard } from "@/context/dashboard-provider";
// import { z } from "zod";

export function useOrderMutation() {
  const { tenantId } = useDashboard();
  const [isPending, setIsPending] = useState(false);
  const queryClient = useQueryClient();

  // Create order with optimistic update
  const createNewOrder = async (orderData: any) => {
    setIsPending(true);

    try {
      // Create a temporary ID for optimistic update
      const tempId = `temp-${Date.now()}`;
      const optimisticOrder = {
        ...orderData,
        id: tempId,
        createdAt: new Date(),
        // Move business-specific fields to items
        items: orderData.items.map((item: any) => ({
          ...item,
          id: `temp-item-${Date.now()}-${Math.random()}`,
        })),
      };

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["orders", tenantId],
      });

      // Snapshot the previous value
      const previousOrders = queryClient.getQueryData(["orders", tenantId]);

      // Optimistically add the new order
      queryClient.setQueryData(["orders", tenantId], (old: any) => {
        if (!old) return { orders: [optimisticOrder], totalOrders: 1 };
        return {
          orders: [optimisticOrder, ...old.orders],
          totalOrders: old.totalOrders + 1,
        };
      });

      // Create the order on the server
      const result = await createOrder(orderData, tenantId as string);

      if (result.order) {
        // Update with the actual data from the server
        queryClient.setQueryData(["orders", tenantId], (old: any) => {
          if (!old) return old;
          return {
            orders: old.orders.map((order: any) =>
              order.id === tempId ? result.order : order
            ),
            totalOrders: old.totalOrders,
          };
        });

        toast.success("Success", {
          description: "Order created successfully",
        });

        return { success: true, data: result.order };
      } else {
        // Restore the previous data if there was an error
        queryClient.setQueryData(["orders", tenantId], previousOrders);

        toast.error("Error", {
          description: result.error || "Failed to create order",
        });

        return { success: false, error: result.error };
      }
    } catch (error) {
      toast.error("Error", {
        description: "An unexpected error occurred",
      });
      return { success: false, error: "An unexpected error occurred" };
    } finally {
      // Always refetch to ensure consistency
      queryClient.invalidateQueries({
        queryKey: ["orders", tenantId],
      });
      setIsPending(false);
    }
  };

  // Update order status with optimistic update
  const updateStatus = async (orderId: string, status: OrderStatus) => {
    setIsPending(true);

    try {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["orders", tenantId],
      });

      // Snapshot the previous value
      const previousOrders = queryClient.getQueryData(["orders", tenantId]);

      // Optimistically update the order status
      queryClient.setQueryData(["orders", tenantId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          orders: old.orders.map((order: any) =>
            order.id === orderId ? { ...order, status } : order
          ),
        };
      });

      // Also update the single order if it's in the cache
      const previousOrder = queryClient.getQueryData([
        "order",
        orderId,
        tenantId,
      ]);

      if (previousOrder) {
        queryClient.setQueryData(["order", orderId, tenantId], (old: any) => {
          if (!old) return old;
          return {
            ...old,
            order: { ...old.order, status },
          };
        });
      }

      // Update the order status on the server
      const result = await updateOrderStatus(
        orderId,
        status,
        tenantId as string
      );

      if (result.order) {
        toast.success("Success", {
          description: "Order status updated successfully",
        });
        return { success: true, data: result.order };
      } else {
        // Restore the previous data if there was an error
        queryClient.setQueryData(["orders", tenantId], previousOrders);

        if (previousOrder) {
          queryClient.setQueryData(["order", orderId, tenantId], previousOrder);
        }

        toast.error("Error", {
          description: result.error || "Failed to update order status",
        });

        return { success: false, error: result.error };
      }
    } catch (error) {
      toast.error("Error", {
        description: "An unexpected error occurred",
      });
      return { success: false, error: "An unexpected error occurred" };
    } finally {
      // Always refetch to ensure consistency
      queryClient.invalidateQueries({
        queryKey: ["orders", tenantId],
      });
      queryClient.invalidateQueries({
        queryKey: ["order"],
      });
      setIsPending(false);
    }
  };

  // Update payment type with optimistic update
  const updatePayment = async (orderId: string, paymentType: PaymentType) => {
    setIsPending(true);

    try {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["orders", tenantId],
      });

      // Snapshot the previous value
      const previousOrders = queryClient.getQueryData(["orders", tenantId]);

      // Optimistically update the payment type
      queryClient.setQueryData(["orders", tenantId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          orders: old.orders.map((order: any) =>
            order.id === orderId ? { ...order, paymentType } : order
          ),
        };
      });

      // Also update the single order if it's in the cache
      const previousOrder = queryClient.getQueryData([
        "order",
        orderId,
        tenantId,
      ]);

      if (previousOrder) {
        queryClient.setQueryData(["order", orderId, tenantId], (old: any) => {
          if (!old) return old;
          return {
            ...old,
            order: { ...old.order, paymentType },
          };
        });
      }

      // Update the payment type on the server
      const result = await updatePaymentType(
        orderId,
        paymentType,
        tenantId as string
      );

      if (result.order) {
        toast.success("Success", {
          description: "Payment type updated successfully",
        });
        return { success: true, data: result.order };
      } else {
        // Restore the previous data if there was an error
        queryClient.setQueryData(["orders", tenantId], previousOrders);

        if (previousOrder) {
          queryClient.setQueryData(["order", orderId, tenantId], previousOrder);
        }

        toast.error("Error", {
          description: result.error || "Failed to update payment type",
        });

        return { success: false, error: result.error };
      }
    } catch (error) {
      toast.error("Error", {
        description: "An unexpected error occurred",
      });
      return { success: false, error: "An unexpected error occurred" };
    } finally {
      // Always refetch to ensure consistency
      queryClient.invalidateQueries({
        queryKey: ["orders", tenantId],
      });
      queryClient.invalidateQueries({
        queryKey: ["order"],
      });
      setIsPending(false);
    }
  };

  // Delete order with optimistic update
  const removeOrder = async (orderId: string) => {
    setIsPending(true);

    try {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["orders", tenantId],
      });

      // Snapshot the previous value
      const previousOrders = queryClient.getQueryData(["orders", tenantId]);

      // Optimistically remove the order
      queryClient.setQueryData(["orders", tenantId], (old: any) => {
        if (!old) return old;
        return {
          orders: old.orders.filter((order: any) => order.id !== orderId),
          totalOrders: old.totalOrders - 1,
        };
      });

      // Delete the order on the server
      const result = await deleteOrder(orderId, tenantId as string);

      if (result.success) {
        toast.success("Success", {
          description: "Order deleted successfully",
        });
        return { success: true };
      } else {
        // Restore the previous data if there was an error
        queryClient.setQueryData(["orders", tenantId], previousOrders);

        toast.error("Error", {
          description: result.error || "Failed to delete order",
        });

        return { success: false, error: result.error };
      }
    } catch (error) {
      toast.error("Error", {
        description: "An unexpected error occurred",
      });
      return { success: false, error: "An unexpected error occurred" };
    } finally {
      // Always refetch to ensure consistency
      queryClient.invalidateQueries({
        queryKey: ["orders", tenantId],
      });
      // Also invalidate the single order query
      queryClient.invalidateQueries({
        queryKey: ["order"],
      });
      setIsPending(false);
    }
  };

  return {
    createNewOrder,
    updateStatus,
    updatePayment,
    removeOrder,
    isPending,
  };
}
