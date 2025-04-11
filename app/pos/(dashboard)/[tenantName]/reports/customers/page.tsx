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
import { Users, TrendingUp, DollarSign, UserPlus } from "lucide-react";

// Placeholder chart component - in a real app, you would use a proper chart library
const CustomerChart = () => (
  <div className="h-[300px] w-full rounded-md border border-dashed flex items-center justify-center">
    <p className="text-muted-foreground">Customer Analytics Visualization</p>
  </div>
);

export default function CustomerAnalyticsPage() {
  const { dateRange, setDateRange } = useDashboard();
  const [activeTab, setActiveTab] = useState("overview");

  // This would be fetched from an API in a real application
  const customerData = {
    totalCustomers: 1245,
    newCustomers: 78,
    averageSpend: "$156.32",
    retentionRate: "68%",
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-bold">Customer Analytics</h1>
        <DatePickerWithRange
          dateRange={dateRange}
          setDateRange={setDateRange}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Customers
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customerData.totalCustomers}</div>
            <p className="text-xs text-muted-foreground">
              Registered customers
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              New Customers
            </CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customerData.newCustomers}</div>
            <p className="text-xs text-muted-foreground">
              {dateRange.from?.toLocaleDateString()} - {dateRange.to?.toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Average Spend
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customerData.averageSpend}</div>
            <p className="text-xs text-muted-foreground">
              Per customer
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Retention Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customerData.retentionRate}</div>
            <p className="text-xs text-muted-foreground">
              Returning customers
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Trends</CardTitle>
          <CardDescription>
            View your customer acquisition and retention metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="segments">Segments</TabsTrigger>
              <TabsTrigger value="lifetime">Lifetime Value</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-4">
              <CustomerChart />
            </TabsContent>
            <TabsContent value="segments" className="space-y-4">
              <CustomerChart />
            </TabsContent>
            <TabsContent value="lifetime" className="space-y-4">
              <CustomerChart />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Customers</CardTitle>
          <CardDescription>
            Your highest value customers in the selected period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="min-w-full divide-y divide-border">
              <thead>
                <tr className="bg-muted/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Orders</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Spent</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Last Purchase</th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {/* Placeholder data - would be dynamic in a real app */}
                <tr>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">John Doe</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">24</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">$3,450.00</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">2 days ago</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">Jane Smith</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">18</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">$2,890.00</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">1 week ago</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">Robert Johnson</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">15</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">$2,560.00</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">3 days ago</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Customer Segments</CardTitle>
          <CardDescription>
            Distribution of customers by segment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="min-w-full divide-y divide-border">
              <thead>
                <tr className="bg-muted/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Segment</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Customers</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Avg. Spend</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Retention</th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {/* Placeholder data - would be dynamic in a real app */}
                <tr>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">VIP</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">124</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">$450.00</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">92%</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">Regular</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">568</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">$180.00</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">75%</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">Occasional</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">553</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">$85.00</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">45%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}