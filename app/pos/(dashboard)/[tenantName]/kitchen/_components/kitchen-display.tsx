/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useDashboard } from "@/context/dashboard-provider";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCcw,
  Utensils,
  CheckCheck,
  Timer,
  ClipboardList,
  Coffee,
  UtensilsCrossed,
  Info,
  Table,
  Flame,
  Bell,
} from "lucide-react";
import { getActiveOrders, updateOrderStatus } from "@/lib/actions/action.data";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
// Remove this import since we're not using it anymore
// import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

type OrderItem = {
  id: string;
  name: string;
  quantity: number;
  notes?: string;
};

type Order = {
  id: string;
  orderNumber: string;
  status: string;
  items: OrderItem[];
  tableNumber?: string;
  createdAt: Date;
  specialInstructions?: string;
};

export function KitchenDisplay() {
  const { tenantId } = useDashboard();
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    if (!tenantId) return;

    try {
      if (!loading) setRefreshing(true);
      const result = await getActiveOrders(tenantId);

      if (result.error) {
        setError(result.error);
        return;
      }

      // Add defensive programming to handle potential undefined values
      if (!result.orders || !Array.isArray(result.orders)) {
        setOrders([]);
        return;
      }

      // Transform the data to match our Order type with proper null checks
      const formattedOrders = result.orders.map((order: any) => ({
        id: order.id || "",
        orderNumber:
          order.orderNumber || `#${order.id?.substring(0, 6) || "Unknown"}`,
        status: order.status || "PENDING",
        items: Array.isArray(order.orderItems)
          ? order.orderItems.map((item: any) => ({
              id: item.id || "",
              name: item.product?.name || "Unknown Item",
              quantity: item.quantity || 1,
              notes: item.notes || "",
            }))
          : [],
        tableNumber: order.table?.number,
        createdAt: new Date(order.createdAt || Date.now()),
        specialInstructions: order.notes,
      }));

      setOrders(formattedOrders);
      setError(null);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to load orders. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    // Set up polling to refresh orders every 30 seconds
    const intervalId = setInterval(fetchOrders, 30000);

    return () => clearInterval(intervalId);
  }, [tenantId]);

  // Replace the toast implementation in the handleOrderAction function
  const handleOrderAction = async (orderId: string, newStatus: string) => {
    if (!tenantId) return;

    try {
      toast.loading("Updating order status...", {
        description: "Please wait while we update the order status.",
      });

      await updateOrderStatus(orderId, newStatus, tenantId);

      // Show success toast
      toast.success("Order updated", {
        description: `Order status changed to ${formatStatus(newStatus)}`,
      });

      // Refresh orders after status update
      fetchOrders();
    } catch (err) {
      console.error("Error updating order status:", err);
      setError("Failed to update order status. Please try again.");

      toast.error("Error updating order", {
        description: "Failed to update order status. Please try again.",
      });
    }
  };

  const getOrdersByStatus = (status: string) => {
    if (status === "pending") {
      return orders.filter((order) =>
        ["PENDING", "IN_PROGRESS"].includes(order.status)
      );
    } else if (status === "ready") {
      return orders.filter((order) => order.status === "READY");
    } else if (status === "all") {
      return orders;
    }
    return [];
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge
            variant="outline"
            className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800"
          >
            <Timer className="h-3 w-3 mr-1.5" />
            Pending
          </Badge>
        );
      case "IN_PROGRESS":
        return (
          <Badge
            variant="secondary"
            className="bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800"
          >
            <Flame className="h-3 w-3 mr-1.5" />
            In Progress
          </Badge>
        );
      case "READY":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-300 dark:border-green-800"
          >
            <Bell className="h-3 w-3 mr-1.5" />
            Ready
          </Badge>
        );
      case "COMPLETED":
        return (
          <Badge
            variant="default"
            className="bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-300 dark:border-purple-800"
          >
            <CheckCheck className="h-3 w-3 mr-1.5" />
            Completed
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getTimeAgo = (date: Date) => {
    return formatDistanceToNow(date, { addSuffix: true });
  };

  const getOrderUrgency = (date: Date) => {
    const minutesAgo = Math.floor((Date.now() - date.getTime()) / (1000 * 60));
    if (minutesAgo > 30) return "high";
    if (minutesAgo > 15) return "medium";
    return "normal";
  };

  const getOrderBorderColor = (status: string, date: Date) => {
    const urgency = getOrderUrgency(date);

    switch (status) {
      case "PENDING":
        return urgency === "high"
          ? "border-red-400 dark:border-red-500"
          : urgency === "medium"
            ? "border-amber-400 dark:border-amber-500"
            : "border-amber-300 dark:border-amber-400";
      case "IN_PROGRESS":
        return "border-blue-300 dark:border-blue-400";
      case "READY":
        return "border-green-300 dark:border-green-400";
      case "COMPLETED":
        return "border-purple-300 dark:border-purple-400";
      default:
        return "border-gray-300 dark:border-gray-600";
    }
  };

  const formatStatus = (status: string) => {
    return status
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getTotalItems = (order: Order) => {
    return order.items.reduce((total, item) => total + item.quantity, 0);
  };

  if (error) {
    return (
      <div className="p-8 text-center max-w-md mx-auto">
        <div className="bg-destructive/10 p-6 rounded-lg mb-4">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-destructive mb-2">
            Error Loading Orders
          </h3>
          <p className="text-muted-foreground mb-4">{error}</p>
        </div>
        <Button
          variant="default"
          className="mx-auto"
          onClick={fetchOrders}
          size="lg"
        >
          <RefreshCcw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          {/* <div className="p-2 rounded-lg">
            <ChefHat className="h-6 w-6 text-primary" />
          </div> */}
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Kitchen Display
            </h1>
            <p className="text-muted-foreground">
              Manage and track orders in the kitchen
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground mr-2 hidden md:block">
            <span className="font-medium">{orders.length}</span> active orders
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={fetchOrders}
                  variant="outline"
                  disabled={refreshing}
                  className="relative"
                >
                  <RefreshCcw
                    className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")}
                  />
                  Refresh
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Manually refresh orders</p>
                <p className="text-xs text-muted-foreground">
                  Auto-refreshes every 30 seconds
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <Tabs
        defaultValue="pending"
        value={activeTab}
        onValueChange={setActiveTab}
        className="px-4"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <TabsList className="h-auto p-1">
            <TabsTrigger
              value="pending"
              className="flex items-center gap-1.5 py-2 px-3 relative"
            >
              <Flame className="h-4 w-4" />
              <span>Pending & In Progress</span>
              {getOrdersByStatus("pending").length > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-1 bg-primary text-primary-foreground"
                >
                  {getOrdersByStatus("pending").length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="ready"
              className="flex items-center gap-1.5 py-2 px-3 relative"
            >
              <Bell className="h-4 w-4" />
              <span>Ready for Pickup</span>
              {getOrdersByStatus("ready").length > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-1 bg-primary text-primary-foreground"
                >
                  {getOrdersByStatus("ready").length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="all"
              className="flex items-center gap-1.5 py-2 px-3"
            >
              <ClipboardList className="h-4 w-4" />
              <span>All Orders</span>
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded-full bg-amber-400"></div>
              <span>Pending</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded-full bg-blue-400"></div>
              <span>In Progress</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
              <span>Ready</span>
            </div>
          </div>
        </div>

        {["pending", "ready", "all"].map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-0 space-y-4">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="border-2 border-dashed">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-5 w-20" />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {[...Array(4)].map((_, j) => (
                        <div key={j} className="flex justify-between">
                          <Skeleton className="h-4 w-40" />
                          <Skeleton className="h-4 w-10" />
                        </div>
                      ))}
                    </CardContent>
                    <CardFooter className="flex justify-end space-x-2 pt-2">
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-8 w-20" />
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : getOrdersByStatus(tab).length === 0 ? (
              <div className="text-center py-16 bg-muted/30 rounded-lg border border-dashed">
                <UtensilsCrossed className="h-12 w-12 text-muted-foreground/60 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-1">
                  No orders to display
                </h3>
                <p className="text-muted-foreground">
                  {tab === "pending"
                    ? "No pending or in-progress orders at the moment"
                    : tab === "ready"
                      ? "No orders ready for pickup"
                      : "No active orders in the system"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getOrdersByStatus(tab).map((order) => {
                  const urgency = getOrderUrgency(order.createdAt);
                  const isUrgent =
                    urgency === "high" && order.status === "PENDING";

                  return (
                    <Card
                      key={order.id}
                      className={cn(
                        "border-2 transition-all duration-300",
                        getOrderBorderColor(order.status, order.createdAt),
                        isUrgent && "animate-pulse-subtle"
                      )}
                    >
                      <CardHeader className="pb-2 space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-lg">
                              {order.orderNumber}
                            </CardTitle>
                            {order.tableNumber && (
                              <Badge variant="outline" className="font-normal">
                                <Table className="h-3 w-3 mr-1" />
                                Table {order.tableNumber}
                              </Badge>
                            )}
                          </div>
                          {getStatusBadge(order.status)}
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center text-muted-foreground">
                            <Clock className="h-3.5 w-3.5 mr-1.5" />
                            <span
                              className={cn(
                                isUrgent && "text-red-500 font-medium"
                              )}
                            >
                              {getTimeAgo(order.createdAt)}
                            </span>
                          </div>
                          <div className="flex items-center text-muted-foreground">
                            <Utensils className="h-3.5 w-3.5 mr-1.5" />
                            <span>{getTotalItems(order)} items</span>
                          </div>
                        </div>
                      </CardHeader>

                      <Separator className="mb-3" />

                      <CardContent className="space-y-3">
                        <ScrollArea className="h-[140px] pr-4">
                          {order.items.map((item, index) => (
                            <div
                              key={item.id}
                              className={cn(
                                "py-2 flex justify-between",
                                index !== order.items.length - 1 &&
                                  "border-b border-border/50"
                              )}
                            >
                              <div>
                                <div className="font-medium flex items-center">
                                  <Coffee className="h-3.5 w-3.5 mr-1.5 text-primary" />
                                  {item.name}
                                </div>
                                {item.notes && (
                                  <div className="text-xs text-muted-foreground mt-1 flex items-start">
                                    <Info className="h-3 w-3 mr-1 flex-shrink-0 mt-0.5" />
                                    <span>{item.notes}</span>
                                  </div>
                                )}
                              </div>
                              <Badge variant="outline" className="ml-2 h-6">
                                x{item.quantity}
                              </Badge>
                            </div>
                          ))}
                        </ScrollArea>

                        {order.specialInstructions && (
                          <div className="mt-3 p-3 bg-muted rounded-md text-sm">
                            <p className="font-semibold flex items-center mb-1">
                              <AlertCircle className="h-3.5 w-3.5 mr-1.5 text-amber-500" />
                              Special Instructions:
                            </p>
                            <p className="text-muted-foreground">
                              {order.specialInstructions}
                            </p>
                          </div>
                        )}
                      </CardContent>

                      <CardFooter className="flex justify-end space-x-2 pt-2 border-t">
                        {order.status === "PENDING" && (
                          <Button
                            variant="outline"
                            className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:text-blue-800 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800 dark:hover:bg-blue-900/50"
                            onClick={() =>
                              handleOrderAction(order.id, "IN_PROGRESS")
                            }
                          >
                            <Flame className="h-4 w-4 mr-2" />
                            Start Cooking
                          </Button>
                        )}
                        {order.status === "IN_PROGRESS" && (
                          <Button
                            variant="default"
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => handleOrderAction(order.id, "READY")}
                          >
                            <Bell className="h-4 w-4 mr-2" />
                            Mark Ready
                          </Button>
                        )}
                        {order.status === "READY" && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="default"
                                className="bg-purple-600 hover:bg-purple-700 text-white"
                              >
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Complete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Complete this order?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will mark order {order.orderNumber} as
                                  completed and remove it from the active orders
                                  list.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleOrderAction(order.id, "COMPLETED")
                                  }
                                >
                                  Complete Order
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
