/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useOrderStats } from "@/hooks/use-orders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { DataCard } from "@/components/ui/data-card";
import { ShoppingCart, DollarSign, RefreshCcw } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
// import { InteractiveAreaChart } from "@/components/charts/area-chart";
// import { RadialChart } from "@/components/charts/radial-chart";
import { Skeleton } from "@/components/ui/skeleton";
import { DataCard } from "./data-card";
import { RadialChart } from "@/components/chart/radial-chart";
import { InteractiveAreaChart } from "@/components/chart/area-chart";

export function OrdersOverview() {
  const { data: orderStats, isLoading, error } = useOrderStats();

  // Format data for area chart
  const revenueData =
    orderStats?.dailyRevenue?.map((day: any) => ({
      date: day.date,
      revenue: day.revenue,
    })) || [];

  // Format data for radial chart
  const orderStatusData = orderStats?.ordersByStatus
    ? [
        {
          name: "Orders",
          ...orderStats.ordersByStatus.reduce((acc: any, curr: any) => {
            acc[curr.name.toLowerCase()] = curr.value;
            return acc;
          }, {}),
        },
      ]
    : [];

  const orderStatusKeys =
    orderStats?.ordersByStatus?.map((status: any) =>
      status.name.toLowerCase()
    ) || [];

  return (
    <main className="flex-1 overflow-auto p-4 sm:p-6">
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <DataCard
            title="Total Orders"
            value={orderStats?.totalOrders?.toString() || "0"}
            description={`${orderStats?.pendingOrders || 0} pending`}
            icon={<ShoppingCart className="h-4 w-4" />}
          />
          <DataCard
            title="Average Order Value"
            value={`$${orderStats?.averageOrderValue?.toFixed(2) || "0.00"}`}
            description="Per order"
            icon={<DollarSign className="h-4 w-4" />}
          />
          <DataCard
            title="Total Revenue"
            value={`$${orderStats?.totalRevenue?.toLocaleString() || "0"}`}
            description="This period"
            icon={<DollarSign className="h-4 w-4" />}
          />
          <DataCard
            title="Refunds"
            value={orderStats?.refunds?.toString() || "0"}
            description={`$${orderStats?.refundAmount?.toLocaleString() || "0"}`}
            icon={<RefreshCcw className="h-4 w-4" />}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  ))}
                </div>
              ) : error ? (
                <p className="text-center text-destructive">
                  Error loading order data
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orderStats?.recentOrders?.map(
                      (order: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {order.id}
                          </TableCell>
                          <TableCell>{order.customer}</TableCell>
                          <TableCell>${order.total}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                order.status === "COMPLETED"
                                  ? "default"
                                  : order.status === "PENDING"
                                    ? "outline"
                                    : order.status === "PROCESSING"
                                      ? "secondary"
                                      : "destructive"
                              }
                            >
                              {order.status.toLowerCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>{order.date}</TableCell>
                        </TableRow>
                      )
                    ) || (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center text-muted-foreground"
                        >
                          No data available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <RadialChart
            title="Orders by Status"
            description="Current distribution of order statuses"
            data={orderStatusData}
            dataKeys={orderStatusKeys}
            centerLabel="Orders"
            centerValue={orderStats?.totalOrders || 0}
            isLoading={isLoading}
            error={error}
          />
        </div>

        <InteractiveAreaChart
          title="Daily Revenue"
          description="Revenue trends over time"
          data={revenueData}
          dataKeys={["revenue"]}
          isLoading={isLoading}
          error={error}
        />
      </div>
    </main>
  );
}
