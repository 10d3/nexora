"use client";

// import { useDashboard } from "@/components/dashboard-provider";
import { useProductStats } from "@/hooks/use-products";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { DataCard } from "@/components/ui/data-card";
import { Package, AlertTriangle, TrendingUp, DollarSign } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
// import { InteractivePieChart } from "@/components/charts/interactive-pie-chart";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboard } from "@/context/dashboard-provider";
import { DataCard } from "./data-card";
import { InteractivePieChart } from "@/components/chart/interactive-pie";

export function ProductsOverview() {
  const { businessType } = useDashboard();
  const { data: productStats, isLoading, error } = useProductStats();

  // Format data for pie chart
  const categoryData =
    productStats?.productsByCategory?.map((category) => ({
      name: category.name,
      value: category.value,
    })) || [];

  return (
    <main className="flex-1 overflow-auto p-4 sm:p-6">
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <DataCard
            title="Total Products"
            value={productStats?.totalProducts?.toString() || "0"}
            description={`${productStats?.lowStock || 0} low stock items`}
            icon={<Package className="h-4 w-4" />}
          />
          <DataCard
            title="Low Stock Items"
            value={productStats?.lowStock?.toString() || "0"}
            description="Below threshold"
            icon={<AlertTriangle className="h-4 w-4" />}
          />
          <DataCard
            title="Inventory Value"
            value={`$${productStats?.inventoryValue?.toLocaleString() || "0"}`}
            description="Total value"
            icon={<DollarSign className="h-4 w-4" />}
          />
          <DataCard
            title="Avg. Product Price"
            value={`$${productStats?.averageProductPrice?.toFixed(2) || "0.00"}`}
            description="Per unit"
            icon={<TrendingUp className="h-4 w-4" />}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Products</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  ))}
                </div>
              ) : error ? (
                <p className="text-center text-destructive">
                  Error loading product data
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Sales</TableHead>
                      <TableHead>Revenue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productStats?.topSellingProducts?.map((product, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {product.name}
                        </TableCell>
                        <TableCell>{product.sales}</TableCell>
                        <TableCell>
                          ${product.revenue.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    )) || (
                      <TableRow>
                        <TableCell
                          colSpan={3}
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

          <InteractivePieChart
            title="Products by Category"
            description="Distribution of products across categories"
            data={categoryData}
            isLoading={isLoading}
            error={error}
          />
        </div>

        {businessType === "PHARMACIE" &&
          (productStats?.expiringSoon as number) > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Expiring Medications</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Medication</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Expires In</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* This would need actual data from the API */}
                    <TableRow>
                      <TableCell>Amoxicillin 500mg</TableCell>
                      <TableCell>45</TableCell>
                      <TableCell>15 days</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-destructive/20 text-destructive">
                          Reorder
                        </span>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
      </div>
    </main>
  );
}
