"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart4, Package, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDashboard } from "@/context/dashboard-provider";

export default function ReportsPage() {
  const router = useRouter();
  const { tenantId } = useDashboard();

  const handleTabChange = (value: string) => {
    router.push(`/pos/${tenantId}/reports/${value}`);
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Reports</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => router.push(`/pos/${tenantId}/reports/sales`)}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">Sales Reports</CardTitle>
            <BarChart4 className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardDescription>
              View sales performance, trends, and revenue analysis
            </CardDescription>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => router.push(`/pos/${tenantId}/reports/inventory`)}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">
              Inventory Reports
            </CardTitle>
            <Package className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardDescription>
              Track stock levels, product movement, and inventory valuation
            </CardDescription>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => router.push(`/pos/${tenantId}/reports/customers`)}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">
              Customer Analytics
            </CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardDescription>
              Analyze customer behavior, demographics, and purchase patterns
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      <div className="bg-card rounded-lg border shadow-sm">
        <Tabs
          defaultValue="overview"
          className="w-full"
          onValueChange={handleTabChange}
        >
          <div className="border-b px-4">
            <TabsList className="bg-transparent h-12">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-background rounded-none border-b-2 border-b-transparent data-[state=active]:border-b-primary data-[state=active]:shadow-none h-12"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="sales"
                className="data-[state=active]:bg-background rounded-none border-b-2 border-b-transparent data-[state=active]:border-b-primary data-[state=active]:shadow-none h-12"
              >
                Sales
              </TabsTrigger>
              <TabsTrigger
                value="inventory"
                className="data-[state=active]:bg-background rounded-none border-b-2 border-b-transparent data-[state=active]:border-b-primary data-[state=active]:shadow-none h-12"
              >
                Inventory
              </TabsTrigger>
              <TabsTrigger
                value="customers"
                className="data-[state=active]:bg-background rounded-none border-b-2 border-b-transparent data-[state=active]:border-b-primary data-[state=active]:shadow-none h-12"
              >
                Customers
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="overview" className="p-6">
            <h2 className="text-2xl font-bold mb-4">Reports Overview</h2>
            <p className="text-muted-foreground mb-4">
              Select a report category above or use the quick access cards to
              view detailed reports.
            </p>
          </TabsContent>
          <TabsContent value="sales" className="p-6">
            <p className="text-muted-foreground">
              Redirecting to sales reports...
            </p>
          </TabsContent>
          <TabsContent value="inventory" className="p-6">
            <p className="text-muted-foreground">
              Redirecting to inventory reports...
            </p>
          </TabsContent>
          <TabsContent value="customers" className="p-6">
            <p className="text-muted-foreground">
              Redirecting to customer reports...
            </p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
