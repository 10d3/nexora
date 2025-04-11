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
import {
  Package,
  AlertTriangle,
//   TrendingDown,
  ArrowDownUp,
} from "lucide-react";

// Placeholder chart component - in a real app, you would use a proper chart library
const InventoryChart = () => (
  <div className="h-[300px] w-full rounded-md border border-dashed flex items-center justify-center">
    <p className="text-muted-foreground">Inventory Chart Visualization</p>
  </div>
);

export default function InventoryReportPage() {
  const { dateRange, setDateRange } = useDashboard();
  const [activeTab, setActiveTab] = useState("overview");

  // This would be fetched from an API in a real application
  const inventoryData = {
    totalItems: 1245,
    lowStockItems: 23,
    inventoryValue: "$45,678.90",
    turnoverRate: "4.2x",
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold">Inventory Reports</h1>
        <DatePickerWithRange
          dateRange={dateRange}
          setDateRange={setDateRange}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventoryData.totalItems}</div>
            <p className="text-xs text-muted-foreground">
              Products in inventory
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Low Stock Items
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {inventoryData.lowStockItems}
            </div>
            <p className="text-xs text-muted-foreground">
              Items below reorder level
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Inventory Value
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {inventoryData.inventoryValue}
            </div>
            <p className="text-xs text-muted-foreground">
              Total value of current stock
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Turnover Rate</CardTitle>
            <ArrowDownUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {inventoryData.turnoverRate}
            </div>
            <p className="text-xs text-muted-foreground">
              Annual inventory turnover
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inventory Trends</CardTitle>
          <CardDescription>
            View your inventory levels over time
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
              <TabsTrigger value="categories">By Category</TabsTrigger>
              <TabsTrigger value="movement">Stock Movement</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-4">
              <InventoryChart />
            </TabsContent>
            <TabsContent value="categories" className="space-y-4">
              <InventoryChart />
            </TabsContent>
            <TabsContent value="movement" className="space-y-4">
              <InventoryChart />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Low Stock Items</CardTitle>
          <CardDescription>
            Items that need to be restocked soon
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
                    Current Stock
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Reorder Level
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {/* Placeholder data - would be dynamic in a real app */}
                <tr>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    Product A
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">5</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">10</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-800">
                      Low Stock
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    Product B
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">2</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">15</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                      Critical
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    Product C
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">8</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">10</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-800">
                      Low Stock
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Inventory Valuation</CardTitle>
          <CardDescription>Value of inventory by category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="min-w-full divide-y divide-border">
              <thead>
                <tr className="bg-muted/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    % of Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {/* Placeholder data - would be dynamic in a real app */}
                <tr>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    Electronics
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">245</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    $12,450.00
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">27.3%</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    Clothing
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">189</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    $9,890.00
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">21.7%</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">Food</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">156</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    $7,560.00
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">16.6%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
