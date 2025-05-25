/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Utensils, Users, Clock, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useRestaurantStats } from "@/hooks/use-restaurant";
import { Skeleton } from "@/components/ui/skeleton";
import { DataCard } from "../shared/data-card";
import { InteractivePieChart } from "@/components/chart/interactive-pie";
import { InteractiveAreaChart } from "@/components/chart/area-chart";
// import { InteractivePieChart } from "@/components/charts/interactive-pie-chart";
// import { InteractiveAreaChart } from "@/components/charts/area-chart";

export function RestaurantDashboard() {
  const { data: stats, isLoading, error } = useRestaurantStats();

  console.log("stats data : ", stats); // Add this line to log the data t

  // Format data for pie chart
  const menuItemData =
    stats?.menuItemPopularity?.map((item: any) => ({
      name: item.name,
      value: item.value,
    })) || [];

  // Mock data for service time chart - would be replaced with real data
  const serviceTimeData = [
    { date: "2024-06-24", time: 42 },
    { date: "2024-06-25", time: 38 },
    { date: "2024-06-26", time: 45 },
    { date: "2024-06-27", time: 40 },
    { date: "2024-06-28", time: 55 },
    { date: "2024-06-29", time: 60 },
    { date: "2024-06-30", time: 50 },
  ];

  // Mock data for turnover rate chart - would be replaced with real data
  const turnoverData = [
    { date: "2024-06-24", rate: 4.2 },
    { date: "2024-06-25", rate: 3.8 },
    { date: "2024-06-26", rate: 4.5 },
    { date: "2024-06-27", rate: 4.0 },
    { date: "2024-06-28", rate: 5.5 },
    { date: "2024-06-29", rate: 6.0 },
    { date: "2024-06-30", rate: 5.0 },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20 mb-1" />
                <Skeleton className="h-4 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[200px] w-full rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[300px] w-full rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-60 mb-4" />
            <Skeleton className="h-[200px] w-full rounded-lg" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <h3 className="text-lg font-semibold text-destructive">
          Error loading restaurant data
        </h3>
        <p className="text-muted-foreground">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DataCard
          title="Tables Occupied"
          value={`${stats?.tablesByStatus?.find(t => t.name === "Occupied")?.value || 0}/${stats?.tablesByStatus?.reduce((sum, t) => sum + t.value, 0) || 0}`}
          description={`${Math.round(((stats?.tablesByStatus?.find(t => t.name === "Occupied")?.value || 0) / (stats?.tablesByStatus?.reduce((sum, t) => sum + t.value, 0) || 1)) * 100)}% occupancy`}
          icon={<Utensils className="h-4 w-4" />}
        />
        <DataCard
          title="Current Guests"
          value="45"
          description="15 parties"
          icon={<Users className="h-4 w-4" />}
        />
        <DataCard
          title="Avg. Service Time"
          value={`${Math.round(stats?.avgServiceTime as number)} min`}
          description={stats?.serviceTimeTrend || "No change from average"}
          icon={<Clock className="h-4 w-4" />}
        />
        <DataCard
          title="Reservations Today"
          value={stats?.totalReservations?.toString() || "0"}
          description={stats?.reservationsTrend || "No change from yesterday"}
          icon={<Calendar className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Table Management</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Table</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Guests</TableHead>
                  <TableHead>Server</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Orders</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          i % 3 === 0
                            ? "default"
                            : i % 3 === 1
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {i % 3 === 0
                          ? "occupied"
                          : i % 3 === 1
                            ? "reserved"
                            : "available"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {i % 3 === 2 ? 0 : Math.floor(Math.random() * 4) + 2}
                    </TableCell>
                    <TableCell>
                      {i % 3 === 2
                        ? "-"
                        : ["John", "Sarah", "Mike", "Lisa", "David"][i]}
                    </TableCell>
                    <TableCell>
                      {i % 3 === 2
                        ? "-"
                        : i % 3 === 1
                          ? "7:30 PM"
                          : `${Math.floor(Math.random() * 45) + 15} min`}
                    </TableCell>
                    <TableCell>
                      {i % 3 === 2
                        ? "-"
                        : i % 3 === 0
                          ? "Complete"
                          : "In Progress"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Kitchen Order Queue</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Table</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(3)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>{101 + i}</TableCell>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell>
                      {
                        [
                          "Steak (medium), Pasta",
                          "Salad, Soup, Chicken",
                          "Pizza, Garlic Bread",
                        ][i]
                      }
                    </TableCell>
                    <TableCell>{`${(i + 1) * 5} min ago`}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          i === 0
                            ? "default"
                            : i === 1
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {["cooking", "pending", "ready"][i]}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <InteractivePieChart
          title="Menu Item Popularity"
          description="Most popular items ordered"
          data={menuItemData}
          isLoading={isLoading}
          error={error}
        />

        <InteractiveAreaChart
          title="Average Service Time"
          description="Time from order to delivery"
          data={serviceTimeData}
          dataKeys={["time"]}
          timeRangeOptions={[
            { value: "7d", label: "Last 7 days", days: 7 },
            { value: "30d", label: "Last 30 days", days: 30 },
          ]}
          isLoading={false}
          error={null}
        />

        <InteractiveAreaChart
          title="Table Turnover Rate"
          description="Tables served per hour"
          data={turnoverData}
          dataKeys={["rate"]}
          timeRangeOptions={[
            { value: "7d", label: "Last 7 days", days: 7 },
            { value: "30d", label: "Last 30 days", days: 30 },
          ]}
          isLoading={false}
          error={null}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reservation Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="today">
            <TabsList>
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="tomorrow">Tomorrow</TabsTrigger>
              <TabsTrigger value="week">This Week</TabsTrigger>
            </TabsList>
            <TabsContent value="today" className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Guests</TableHead>
                    <TableHead>Table</TableHead>
                    <TableHead>Special Requests</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats?.upcomingReservations?.map(
                    (reservation: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell>{reservation.time}</TableCell>
                        <TableCell>{reservation.name}</TableCell>
                        <TableCell>{reservation.guests}</TableCell>
                        <TableCell>{reservation.table}</TableCell>
                        <TableCell>
                          {index === 1
                            ? "Birthday celebration"
                            : index === 0
                              ? "Window seat"
                              : "None"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              reservation.status === "confirmed"
                                ? "default"
                                : "outline"
                            }
                          >
                            {reservation.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            </TabsContent>
            <TabsContent value="tomorrow">
              <p className="text-sm text-muted-foreground">
                Reservations for tomorrow will appear here.
              </p>
            </TabsContent>
            <TabsContent value="week">
              <p className="text-sm text-muted-foreground">
                Reservations for this week will appear here.
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
