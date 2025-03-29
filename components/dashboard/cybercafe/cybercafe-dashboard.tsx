"use client";

import { Monitor, Users, Clock, TrendingUp, Wifi, Printer } from "lucide-react";
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
import { DataCard } from "../shared/data-card";
import { InteractivePieChart } from "@/components/chart/interactive-pie";
import { InteractiveAreaChart } from "@/components/chart/area-chart";

// Sample data
const computerUsage = [
  {
    id: "PC-01",
    user: "John Smith",
    startTime: "9:30 AM",
    duration: "45 min",
    status: "active",
  },
  {
    id: "PC-02",
    user: "Sarah Johnson",
    startTime: "10:15 AM",
    duration: "30 min",
    status: "active",
  },
  {
    id: "PC-03",
    user: "-",
    startTime: "-",
    duration: "-",
    status: "available",
  },
  {
    id: "PC-04",
    user: "Michael Brown",
    startTime: "9:00 AM",
    duration: "120 min",
    status: "active",
  },
  {
    id: "PC-05",
    user: "-",
    startTime: "-",
    duration: "-",
    status: "maintenance",
  },
];

const serviceUsage = [
  { name: "Printing", value: 45 },
  { name: "Scanning", value: 25 },
  { name: "Gaming", value: 15 },
  { name: "Internet", value: 10 },
  { name: "Office Apps", value: 5 },
];

const hourlyUsageData = [
  { date: "2023-06-30 08:00", usage: 20 },
  { date: "2023-06-30 09:00", usage: 35 },
  { date: "2023-06-30 10:00", usage: 50 },
  { date: "2023-06-30 11:00", usage: 65 },
  { date: "2023-06-30 12:00", usage: 80 },
  { date: "2023-06-30 13:00", usage: 90 },
  { date: "2023-06-30 14:00", usage: 85 },
  { date: "2023-06-30 15:00", usage: 75 },
  { date: "2023-06-30 16:00", usage: 60 },
  { date: "2023-06-30 17:00", usage: 70 },
  { date: "2023-06-30 18:00", usage: 85 },
  { date: "2023-06-30 19:00", usage: 95 },
];

const bandwidthData = [
  { date: "2023-06-30 08:00", download: 25, upload: 10 },
  { date: "2023-06-30 09:00", download: 40, upload: 15 },
  { date: "2023-06-30 10:00", download: 55, upload: 20 },
  { date: "2023-06-30 11:00", download: 70, upload: 25 },
  { date: "2023-06-30 12:00", download: 85, upload: 30 },
  { date: "2023-06-30 13:00", download: 95, upload: 35 },
  { date: "2023-06-30 14:00", download: 90, upload: 30 },
  { date: "2023-06-30 15:00", download: 80, upload: 25 },
  { date: "2023-06-30 16:00", download: 65, upload: 20 },
  { date: "2023-06-30 17:00", download: 75, upload: 25 },
  { date: "2023-06-30 18:00", download: 90, upload: 30 },
  { date: "2023-06-30 19:00", download: 100, upload: 35 },
];

const membershipData = [
  {
    name: "John Smith",
    type: "Premium",
    expires: "Dec 31, 2023",
    usage: "45 hours",
    status: "active",
  },
  {
    name: "Sarah Johnson",
    type: "Standard",
    expires: "Nov 15, 2023",
    usage: "30 hours",
    status: "active",
  },
  {
    name: "Michael Brown",
    type: "Premium",
    expires: "Jan 10, 2024",
    usage: "60 hours",
    status: "active",
  },
  {
    name: "Emma Wilson",
    type: "Standard",
    expires: "Oct 5, 2023",
    usage: "15 hours",
    status: "expiring",
  },
];

export function CybercafeDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DataCard
          title="Active Computers"
          value="12/20"
          description="60% utilization"
          icon={<Monitor className="h-4 w-4" />}
        />
        <DataCard
          title="Current Users"
          value="15"
          description="3 members, 12 walk-ins"
          icon={<Users className="h-4 w-4" />}
        />
        <DataCard
          title="Average Session"
          value="45 min"
          description="↑ 5 min from yesterday"
          icon={<Clock className="h-4 w-4" />}
        />
        <DataCard
          title="Today's Revenue"
          value="$345"
          description="↑ 12% from yesterday"
          icon={<TrendingUp className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Computer Usage Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Computer ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Start Time</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {computerUsage.map((computer, index) => (
                  <TableRow key={index}>
                    <TableCell>{computer.id}</TableCell>
                    <TableCell>{computer.user}</TableCell>
                    <TableCell>{computer.startTime}</TableCell>
                    <TableCell>{computer.duration}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          computer.status === "active"
                            ? "default"
                            : computer.status === "available"
                              ? "outline"
                              : "destructive"
                        }
                      >
                        {computer.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <InteractivePieChart
          title="Service Usage"
          description="Distribution of service utilization"
          data={serviceUsage}
          isLoading={false}
          error={null}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <InteractiveAreaChart
          title="Peak Usage Hours"
          description="Computer usage throughout the day"
          data={hourlyUsageData}
          dataKeys={["usage"]}
          timeRangeOptions={[
            { value: "1d", label: "Today", days: 1 },
            { value: "7d", label: "Last 7 days", days: 7 },
          ]}
          isLoading={false}
          error={null}
        />

        <InteractiveAreaChart
          title="Internet Bandwidth Usage"
          description="Download and upload traffic"
          data={bandwidthData}
          dataKeys={["download", "upload"]}
          timeRangeOptions={[
            { value: "1d", label: "Today", days: 1 },
            { value: "7d", label: "Last 7 days", days: 7 },
          ]}
          isLoading={false}
          error={null}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Membership Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {membershipData.map((member, index) => (
                  <TableRow key={index}>
                    <TableCell>{member.name}</TableCell>
                    <TableCell>{member.type}</TableCell>
                    <TableCell>{member.expires}</TableCell>
                    <TableCell>{member.usage}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          member.status === "active" ? "default" : "secondary"
                        }
                      >
                        {member.status}
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
            <CardTitle>Time-based Billing</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="hourly">
              <TabsList>
                <TabsTrigger value="hourly">Hourly</TabsTrigger>
                <TabsTrigger value="packages">Packages</TabsTrigger>
                <TabsTrigger value="membership">Membership</TabsTrigger>
              </TabsList>
              <TabsContent value="hourly" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Monitor className="h-4 w-4" />
                        <span>Standard Computer</span>
                      </div>
                      <span className="font-medium">$5/hour</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Monitor className="h-4 w-4" />
                        <span>Gaming Computer</span>
                      </div>
                      <span className="font-medium">$8/hour</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Printer className="h-4 w-4" />
                        <span>Printing (B&W)</span>
                      </div>
                      <span className="font-medium">$0.10/page</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Printer className="h-4 w-4" />
                        <span>Printing (Color)</span>
                      </div>
                      <span className="font-medium">$0.25/page</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Wifi className="h-4 w-4" />
                        <span>Wi-Fi Only</span>
                      </div>
                      <span className="font-medium">$2/hour</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>Late Night (10PM-6AM)</span>
                      </div>
                      <span className="font-medium">$3/hour</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>Student Discount</span>
                      </div>
                      <span className="font-medium">20% off</span>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="packages">
                <p className="text-sm text-muted-foreground">
                  Package pricing will appear here.
                </p>
              </TabsContent>
              <TabsContent value="membership">
                <p className="text-sm text-muted-foreground">
                  Membership pricing will appear here.
                </p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
