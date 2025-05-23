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
import { OrderStatus, PaymentType, BusinessType } from "@prisma/client";
import { useDashboard } from "@/context/dashboard-provider";
import db from "@/lib/services/db.service";

export function useOrderMutation() {
  const { tenantId, businessType } = useDashboard();
  const [isPending, setIsPending] = useState(false);
  const queryClient = useQueryClient();

  // Create order with optimistic update and offline support
  const createNewOrder = async (orderData: any) => {
    setIsPending(true);

    try {
      // Create a temporary ID for optimistic update
      const tempId = `temp-${Date.now()}`;
      const optimisticOrder = {
        ...orderData,
        id: tempId,
        createdAt: new Date(),
        businessType,
        tenantId,
        orderItems: orderData.items.map((item: any) => ({
          id: `temp-item-${Date.now()}-${Math.random()}`,
          quantity: item.quantity,
          price: item.price,
          notes: item.notes || null,
          productId: item.productId || null,
          menuId: businessType === "RESTAURANT" ? item.menuId || null : null,
          roomId: businessType === "HOTEL" ? item.roomId || null : null,
          orderId: tempId,
          createdAt: new Date(),
          updatedAt: new Date(),
        })),
      };

      // Save to IndexedDB for offline support
      await db.saveOrder(optimisticOrder);
      for (const item of optimisticOrder.orderItems) {
        await db.saveOrderItem(item);
      }

      // Queue for later sync if offline
      if (!navigator.onLine) {
        await db.saveQueuedAction({
          id: crypto.randomUUID(),
          name: "create_order",
          params: {
            data: orderData,
            tenantId,
          },
          timestamp: new Date(),
          retries: 0,
        });

        // Update UI optimistically
        queryClient.setQueryData(["orders", tenantId], (old: any) => {
          if (!old) return { orders: [optimisticOrder], totalOrders: 1 };
          return {
            orders: [optimisticOrder, ...old.orders],
            totalOrders: old.totalOrders + 1,
          };
        });

        toast.success("Order created", {
          description: "The order has been saved locally and will sync when you're back online.",
        });

        return { success: true, data: optimisticOrder };
      }

      // If online, proceed with server update
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

        // Update IndexedDB with server data
        const indexedDBOrder = {
          id: result.order.id,
          orderNumber: result.order.orderNumber,
          status: result.order.status,
          total: result.order.total,
          tax: result.order.tax,
          discount: result.order.discount,
          paymentType: result.order.paymentType,
          orderType: result.order.orderType,
          reservationId: result.order.reservationId || undefined,
          bookingId: result.order.bookingId || undefined,
          appointmentId: result.order.appointmentId || undefined,
          userId: result.order.userId,
          tenantId: result.order.tenantId,
          customerProfileId: result.order.customerProfileId || undefined,
          createdAt: result.order.createdAt,
          updatedAt: result.order.updatedAt,
          completedAt: result.order.completedAt || undefined,
          completedBy: result.order.completedBy || undefined,
          completedReason: result.order.completedReason || undefined,
          deletedBy: result.order.deletedBy || undefined,
          deletedAt: result.order.deletedAt || undefined,
          orderItems: result.order.orderItems.map((item: any) => ({
            id: item.id,
            quantity: item.quantity,
            price: item.price,
            notes: item.notes || null,
            productId: item.productId || null,
            menuId: item.menuId || null,
            roomId: item.roomId || null,
            orderId: result.order.id,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
          })),
        };
        await db.saveOrder(indexedDBOrder);
        for (const item of indexedDBOrder.orderItems) {
          await db.saveOrderItem(item);
        }

        toast.success("Success", {
          description: "Order created successfully",
        });

        return { success: true, data: result.order };
      } else {
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
      queryClient.invalidateQueries({
        queryKey: ["orders", tenantId],
      });
      setIsPending(false);
    }
  };

  // Update order status with offline support
  const updateStatus = async (orderId: string, status: OrderStatus) => {
    setIsPending(true);

    try {
      // Get current order from IndexedDB
      const currentOrder = await db.getOrder(orderId);
      if (!currentOrder) {
        throw new Error("Order not found");
      }

      const updatedOrder = {
        ...currentOrder,
        status,
        ...(status === "COMPLETED" ? { completedAt: new Date() } : {}),
      };

      // Save to IndexedDB
      await db.saveOrder(updatedOrder);

      // Queue for later sync if offline
      if (!navigator.onLine) {
        await db.saveQueuedAction({
          id: crypto.randomUUID(),
          name: "update_order_status",
          params: {
            orderId,
            status,
            tenantId,
          },
          timestamp: new Date(),
          retries: 0,
        });

        // Update UI optimistically
        queryClient.setQueryData(["orders", tenantId], (old: any) => {
          if (!old) return old;
          return {
            ...old,
            orders: old.orders.map((order: any) =>
              order.id === orderId ? updatedOrder : order
            ),
          };
        });

        toast.success("Status updated", {
          description: "The status has been saved locally and will sync when you're back online.",
        });

        return { success: true, data: updatedOrder };
      }

      // If online, proceed with server update
      const result = await updateOrderStatus(orderId, status, tenantId as string);

      if (result.order) {
        toast.success("Success", {
          description: "Order status updated successfully",
        });
        return { success: true, data: result.order };
      } else {
        // Restore previous state in IndexedDB
        await db.saveOrder(currentOrder);

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
      queryClient.invalidateQueries({
        queryKey: ["orders", tenantId],
      });
      queryClient.invalidateQueries({
        queryKey: ["order"],
      });
      setIsPending(false);
    }
  };

  // Update payment type with offline support
  const updatePayment = async (orderId: string, paymentType: PaymentType) => {
    setIsPending(true);

    try {
      // Get current order from IndexedDB
      const currentOrder = await db.getOrder(orderId);
      if (!currentOrder) {
        throw new Error("Order not found");
      }

      const updatedOrder = {
        ...currentOrder,
        paymentType,
      };

      // Save to IndexedDB
      await db.saveOrder(updatedOrder);

      // Queue for later sync if offline
      if (!navigator.onLine) {
        await db.saveQueuedAction({
          id: crypto.randomUUID(),
          name: "update_payment_type",
          params: {
            orderId,
            paymentType,
            tenantId,
          },
          timestamp: new Date(),
          retries: 0,
        });

        // Update UI optimistically
        queryClient.setQueryData(["orders", tenantId], (old: any) => {
          if (!old) return old;
          return {
            ...old,
            orders: old.orders.map((order: any) =>
              order.id === orderId ? updatedOrder : order
            ),
          };
        });

        toast.success("Payment updated", {
          description: "The payment type has been saved locally and will sync when you're back online.",
        });

        return { success: true, data: updatedOrder };
      }

      // If online, proceed with server update
      const result = await updatePaymentType(orderId, paymentType, tenantId as string);

      if (result.order) {
        toast.success("Success", {
          description: "Payment type updated successfully",
        });
        return { success: true, data: result.order };
      } else {
        // Restore previous state in IndexedDB
        await db.saveOrder(currentOrder);

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
      queryClient.invalidateQueries({
        queryKey: ["orders", tenantId],
      });
      queryClient.invalidateQueries({
        queryKey: ["order"],
      });
      setIsPending(false);
    }
  };

  // Delete order with offline support
  const removeOrder = async (orderId: string) => {
    setIsPending(true);

    try {
      // Get current order from IndexedDB
      const currentOrder = await db.getOrder(orderId);
      if (!currentOrder) {
        throw new Error("Order not found");
      }

      // Mark as deleted in IndexedDB
      const deletedOrder = {
        ...currentOrder,
        deletedAt: new Date(),
      };
      await db.saveOrder(deletedOrder);

      // Queue for later sync if offline
      if (!navigator.onLine) {
        await db.saveQueuedAction({
          id: crypto.randomUUID(),
          name: "delete_order",
          params: {
            orderId,
            tenantId,
          },
          timestamp: new Date(),
          retries: 0,
        });

        // Update UI optimistically
        queryClient.setQueryData(["orders", tenantId], (old: any) => {
          if (!old) return old;
          return {
            orders: old.orders.filter((order: any) => order.id !== orderId),
            totalOrders: old.totalOrders - 1,
          };
        });

        toast.success("Order deleted", {
          description: "The order has been marked for deletion and will be removed when you're back online.",
        });

        return { success: true };
      }

      // If online, proceed with server deletion
      const result = await deleteOrder(orderId, tenantId as string);

      if (result.success) {
        toast.success("Success", {
          description: "Order deleted successfully",
        });
        return { success: true };
      } else {
        // Restore previous state in IndexedDB
        await db.saveOrder(currentOrder);

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
      queryClient.invalidateQueries({
        queryKey: ["orders", tenantId],
      });
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
