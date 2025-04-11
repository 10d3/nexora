"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDashboard } from "@/context/dashboard-provider";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { BarChart4, TrendingUp, DollarSign, ShoppingCart } from "lucide-react";

// Placeholder chart component - in a real app, you would use a proper chart library
const SalesChart = () => (
  <div className="h-[300px] w-full rounded-md border border-dashed flex items-center justify-center">
    <p className="text-muted-foreground">Sales Chart Visualization</p>
  </div>
);

export default function SalesReportPage() {
  const { dateRange, setDateRange } = useDashboard();
  const [activeTab, setActiveTab] = useState("overview");

  // This would be fetched from an API in a real application
  const salesData = {
    totalSales: "$12,345.67",
    orderCount: 156,
    averageOrderValue: "$79.14",
    growthRate: "+12.5%",
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold">Sales Reports</h1>
        <DatePickerWithRange
          dateRange={dateRange}
          setDateRange={setDateRange}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{salesData.totalSales}</div>
            <p className="text-xs text-muted-foreground">
              {dateRange.from?.toLocaleDateString()} -{" "}
              {dateRange.to?.toLocaleDateString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{salesData.orderCount}</div>
            <p className="text-xs text-muted-foreground">
              {dateRange.from?.toLocaleDateString()} -{" "}
              {dateRange.to?.toLocaleDateString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Average Order Value
            </CardTitle>
            <BarChart4 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {salesData.averageOrderValue}
            </div>
            <p className="text-xs text-muted-foreground">
              {dateRange.from?.toLocaleDateString()} -{" "}
              {dateRange.to?.toLocaleDateString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{salesData.growthRate}</div>
            <p className="text-xs text-muted-foreground">
              Compared to previous period
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sales Trends</CardTitle>
          <CardDescription>
            View your sales performance over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="products">By Product</TabsTrigger>
              <TabsTrigger value="categories">By Category</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-4">
              <SalesChart />
            </TabsContent>
            <TabsContent value="products" className="space-y-4">
              <SalesChart />
            </TabsContent>
            <TabsContent value="categories" className="space-y-4">
              <SalesChart />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Selling Products</CardTitle>
          <CardDescription>
            Your best performing products in the selected period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="min-w-full divide-y divide-border">
              <thead>
                <tr className="bg-muted/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Units Sold
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Profit
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {/* Placeholder data - would be dynamic in a real app */}
                <tr>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    Product A
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">245</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    $2,450.00
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    $980.00
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    Product B
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">189</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    $1,890.00
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    $756.00
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    Product C
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">156</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    $1,560.00
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    $624.00
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
