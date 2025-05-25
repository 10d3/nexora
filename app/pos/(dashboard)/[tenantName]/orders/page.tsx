/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import {
  ShoppingBag,
  MoreHorizontal,
  ArrowUpDown,
  Eye,
  Printer,
  Send,
  Download,
  Trash2,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { OrderDetailsSheet } from "@/components/orders/order-details-sheet";
import { useOrderStatusUtils } from "@/components/orders/order-status-utils";
import { OrderHeader } from "./_components/order-header";
import { OrderStats } from "./_components/order-stats";
import { OrderFilters } from "./_components/filters/order-filter";
import { useOrders } from "@/context/order-provider";
import { toast } from "sonner";
import { formatCurrency, formatDate, getInitials } from "@/lib/utils";
import { CustomPagination } from "@/components/shared/custom-pagination";
import { OrderStatus, PaymentType } from "@prisma/client";
import { PaymentSheet } from "@/components/payment/payment-sheet";

interface Order {
  id: string;
  orderNumber: string;
  customerProfile: {
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
  status: OrderStatus;
  paymentType: PaymentType;
  orderDate: Date;
  total: number;
}

export default function OrdersPage() {
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);

  const {
    orders,
    ordersData,
    selectedOrder,
    isLoading,
    filteredOrders,
    setSelectedOrder,
    removeOrder,
    currentPage,
    totalPages,
    setCurrentPage,
    pageSize,
    totalOrders,
    setIsOrderDetailsOpen,
  } = useOrders();

  const [isPaymentSheetOpen, setIsPaymentSheetOpen] = useState(false);

  // Handle sorting
  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Handle payment completion
  const handlePaymentComplete = (paymentType: string) => {
    // Update order status, etc.
    console.log(`Payment completed with ${paymentType}`);
  };

  const { getStatusBadge, getPaymentStatusBadge } = useOrderStatusUtils();

  // Handle view order details
  const handleViewOrderDetails = (order: any) => {
    setSelectedOrder(order);
    setIsOrderDetailsOpen(true);
  };

  // Handle delete order
  const handleDeleteOrder = async (orderId: string) => {
    if (
      confirm(
        "Are you sure you want to delete this order? This action cannot be undone."
      )
    ) {
      try {
        const result = await removeOrder(orderId);
        if (result.success) {
          toast.success("Order deleted successfully");
        }
      } catch (error) {
        toast.error("Failed to delete order");
      }
    }
  };

  console.log("orders from page", ordersData);

  return (
    <div className="container mx-auto py-6 space-y-8">
      {/* Header */}
      <OrderHeader />

      {/* Stats Cards */}
      <OrderStats />

      {/* Filters */}
      <OrderFilters />

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">
                    <Button
                      variant="ghost"
                      className="p-0 h-8 font-medium"
                      onClick={() => handleSort("orderNumber")}
                    >
                      Order
                      <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
                    </Button>
                  </TableHead>
                  <TableHead className="min-w-[150px]">
                    <Button
                      variant="ghost"
                      className="p-0 h-8 font-medium"
                      onClick={() => handleSort("customer.name")}
                    >
                      Customer
                      <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      className="p-0 h-8 font-medium"
                      onClick={() => handleSort("status")}
                    >
                      Status
                      <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      className="p-0 h-8 font-medium"
                      onClick={() => handleSort("paymentStatus")}
                    >
                      Payment
                      <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      className="p-0 h-8 font-medium"
                      onClick={() => handleSort("orderDate")}
                    >
                      Date
                      <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">
                    <Button
                      variant="ghost"
                      className="p-0 h-8 font-medium"
                      onClick={() => handleSort("total")}
                    >
                      Total
                      <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 10 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        <div className="h-5 w-20 bg-muted animate-pulse rounded"></div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 bg-muted animate-pulse rounded-full"></div>
                          <div className="space-y-1">
                            <div className="h-4 w-24 bg-muted animate-pulse rounded"></div>
                            <div className="h-3 w-32 bg-muted animate-pulse rounded"></div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="h-5 w-24 bg-muted animate-pulse rounded"></div>
                      </TableCell>
                      <TableCell>
                        <div className="h-5 w-20 bg-muted animate-pulse rounded"></div>
                      </TableCell>
                      <TableCell>
                        <div className="h-5 w-28 bg-muted animate-pulse rounded"></div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="h-5 w-16 bg-muted animate-pulse rounded ml-auto"></div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="h-8 w-20 bg-muted animate-pulse rounded ml-auto"></div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <ShoppingBag className="h-8 w-8 mb-2" />
                        <p>No orders found</p>
                        <p className="text-sm">
                          Try adjusting your filters or search terms
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        #{order.orderNumber}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            {order.customerProfile?.avatar ? (
                              <AvatarImage
                                src={order.customerProfile.avatar}
                                alt={order.customerProfile.firstName}
                              />
                            ) : null}
                            <AvatarFallback>
                              {getInitials(
                                order.customerProfile?.firstName || ""
                              )}
                            </AvatarFallback>
                          </Avatar>
                          <div className="text-sm">
                            <div>{order.customerProfile?.firstName}</div>
                            <div className="text-xs text-muted-foreground">
                              {order.customerProfile?.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell>
                        {getPaymentStatusBadge(
                          order.paymentStatus || order.paymentType
                        )}
                      </TableCell>
                      <TableCell>{formatDate(order.orderDate)}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(order.total)}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewOrderDetails(order)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  setIsPaymentSheetOpen(true);
                                  setSelectedOrder(order);
                                }}
                              >
                                <CreditCard className="h-4 w-4 mr-2" />
                                Pay
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleViewOrderDetails(order)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Printer className="h-4 w-4 mr-2" />
                                Print Invoice
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Send className="h-4 w-4 mr-2" />
                                Email Customer
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="h-4 w-4 mr-2" />
                                Download Invoice
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleDeleteOrder(order.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Order
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
        <CardFooter className="flex items-center justify-between px-4 border-t">
          <div className="text-sm text-muted-foreground">
            Showing{" "}
            {filteredOrders.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}{" "}
            to {Math.min(currentPage * pageSize, totalOrders)} of {totalOrders}{" "}
            orders
          </div>
          {/* <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          /> */}
          <CustomPagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={totalOrders}
            selectedItems={0}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => {
              // Add page size change handler if needed
              // You might need to add this function to your order provider
              console.log("Page size changed to:", size);
            }}
          />
        </CardFooter>
      </Card>

      {/* Order Details Sheet */}
      <OrderDetailsSheet
      // order={selectedOrder}
      // isOpen={isOrderDetailsOpen}
      // onOpenChange={setIsOrderDetailsOpen}
      // onUpdateStatus={handleUpdateStatus}
      // getStatusBadge={getStatusBadge}
      // getPaymentStatusBadge={getPaymentStatusBadge}
      // formatDate={formatDate}
      // formatCurrency={formatCurrency}
      // getInitials={getInitials}
      />
      <PaymentSheet
        open={isPaymentSheetOpen}
        onOpenChange={setIsPaymentSheetOpen}
        amount={selectedOrder?.total || 0}
        orderId={selectedOrder?.id || ""}
        onPaymentComplete={handlePaymentComplete}
        items={selectedOrder?.items || []}
      />
    </div>
  );
}
