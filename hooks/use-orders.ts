"use client";

import { useQuery } from "@tanstack/react-query";
import { getOrders, getOrderStats } from "@/lib/actions/action.data";
import { useDashboard } from "@/context/dashboard-provider";
import db from "@/lib/services/db.service";
import { IOrder, IOrderStats } from "@/lib/services/db.service";

// Assuming we have a way to get the current tenant ID
// const TENANT_ID = "tenant_123"; // Replace with actual tenant ID or fetch logic

export function useOrders(limit = 10) {
  const { businessType, tenantId } = useDashboard();

  return useQuery({
    queryKey: ["orders", businessType, tenantId, limit],
    queryFn: async () => {
      // Try to get data from server first if online
      if (navigator.onLine) {
        console.log("Fetching orders from server");
        try {
          const result = await getOrders(businessType, tenantId as string, limit);
          if (result.orders) {
            // Convert Prisma orders to IndexedDB format and store them
            for (const order of result.orders) {
              const indexedDBOrder: IOrder = {
                id: order.id,
                orderNumber: order.orderNumber,
                status: order.status,
                total: order.total,
                tax: order.tax,
                discount: order.discount,
                paymentType: order.paymentType,
                orderType: order.orderType,
                reservationId: order.reservationId || undefined,
                bookingId: order.bookingId || undefined,
                appointmentId: order.appointmentId || undefined,
                userId: order.userId,
                tenantId: order.tenantId,
                customerProfileId: order.customerProfileId || undefined,
                createdAt: order.createdAt,
                updatedAt: order.updatedAt,
                completedAt: order.completedAt || undefined,
                completedBy: order.completedBy || undefined,
                completedReason: order.completedReason || undefined,
                deletedBy: order.deletedBy || undefined,
                deletedAt: order.deletedAt || undefined,
                orderItems: order.orderItems.map(item => ({
                  id: item.id,
                  quantity: item.quantity,
                  price: item.price,
                  notes: item.notes,
                  productId: item.productId,
                  menuId: item.menuId,
                  roomId: item.roomId,
                  orderId: order.id,
                  createdAt: item.createdAt,
                  updatedAt: item.updatedAt,
                })),
              };
              await db.saveOrder(indexedDBOrder);
              if (indexedDBOrder.orderItems) {
                for (const item of indexedDBOrder.orderItems) {
                  await db.saveOrderItem(item);
                }
              }
            }
            return result.orders;
          }
        } catch (error) {
          console.error("Error fetching orders from server:", error);
        }
      }

      // If offline or server request failed, get data from IndexedDB
      const orders = await db.getOrdersByTenant(tenantId as string);
      return orders;
    },
  });
}

export function useOrderStats() {
  const { businessType, dateRange, tenantId } = useDashboard();

  return useQuery({
    queryKey: [
      "orderStats",
      businessType,
      tenantId,
      dateRange.from,
      dateRange.to,
    ],
    queryFn: async () => {
      // Try to get data from server first if online
      if (navigator.onLine) {
        try {
          const result = await getOrderStats(
            businessType,
            tenantId as string,
            dateRange.from,
            dateRange.to
          );
          if (result) {
            // Convert the stats to the correct format
            const ordersByStatus: Record<string, number> = {};
            if (result.ordersByStatus) {
              for (const status of result.ordersByStatus) {
                ordersByStatus[status.name] = status.value;
              }
            }

            // Store the stats in IndexedDB for offline access
            const stats: IOrderStats = {
              id: `${tenantId}-${dateRange.from}-${dateRange.to}`,
              tenantId: tenantId as string,
              stats: {
                totalOrders: result.totalOrders || 0,
                totalRevenue: result.totalRevenue || 0,
                averageOrderValue: result.averageOrderValue || 0,
                ordersByStatus,
                ordersByPaymentType: {}, // This will be populated based on business type
              },
              timestamp: new Date(),
            };

            await db.saveOrderStats(stats);
            return result;
          }
        } catch (error) {
          console.error("Error fetching order stats from server:", error);
        }
      }

      // If offline or server request failed, get data from IndexedDB
      const stats = await db.getOrderStats(tenantId as string, dateRange.from, dateRange.to);
      return stats?.stats || {
        totalOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        ordersByStatus: {},
        ordersByPaymentType: {},
      };
    },
  });
}
