"use client";

import { Users, Calendar, Clock, UserCheck } from "lucide-react";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DataCard } from "../shared/data-card";
import { InteractivePieChart } from "@/components/chart/interactive-pie";
import { InteractiveAreaChart } from "@/components/chart/area-chart";

// Sample data
const servicePopularity = [
  { name: "Haircut", value: 35 },
  { name: "Color", value: 25 },
  { name: "Manicure", value: 20 },
  { name: "Facial", value: 15 },
  { name: "Massage", value: 5 },
];

const retentionData = [
  { date: "2023-01-01", rate: 75 },
  { date: "2023-02-01", rate: 78 },
  { date: "2023-03-01", rate: 80 },
  { date: "2023-04-01", rate: 82 },
  { date: "2023-05-01", rate: 85 },
  { date: "2023-06-01", rate: 88 },
];

const upcomingAppointments = [
  {
    time: "10:00 AM",
    client: "Emma Wilson",
    service: "Haircut & Style",
    stylist: "John",
    duration: "45 min",
  },
  {
    time: "11:00 AM",
    client: "Michael Brown",
    service: "Color & Cut",
    stylist: "Sarah",
    duration: "90 min",
  },
  {
    time: "12:30 PM",
    client: "Lisa Chen",
    service: "Manicure",
    stylist: "Amy",
    duration: "30 min",
  },
  {
    time: "1:30 PM",
    client: "David Lee",
    service: "Facial",
    stylist: "Mark",
    duration: "60 min",
  },
];

const staffAvailability = [
  {
    name: "John",
    role: "Stylist",
    status: "available",
    appointments: 3,
    nextAvailable: "10:00 AM",
  },
  {
    name: "Sarah",
    role: "Colorist",
    status: "busy",
    appointments: 5,
    nextAvailable: "2:30 PM",
  },
  {
    name: "Amy",
    role: "Nail Tech",
    status: "available",
    appointments: 2,
    nextAvailable: "11:30 AM",
  },
  {
    name: "Mark",
    role: "Esthetician",
    status: "break",
    appointments: 4,
    nextAvailable: "1:00 PM",
  },
];

export function SalonDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DataCard
          title="Today's Appointments"
          value="24"
          description="↑ 4 from yesterday"
          icon={<Calendar className="h-4 w-4" />}
        />
        <DataCard
          title="Available Staff"
          value="5/8"
          description="3 currently with clients"
          icon={<Users className="h-4 w-4" />}
        />
        <DataCard
          title="Customer Retention"
          value="85%"
          description="↑ 3% from last month"
          icon={<UserCheck className="h-4 w-4" />}
        />
        <DataCard
          title="Average Service Time"
          value="45 min"
          description="On target"
          icon={<Clock className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Appointment Schedule</CardTitle>
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
                      <TableHead>Client</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Stylist</TableHead>
                      <TableHead>Duration</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {upcomingAppointments.map((appointment, index) => (
                      <TableRow key={index}>
                        <TableCell>{appointment.time}</TableCell>
                        <TableCell>{appointment.client}</TableCell>
                        <TableCell>{appointment.service}</TableCell>
                        <TableCell>{appointment.stylist}</TableCell>
                        <TableCell>{appointment.duration}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
              <TabsContent value="tomorrow">
                <p className="text-sm text-muted-foreground">
                  Appointments for tomorrow will appear here.
                </p>
              </TabsContent>
              <TabsContent value="week">
                <p className="text-sm text-muted-foreground">
                  Appointments for this week will appear here.
                </p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Staff Availability</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Appointments</TableHead>
                  <TableHead>Next Available</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staffAvailability.map((staff, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{staff.name[0]}</AvatarFallback>
                        </Avatar>
                        {staff.name}
                      </div>
                    </TableCell>
                    <TableCell>{staff.role}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          staff.status === "available"
                            ? "default"
                            : staff.status === "busy"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {staff.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{staff.appointments} today</TableCell>
                    <TableCell>{staff.nextAvailable}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <InteractivePieChart
          title="Service Popularity"
          description="Distribution of service bookings"
          data={servicePopularity}
          isLoading={false}
          error={null}
        />

        <InteractiveAreaChart
          title="Customer Retention Rate"
          description="Monthly retention percentage"
          data={retentionData}
          dataKeys={["rate"]}
          timeRangeOptions={[
            { value: "6m", label: "Last 6 months", days: 180 },
            { value: "1y", label: "Last year", days: 365 },
          ]}
          isLoading={false}
          error={null}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Service Utilization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Haircut Stations</span>
                <span className="text-sm font-medium">4/5 in use</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted">
                <div className="h-full w-4/5 rounded-full bg-primary"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Color Stations</span>
                <span className="text-sm font-medium">3/3 in use</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted">
                <div className="h-full w-full rounded-full bg-primary"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Manicure Stations</span>
                <span className="text-sm font-medium">2/4 in use</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted">
                <div className="h-full w-1/2 rounded-full bg-primary"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Treatment Rooms</span>
                <span className="text-sm font-medium">1/2 in use</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted">
                <div className="h-full w-1/2 rounded-full bg-primary"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
