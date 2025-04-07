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

type Customer = {
  id: string;
  name: string;
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
  customer: Customer;
  items: OrderItem[];
  total: number;
//   subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  orderDate: Date;
  status: OrderStatus;
  paymentType: PaymentType;
//   paymentMethod?: string;
  shippingAddress: Address;
  billingAddress: Address;
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
  filteredOrders: Order[];
  selectedOrder: Order | null;
  isLoading: boolean;
  searchQuery: string;
  selectedStatus: string;
  selectedPaymentType: string;
  dateRange: string;
  setSearchQuery: (query: string) => void;
  setSelectedStatus: (status: string) => void;
  setSelectedPaymentType: (type: string) => void;
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
  // Add pagination properties
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalOrders: number;
  setCurrentPage: (page: number) => void;
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

  // State for orders
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedPaymentType, setSelectedPaymentType] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("all");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Get mutation functions
  const {
    createNewOrder,
    updateStatus,
    updatePayment,
    removeOrder,
    isPending,
  } = useOrderMutation();

  // Fetch orders on component mount
  useEffect(() => {
    fetchOrders();
  }, [tenantName]);

  // Apply filters when filter criteria change
  useEffect(() => {
    applyFilters();
  }, [
    orders,
    searchQuery,
    selectedStatus,
    selectedPaymentType,
    dateRange,
    currentPage,
  ]);

  // Update total pages when total orders or page size changes
  useEffect(() => {
    setTotalPages(Math.ceil(totalOrders / pageSize));
  }, [totalOrders, pageSize]);

  // Fetch orders from API
  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      // Replace with actual API call when ready
      // const response = await fetch(`/api/tenants/${tenantName}/orders`);
      // const data = await response.json();
      // setOrders(data.orders);
      // setTotalOrders(data.totalOrders || data.orders.length);

      // For now, using mock data or empty array
      setOrders([]);
      setFilteredOrders([]);
      setTotalOrders(0);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  };

  // Apply filters to orders
  const applyFilters = () => {
    let filtered = [...orders];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.orderNumber.toLowerCase().includes(query) ||
          order.customer.name.toLowerCase().includes(query) ||
          order.customer.email.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (selectedStatus !== "all") {
      filtered = filtered.filter((order) => order.status === selectedStatus);
    }

    // Apply payment type filter
    if (selectedPaymentType !== "all") {
      filtered = filtered.filter(
        (order) => order.paymentType === selectedPaymentType
      );
    }

    // Apply date range filter
    const now = new Date();
    if (dateRange === "today") {
      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.orderDate);
        return orderDate.toDateString() === now.toDateString();
      });
    } else if (dateRange === "yesterday") {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.orderDate);
        return orderDate.toDateString() === yesterday.toDateString();
      });
    } else if (dateRange === "last7days") {
      const last7Days = new Date(now);
      last7Days.setDate(last7Days.getDate() - 7);
      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.orderDate);
        return orderDate >= last7Days;
      });
    } else if (dateRange === "last30days") {
      const last30Days = new Date(now);
      last30Days.setDate(last30Days.getDate() - 30);
      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.orderDate);
        return orderDate >= last30Days;
      });
    }

    // Default sort by order date (newest first)
    filtered.sort((a, b) => b.orderDate.getTime() - a.orderDate.getTime());

    // Update total count for pagination
    setTotalOrders(filtered.length);

    // Apply pagination
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedOrders = filtered.slice(startIndex, startIndex + pageSize);

    setFilteredOrders(paginatedOrders);
  };

  // Refresh orders
  const refreshOrders = () => {
    fetchOrders();
  };

  // Context value
  const value = {
    orders,
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
    // Add pagination values
    currentPage,
    totalPages,
    pageSize,
    totalOrders,
    setCurrentPage,
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
