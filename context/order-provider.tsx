/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useOrderMutation } from "@/hooks/use-order-mutations";
import { OrderStatus, PaymentType } from "@prisma/client";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getOrders, getOrderById } from "@/lib/actions/order-actions";
import { useDashboard } from "./dashboard-provider";

// Define types for order-related data
type OrderItem = {
  id: string;
  productId: string;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  total: number;
  options?: string[];
};

type CustomerProfile = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
};

type Address = {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

type Order = {
  id: string;
  orderNumber: string;
  customerProfile: CustomerProfile | null;
  customer: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
  items: OrderItem[];
  total: number;
  tax: number;
  shipping: number;
  discount: number;
  orderDate: Date;
  status: OrderStatus;
  paymentType: PaymentType;
  shippingAddress?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  billingAddress?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  notes?: string;
  trackingNumber?: string;
  timeline?: {
    status: string;
    timestamp: Date;
    note?: string;
  }[];
};

// Define the context type
type OrderContextType = {
  orders: Order[];
  ordersData: {
    orders: Order[];
    totalOrders: number;
    error?: string;
  } | null;
  filteredOrders: Order[];
  selectedOrder: Order | null;
  isLoading: boolean;
  searchQuery: string;
  selectedStatus: OrderStatus | "all";
  selectedPaymentType: PaymentType | "all";
  dateRange: string;
  setSearchQuery: (query: string) => void;
  setSelectedStatus: (status: OrderStatus | "all") => void;
  setSelectedPaymentType: (type: PaymentType | "all") => void;
  setDateRange: (range: string) => void;
  setSelectedOrder: (order: Order | null) => void;
  createNewOrder: (
    orderData: any
  ) => Promise<{ success: boolean; data?: any; error?: string }>;
  updateStatus: (
    orderId: string,
    status: OrderStatus
  ) => Promise<{ success: boolean; data?: any; error?: string }>;
  updatePayment: (
    orderId: string,
    paymentType: PaymentType
  ) => Promise<{ success: boolean; data?: any; error?: string }>;
  removeOrder: (
    orderId: string
  ) => Promise<{ success: boolean; error?: string }>;
  refreshOrders: () => void;
  isPending: boolean;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalOrders: number;
  setCurrentPage: (page: number) => void;
  isOrderDetailsOpen: boolean;
  setIsOrderDetailsOpen: (isOpen: boolean) => void;
};

// Create the context
const OrderContext = createContext<OrderContextType | undefined>(undefined);

// Provider props type
type OrderProviderProps = {
  children: ReactNode;
};

export function OrderProvider({ children }: OrderProviderProps) {
  const params = useParams();
  const tenantName = params.tenantName as string;
  const { tenantId } = useDashboard();
  const queryClient = useQueryClient();

  // State for orders
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "all">(
    "all"
  );
  const [selectedPaymentType, setSelectedPaymentType] = useState<
    PaymentType | "all"
  >("all");
  const [dateRange, setDateRange] = useState<string>("all");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Is detail sheet open
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);

  // Get mutation functions
  const {
    createNewOrder,
    updateStatus,
    updatePayment,
    removeOrder,
    isPending,
  } = useOrderMutation();

  // Prepare date range for query
  const getDateRange = () => {
    const now = new Date();
    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (dateRange === "today") {
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999);
    } else if (dateRange === "yesterday") {
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 1);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now);
      endDate.setDate(endDate.getDate() - 1);
      endDate.setHours(23, 59, 59, 999);
    } else if (dateRange === "last7days") {
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 7);
    } else if (dateRange === "last30days") {
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 30);
    }

    return { startDate, endDate };
  };

  // Use TanStack Query for orders
  const {
    data: ordersData,
    isLoading: isOrdersLoading,
    error: ordersError,
  } = useQuery({
    queryKey: [
      "orders",
      tenantName,
      searchQuery,
      selectedStatus,
      selectedPaymentType,
      dateRange,
      currentPage,
      pageSize,
    ],
    queryFn: async () => {
      const { startDate, endDate } = getDateRange();

      // Convert status and payment type if not "all"
      const statusFilter =
        selectedStatus !== "all" ? selectedStatus : undefined;

      const paymentFilter =
        selectedPaymentType !== "all" ? selectedPaymentType : undefined;

      // Calculate offset for pagination
      const offset = (currentPage - 1) * pageSize;

      return getOrders(
        tenantId as string,
        searchQuery || undefined,
        statusFilter,
        paymentFilter,
        startDate,
        endDate,
        pageSize,
        offset
      );
    },
    enabled: !!tenantName,
  });

  console.log("ordersData", ordersData);

  // Transform orders data
  const transformOrder = (order: any): Order => ({
    id: order.id,
    orderNumber: order.orderNumber,
    customerProfile: order.customerProfile,
    customer: {
      id: order.customerProfile?.id || "",
      name: `${order.customerProfile?.firstName || ""} ${order.customerProfile?.lastName || ""}`.trim(),
      email: order.customerProfile?.email || "",
      phone: order.customerProfile?.phone || "",
      avatar: order.customerProfile?.avatar,
    },
    items: order.orderItems.map((item: any) => ({
      id: item.id,
      productId: item.productId,
      name: item.product?.name || "",
      sku: item.product?.sku || "",
      quantity: item.quantity,
      price: item.price,
      total: item.total,
      options: item.options,
    })),
    total: order.total,
    tax: order.tax,
    shipping: order.shipping,
    discount: order.discount,
    orderDate: order.createdAt,
    status: order.status,
    paymentType: order.paymentType,
    shippingAddress: order.shippingAddress,
    billingAddress: order.billingAddress,
    notes: order.notes,
    trackingNumber: order.trackingNumber,
    timeline: order.timeline,
  });

  // Update orders state when query data changes
  useEffect(() => {
    if (ordersData?.orders) {
      const transformedOrders = ordersData.orders.map(transformOrder);
      setOrders(transformedOrders);
      setFilteredOrders(transformedOrders);
    }
  }, [ordersData]);

  // Update loading state
  useEffect(() => {
    setIsLoading(isOrdersLoading);
  }, [isOrdersLoading]);

  // Update total pages when total orders or page size changes
  useEffect(() => {
    setTotalPages(Math.ceil(totalOrders / pageSize));
  }, [totalOrders, pageSize]);

  // Function to manually update an order in the local cache
  const updateLocalOrder = (updatedOrder: Order) => {
    queryClient.setQueryData(
      [
        "orders",
        tenantName,
        searchQuery,
        selectedStatus,
        selectedPaymentType,
        dateRange,
        currentPage,
        pageSize,
      ],
      (oldData: any | undefined) => {
        if (!oldData || !oldData.orders) return oldData;

        const updatedOrders = oldData.orders.map((order: any) =>
          order.id === updatedOrder.id
            ? {
                ...order,
                status: updatedOrder.status,
                paymentType: updatedOrder.paymentType,
                timeline: updatedOrder.timeline,
              }
            : order
        );

        return {
          ...oldData,
          orders: updatedOrders,
        };
      }
    );
  };

  // Refresh orders
  const refreshOrders = async () => {
    await queryClient.invalidateQueries({
      queryKey: ["orders", tenantName],
    });
  };

  // Context value
  const value: OrderContextType = {
    orders,
    ordersData: ordersData?.error
      ? { orders: [], totalOrders: 0, error: ordersData.error }
      : ordersData?.orders
        ? {
            orders: ordersData.orders.map(transformOrder),
            totalOrders: ordersData.totalOrders,
          }
        : null,
    filteredOrders,
    selectedOrder,
    isLoading,
    searchQuery,
    selectedStatus,
    selectedPaymentType,
    dateRange,
    setSearchQuery,
    setSelectedStatus,
    setSelectedPaymentType,
    setDateRange,
    setSelectedOrder,
    createNewOrder,
    updateStatus,
    updatePayment,
    removeOrder,
    refreshOrders,
    isPending,
    currentPage,
    totalPages,
    pageSize,
    totalOrders,
    setCurrentPage,
    isOrderDetailsOpen,
    setIsOrderDetailsOpen,
  };

  return (
    <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
  );
}

// Custom hook to use the order context
export function useOrders() {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error("useOrders must be used within an OrderProvider");
  }
  return context;
}
