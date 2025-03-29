"use client";

import { ShoppingCart, TrendingUp, Package, Truck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DataCard } from "../shared/data-card";
import { InteractivePieChart } from "@/components/chart/interactive-pie";
import { InteractiveAreaChart } from "@/components/chart/area-chart";

// Sample data
const departmentPerformance = [
  { name: "Grocery", sales: 45000, target: 50000 },
  { name: "Produce", sales: 32000, target: 30000 },
  { name: "Dairy", sales: 28000, target: 25000 },
  { name: "Meat", sales: 35000, target: 40000 },
  { name: "Bakery", sales: 18000, target: 20000 },
];

const categorySales = [
  { name: "Grocery", value: 35 },
  { name: "Produce", value: 25 },
  { name: "Dairy", value: 15 },
  { name: "Meat", value: 15 },
  { name: "Bakery", value: 10 },
];

const promotionEffectiveness = [
  { date: "2023-06-01", before: 10000, during: 15000, after: 12000 },
  { date: "2023-06-08", before: 11000, during: 18000, after: 13000 },
  { date: "2023-06-15", before: 10500, during: 17000, after: 12500 },
];

const perishableInventory = [
  {
    name: "Fresh Produce",
    expiring: "2 days",
    quantity: 120,
    status: "critical",
  },
  {
    name: "Dairy Products",
    expiring: "5 days",
    quantity: 85,
    status: "warning",
  },
  { name: "Bakery Items", expiring: "1 day", quantity: 45, status: "critical" },
  {
    name: "Meat Products",
    expiring: "3 days",
    quantity: 65,
    status: "warning",
  },
];

const supplierDeliveries = [
  {
    supplier: "FreshFarms Inc.",
    items: "Produce",
    scheduled: "Today, 10:00 AM",
    status: "on-time",
  },
  {
    supplier: "Dairy Delights",
    items: "Dairy",
    scheduled: "Tomorrow, 8:00 AM",
    status: "pending",
  },
  {
    supplier: "Meat Masters",
    items: "Meat",
    scheduled: "Today, 2:00 PM",
    status: "delayed",
  },
  {
    supplier: "Bakery Supplies",
    items: "Bakery",
    scheduled: "Tomorrow, 6:00 AM",
    status: "pending",
  },
];

const shrinkageData = [
  { name: "Expired", value: 45 },
  { name: "Damaged", value: 25 },
  { name: "Theft", value: 20 },
  { name: "Administrative", value: 10 },
];

export function SupermarketDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DataCard
          title="Today's Sales"
          value="$24,530"
          description="↑ 12% from yesterday"
          icon={<ShoppingCart className="h-4 w-4" />}
        />
        <DataCard
          title="Transactions"
          value="1,245"
          description="↑ 5% from yesterday"
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <DataCard
          title="Inventory Items"
          value="8,532"
          description="124 low stock"
          icon={<Package className="h-4 w-4" />}
        />
        <DataCard
          title="Deliveries Today"
          value="8"
          description="2 delayed"
          icon={<Truck className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Department Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Department</TableHead>
                  <TableHead>Sales</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Progress</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departmentPerformance.map((dept, index) => (
                  <TableRow key={index}>
                    <TableCell>{dept.name}</TableCell>
                    <TableCell>${dept.sales.toLocaleString()}</TableCell>
                    <TableCell>${dept.target.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex w-full items-center gap-2">
                        <Progress
                          value={(dept.sales / dept.target) * 100}
                          className="h-2"
                        />
                        <span className="text-xs text-muted-foreground">
                          {Math.round((dept.sales / dept.target) * 100)}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <InteractivePieChart
          title="Category Sales Breakdown"
          description="Distribution of sales by department"
          data={categorySales}
          isLoading={false}
          error={null}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <InteractiveAreaChart
          title="Promotion Effectiveness"
          description="Sales before, during, and after promotions"
          data={promotionEffectiveness}
          dataKeys={["before", "during", "after"]}
          timeRangeOptions={[
            { value: "1m", label: "Last month", days: 30 },
            { value: "3m", label: "Last 3 months", days: 90 },
          ]}
          isLoading={false}
          error={null}
        />

        <InteractivePieChart
          title="Shrinkage Reports"
          description="Sources of inventory loss"
          data={shrinkageData}
          isLoading={false}
          error={null}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Perishable Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Expiring In</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {perishableInventory.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.expiring}</TableCell>
                    <TableCell>{item.quantity} units</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          item.status === "critical"
                            ? "destructive"
                            : item.status === "warning"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {item.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Supplier Delivery Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Scheduled</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {supplierDeliveries.map((delivery, index) => (
                  <TableRow key={index}>
                    <TableCell>{delivery.supplier}</TableCell>
                    <TableCell>{delivery.items}</TableCell>
                    <TableCell>{delivery.scheduled}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          delivery.status === "on-time"
                            ? "default"
                            : delivery.status === "delayed"
                              ? "destructive"
                              : "outline"
                        }
                      >
                        {delivery.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
