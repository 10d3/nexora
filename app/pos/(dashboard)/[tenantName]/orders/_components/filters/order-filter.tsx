"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RefreshCcw, Search } from "lucide-react";
import { useOrders } from "@/context/order-provider";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PaymentType, OrderStatus } from "@prisma/client";

export function OrderFilters() {
  const {
    searchQuery,
    setSearchQuery,
    selectedStatus,
    setSelectedStatus,
    selectedPaymentType,
    setSelectedPaymentType,
    dateRange,
    setDateRange,
    isLoading,
    refreshOrders,
  } = useOrders();

  const [searchInput, setSearchInput] = useState(searchQuery);

  // Update search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput, setSearchQuery]);

  const handleClearFilters = () => {
    setSearchInput("");
    setSearchQuery("");
    setSelectedStatus("all");
    setSelectedPaymentType("all");
    setDateRange("all");
  };

  return (
    <div className="space-y-4">
      <Tabs
        defaultValue="all"
        value={selectedStatus}
        onValueChange={(value) => setSelectedStatus(value as OrderStatus | "all")}
      >
        <TabsList className="grid grid-cols-7">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value={OrderStatus.PENDING}>Pending</TabsTrigger>
          <TabsTrigger value={OrderStatus.IN_PROGRESS}>Processing</TabsTrigger>
          <TabsTrigger value={OrderStatus.READY_FOR_PICKUP}>Ready for Pickup</TabsTrigger>
          <TabsTrigger value={OrderStatus.DELIVERED}>Delivered</TabsTrigger>
          <TabsTrigger value={OrderStatus.CANCELLED}>Cancelled</TabsTrigger>
          <TabsTrigger value={OrderStatus.REFUNDED}>Refunded</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex flex-col md:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search orders..."
            className="pl-8"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>

        {/* Payment Type Filter */}
        <Select
          value={selectedPaymentType}
          onValueChange={(value: PaymentType | "all") => setSelectedPaymentType(value)}
        >
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Payment Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Payments</SelectItem>
            <SelectItem value={PaymentType.CASH}>Cash</SelectItem>
            <SelectItem value={PaymentType.CREDIT_CARD}>Credit Card</SelectItem>
            <SelectItem value={PaymentType.DEBIT_CARD}>Debit Card</SelectItem>
            <SelectItem value={PaymentType.MOBILE_PAYMENT}>Mobile Payment</SelectItem>
            <SelectItem value={PaymentType.ONLINE_PAYMENT}>Online Payment</SelectItem>
            <SelectItem value={PaymentType.ROOM_CHARGE}>Room Charge</SelectItem>
            <SelectItem value={PaymentType.CREDIT}>Credit</SelectItem>
          </SelectContent>
        </Select>

        {/* Date Range Filter */}
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Date Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="yesterday">Yesterday</SelectItem>
            <SelectItem value="this_week">This Week</SelectItem>
            <SelectItem value="this_month">This Month</SelectItem>
            <SelectItem value="last_month">Last Month</SelectItem>
          </SelectContent>
        </Select>

        {/* Action Buttons */}
        <Button variant="outline" onClick={handleClearFilters}>
          Clear Filters
        </Button>
        <Button variant="outline" onClick={refreshOrders} disabled={isLoading}>
          <RefreshCcw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
    </div>
  );
}
