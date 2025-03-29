"use client";

import {
  Building2,
  Users,
  Calendar,
  TrendingUp,
  Clock,
  Bed,
} from "lucide-react";
// import { DataCard } from "@/components/ui/data-card";
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
import { Progress } from "@/components/ui/progress";
import { DataCard } from "../shared/data-card";
import { InteractiveAreaChart } from "@/components/chart/area-chart";
import { InteractivePieChart } from "@/components/chart/interactive-pie";
// import { InteractiveAreaChart } from "@/components/charts/area-chart";
// import { InteractivePieChart } from "@/components/charts/interactive-pie-chart";

// Sample data
const occupancyData = [
  { date: "2023-06-24", rate: 75 },
  { date: "2023-06-25", rate: 68 },
  { date: "2023-06-26", rate: 72 },
  { date: "2023-06-27", rate: 80 },
  { date: "2023-06-28", rate: 92 },
  { date: "2023-06-29", rate: 95 },
  { date: "2023-06-30", rate: 85 },
];

const revenueData = [
  { date: "2023-06-24", revenue: 2500 },
  { date: "2023-06-25", revenue: 2300 },
  { date: "2023-06-26", revenue: 2400 },
  { date: "2023-06-27", revenue: 2700 },
  { date: "2023-06-28", revenue: 3200 },
  { date: "2023-06-29", revenue: 3500 },
  { date: "2023-06-30", revenue: 3000 },
];

const stayLengthData = [
  { name: "1 Night", value: 35 },
  { name: "2 Nights", value: 25 },
  { name: "3 Nights", value: 20 },
  { name: "4 Nights", value: 10 },
  { name: "5+ Nights", value: 10 },
];

// const roomTypeData = [
//   { name: "Standard", value: 20, available: 15 },
//   { name: "Deluxe", value: 15, available: 8 },
//   { name: "Suite", value: 10, available: 3 },
//   { name: "Executive", value: 5, available: 2 },
// ];

const checkInsData = [
  {
    room: "101",
    guest: "John Smith",
    arrival: "2:00 PM",
    status: "confirmed",
    type: "Standard",
  },
  {
    room: "205",
    guest: "Sarah Johnson",
    arrival: "3:30 PM",
    status: "confirmed",
    type: "Deluxe",
  },
  {
    room: "310",
    guest: "Michael Brown",
    arrival: "4:15 PM",
    status: "pending",
    type: "Suite",
  },
];

const checkOutsData = [
  {
    room: "102",
    guest: "Emma Wilson",
    departure: "11:00 AM",
    status: "completed",
    type: "Standard",
  },
  {
    room: "207",
    guest: "David Lee",
    departure: "12:00 PM",
    status: "pending",
    type: "Deluxe",
  },
  {
    room: "315",
    guest: "Lisa Chen",
    departure: "10:30 AM",
    status: "completed",
    type: "Suite",
  },
];

const housekeepingData = [
  {
    room: "101",
    status: "cleaned",
    inspector: "Maria",
    notes: "Ready for check-in",
  },
  {
    room: "102",
    status: "in-progress",
    inspector: "Carlos",
    notes: "Needs fresh towels",
  },
  {
    room: "103",
    status: "pending",
    inspector: "-",
    notes: "Checkout at 11 AM",
  },
  {
    room: "104",
    status: "cleaned",
    inspector: "Maria",
    notes: "Ready for check-in",
  },
  {
    room: "105",
    status: "maintenance",
    inspector: "John",
    notes: "Plumbing issue",
  },
];

export function HotelDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <DataCard
          title="Room Occupancy"
          value="85%"
          description="↑ 5% from last week"
          icon={<Building2 className="h-4 w-4" />}
        />
        <DataCard
          title="Current Guests"
          value="124"
          description="42 rooms occupied"
          icon={<Users className="h-4 w-4" />}
        />
        <DataCard
          title="Check-ins Today"
          value="15"
          description="3 pending"
          icon={<Calendar className="h-4 w-4" />}
        />
        <DataCard
          title="Check-outs Today"
          value="12"
          description="5 completed"
          icon={<Clock className="h-4 w-4" />}
        />
        <DataCard
          title="RevPAR"
          value="$185"
          description="↑ 12% from last month"
          icon={<TrendingUp className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <InteractiveAreaChart
          title="Room Occupancy Rate"
          description="Daily occupancy percentage"
          data={occupancyData}
          dataKeys={["rate"]}
          timeRangeOptions={[
            { value: "7d", label: "Last 7 days", days: 7 },
            { value: "30d", label: "Last 30 days", days: 30 },
          ]}
          isLoading={false}
          error={null}
        />

        <InteractiveAreaChart
          title="Revenue per Available Room"
          description="Daily RevPAR in USD"
          data={revenueData}
          dataKeys={["revenue"]}
          timeRangeOptions={[
            { value: "7d", label: "Last 7 days", days: 7 },
            { value: "30d", label: "Last 30 days", days: 30 },
          ]}
          isLoading={false}
          error={null}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <InteractivePieChart
          title="Average Length of Stay"
          description="Distribution by nights stayed"
          data={stayLengthData}
          isLoading={false}
          error={null}
        />

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Room Type Availability</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bed className="h-4 w-4" />
                  <span>Standard Rooms</span>
                </div>
                <span className="text-sm font-medium">15/20 Available</span>
              </div>
              <Progress value={75} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bed className="h-4 w-4" />
                  <span>Deluxe Rooms</span>
                </div>
                <span className="text-sm font-medium">8/15 Available</span>
              </div>
              <Progress value={53} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bed className="h-4 w-4" />
                  <span>Suites</span>
                </div>
                <span className="text-sm font-medium">3/10 Available</span>
              </div>
              <Progress value={30} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bed className="h-4 w-4" />
                  <span>Executive Suites</span>
                </div>
                <span className="text-sm font-medium">2/5 Available</span>
              </div>
              <Progress value={40} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Check-ins & Check-outs</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="checkins">
            <TabsList>
              <TabsTrigger value="checkins">Today&apos;`s Check-ins</TabsTrigger>
              <TabsTrigger value="checkouts">Today&apos;`s Check-outs</TabsTrigger>
            </TabsList>
            <TabsContent value="checkins" className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Room</TableHead>
                    <TableHead>Guest</TableHead>
                    <TableHead>Arrival Time</TableHead>
                    <TableHead>Room Type</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {checkInsData.map((checkin, index) => (
                    <TableRow key={index}>
                      <TableCell>{checkin.room}</TableCell>
                      <TableCell>{checkin.guest}</TableCell>
                      <TableCell>{checkin.arrival}</TableCell>
                      <TableCell>{checkin.type}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            checkin.status === "confirmed"
                              ? "default"
                              : "outline"
                          }
                        >
                          {checkin.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
            <TabsContent value="checkouts" className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Room</TableHead>
                    <TableHead>Guest</TableHead>
                    <TableHead>Departure Time</TableHead>
                    <TableHead>Room Type</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {checkOutsData.map((checkout, index) => (
                    <TableRow key={index}>
                      <TableCell>{checkout.room}</TableCell>
                      <TableCell>{checkout.guest}</TableCell>
                      <TableCell>{checkout.departure}</TableCell>
                      <TableCell>{checkout.type}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            checkout.status === "completed"
                              ? "default"
                              : "outline"
                          }
                        >
                          {checkout.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Housekeeping Status</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Room</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Inspector</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {housekeepingData.map((room, index) => (
                <TableRow key={index}>
                  <TableCell>{room.room}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        room.status === "cleaned"
                          ? "default"
                          : room.status === "in-progress"
                            ? "secondary"
                            : room.status === "maintenance"
                              ? "destructive"
                              : "outline"
                      }
                    >
                      {room.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{room.inspector}</TableCell>
                  <TableCell>{room.notes}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
