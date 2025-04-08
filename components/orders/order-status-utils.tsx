/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  CircleAlert,
  CircleCheck,
  CircleDashed,
  CircleEllipsis,
  CircleX,
  RefreshCcw,
  XCircle,
  AlertTriangle,
  Package,
  TruckIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useOrders } from "@/context/order-provider";
import { OrderStatus } from "@prisma/client";

export type PaymentStatus =
  | "PAID"
  | "UNPAID"
  | "PARTIALLY_PAID"
  | "REFUNDED"
  | "FAILED";

interface UseOrderStatusUtilsProps {
  orders: any[];
  selectedOrder: any | null;
}

export function useOrderStatusUtils({
//   orders,
  selectedOrder,
}: UseOrderStatusUtilsProps) {
  const { updateStatus, setSelectedOrder } = useOrders();

  const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
    try {
      const result = await updateStatus(orderId, status);

      if (result.success) {
        toast.success(`Order status updated to ${status.replace(/_/g, " ")}`);

        // If the selected order is the one being updated, update it
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({
            ...selectedOrder,
            status: status,
            timeline: [
              {
                status: status,
                timestamp: new Date(),
              },
              ...(selectedOrder.timeline || []),
            ],
          });
        }
      } else {
        toast.error("Failed to update order status");
      }
    } catch (error) {
      toast.error("An error occurred while updating order status");
      console.error(error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-500 dark:border-amber-800"
          >
            <CircleDashed className="h-3.5 w-3.5 mr-1" />
            Pending
          </Badge>
        );
      case "processing":
        return (
          <Badge
            variant="outline"
            className="bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-500 dark:border-blue-800"
          >
            <Package className="h-3.5 w-3.5 mr-1" />
            Processing
          </Badge>
        );
      case "shipped":
        return (
          <Badge
            variant="outline"
            className="bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-500 dark:border-purple-800"
          >
            <TruckIcon className="h-3.5 w-3.5 mr-1" />
            Shipped
          </Badge>
        );
      case "delivered":
        return (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-500 dark:border-green-800"
          >
            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
            Delivered
          </Badge>
        );
      case "cancelled":
        return (
          <Badge
            variant="outline"
            className="bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-500 dark:border-red-800"
          >
            <XCircle className="h-3.5 w-3.5 mr-1" />
            Cancelled
          </Badge>
        );
      case "refunded":
        return (
          <Badge
            variant="outline"
            className="bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-900/30 dark:text-gray-500 dark:border-gray-800"
          >
            <RefreshCcw className="h-3.5 w-3.5 mr-1" />
            Refunded
          </Badge>
        );
      case "on-hold":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-500 dark:border-yellow-800"
          >
            <AlertTriangle className="h-3.5 w-3.5 mr-1" />
            On Hold
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <CircleDashed className="h-3.5 w-3.5 mr-1" />
            {status}
          </Badge>
        );
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-500 dark:border-green-800"
          >
            <CircleCheck className="h-3.5 w-3.5 mr-1" />
            Paid
          </Badge>
        );
      case "unpaid":
        return (
          <Badge
            variant="outline"
            className="bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-500 dark:border-red-800"
          >
            <CircleX className="h-3.5 w-3.5 mr-1" />
            Unpaid
          </Badge>
        );
      case "partially_paid":
        return (
          <Badge
            variant="outline"
            className="bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-500 dark:border-amber-800"
          >
            <CircleEllipsis className="h-3.5 w-3.5 mr-1" />
            Partially Paid
          </Badge>
        );
      case "refunded":
        return (
          <Badge
            variant="outline"
            className="bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-900/30 dark:text-gray-500 dark:border-gray-800"
          >
            <RefreshCcw className="h-3.5 w-3.5 mr-1" />
            Refunded
          </Badge>
        );
      case "failed":
        return (
          <Badge
            variant="outline"
            className="bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-500 dark:border-red-800"
          >
            <CircleAlert className="h-3.5 w-3.5 mr-1" />
            Failed
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <CircleDashed className="h-3.5 w-3.5 mr-1" />
            {status}
          </Badge>
        );
    }
  };

  return {
    handleUpdateStatus,
    getStatusBadge,
    getPaymentStatusBadge,
  };
}
