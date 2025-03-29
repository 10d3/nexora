"use client";

import { HardHat, Truck, CloudSun, Clock } from "lucide-react";
// import { DataCard } from "@/components/ui/data-card";
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
import { InteractiveAreaChart } from "@/components/chart/area-chart";
// import { InteractiveAreaChart } from "@/components/charts/area-chart";

// Sample data
const projectStatus = [
  {
    name: "Downtown Office",
    progress: 75,
    deadline: "Dec 15, 2023",
    status: "on-track",
  },
  {
    name: "Riverside Apartments",
    progress: 45,
    deadline: "Feb 28, 2024",
    status: "delayed",
  },
  {
    name: "Shopping Mall",
    progress: 90,
    deadline: "Nov 30, 2023",
    status: "on-track",
  },
  {
    name: "Highway Bridge",
    progress: 30,
    deadline: "Apr 15, 2024",
    status: "at-risk",
  },
];

const equipmentUtilization = [
  {
    name: "Excavators",
    utilization: 85,
    maintenance: "Nov 15, 2023",
    status: "operational",
  },
  {
    name: "Bulldozers",
    utilization: 70,
    maintenance: "Nov 5, 2023",
    status: "operational",
  },
  {
    name: "Cranes",
    utilization: 60,
    maintenance: "Oct 30, 2023",
    status: "maintenance",
  },
  {
    name: "Concrete Mixers",
    utilization: 90,
    maintenance: "Dec 10, 2023",
    status: "operational",
  },
];

const materialInventory = [
  {
    name: "Cement",
    quantity: "120 tons",
    reorder: "30 tons",
    status: "adequate",
  },
  {
    name: "Steel Rebar",
    quantity: "45 tons",
    reorder: "15 tons",
    status: "low",
  },
  {
    name: "Bricks",
    quantity: "8,500 units",
    reorder: "2,000 units",
    status: "adequate",
  },
  {
    name: "Lumber",
    quantity: "350 boards",
    reorder: "100 boards",
    status: "low",
  },
];

const laborAllocation = [
  {
    date: "2023-06-01",
    carpenters: 12,
    masons: 8,
    electricians: 6,
    plumbers: 4,
  },
  {
    date: "2023-06-08",
    carpenters: 8,
    masons: 10,
    electricians: 4,
    plumbers: 6,
  },
  {
    date: "2023-06-15",
    carpenters: 15,
    masons: 12,
    electricians: 10,
    plumbers: 8,
  },
  {
    date: "2023-06-22",
    carpenters: 6,
    masons: 15,
    electricians: 3,
    plumbers: 2,
  },
];

const weatherForecast = [
  {
    day: "Today",
    condition: "Sunny",
    temp: "75°F",
    precipitation: "0%",
    wind: "5 mph",
  },
  {
    day: "Tomorrow",
    condition: "Partly Cloudy",
    temp: "72°F",
    precipitation: "10%",
    wind: "8 mph",
  },
  {
    day: "Wednesday",
    condition: "Rainy",
    temp: "65°F",
    precipitation: "80%",
    wind: "12 mph",
  },
  {
    day: "Thursday",
    condition: "Cloudy",
    temp: "68°F",
    precipitation: "30%",
    wind: "10 mph",
  },
  {
    day: "Friday",
    condition: "Sunny",
    temp: "78°F",
    precipitation: "0%",
    wind: "6 mph",
  },
];

const projectTimeline = [
  {
    phase: "Planning",
    startDate: "Aug 1, 2023",
    endDate: "Sep 15, 2023",
    status: "completed",
  },
  {
    phase: "Foundation",
    startDate: "Sep 16, 2023",
    endDate: "Oct 30, 2023",
    status: "completed",
  },
  {
    phase: "Framing",
    startDate: "Nov 1, 2023",
    endDate: "Dec 15, 2023",
    status: "in-progress",
  },
  {
    phase: "Electrical & Plumbing",
    startDate: "Dec 16, 2023",
    endDate: "Jan 30, 2024",
    status: "pending",
  },
  {
    phase: "Finishing",
    startDate: "Feb 1, 2024",
    endDate: "Mar 15, 2024",
    status: "pending",
  },
];

export function ConstructionDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DataCard
          title="Active Projects"
          value="8"
          description="2 nearing completion"
          icon={<HardHat className="h-4 w-4" />}
        />
        <DataCard
          title="Equipment Utilization"
          value="75%"
          description="↑ 5% from last month"
          icon={<Truck className="h-4 w-4" />}
        />
        <DataCard
          title="Labor Hours"
          value="4,250"
          description="This month"
          icon={<Clock className="h-4 w-4" />}
        />
        <DataCard
          title="Weather Impact"
          value="Low"
          description="Clear forecast for 3 days"
          icon={<CloudSun className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Project Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projectStatus.map((project, index) => (
                  <TableRow key={index}>
                    <TableCell>{project.name}</TableCell>
                    <TableCell>
                      <div className="flex w-full items-center gap-2">
                        <Progress value={project.progress} className="h-2" />
                        <span className="text-xs text-muted-foreground">
                          {project.progress}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{project.deadline}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          project.status === "on-track"
                            ? "default"
                            : project.status === "delayed"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {project.status}
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
            <CardTitle>Equipment Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Equipment</TableHead>
                  <TableHead>Utilization</TableHead>
                  <TableHead>Next Maintenance</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {equipmentUtilization.map((equipment, index) => (
                  <TableRow key={index}>
                    <TableCell>{equipment.name}</TableCell>
                    <TableCell>
                      <div className="flex w-full items-center gap-2">
                        <Progress
                          value={equipment.utilization}
                          className="h-2"
                        />
                        <span className="text-xs text-muted-foreground">
                          {equipment.utilization}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{equipment.maintenance}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          equipment.status === "operational"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {equipment.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Material Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Material</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Reorder Point</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {materialInventory.map((material, index) => (
                  <TableRow key={index}>
                    <TableCell>{material.name}</TableCell>
                    <TableCell>{material.quantity}</TableCell>
                    <TableCell>{material.reorder}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          material.status === "adequate"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {material.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <InteractiveAreaChart
          title="Labor Allocation"
          description="Worker distribution by trade"
          data={laborAllocation}
          dataKeys={["carpenters", "masons", "electricians", "plumbers"]}
          timeRangeOptions={[
            { value: "1m", label: "Last month", days: 30 },
            { value: "3m", label: "Last 3 months", days: 90 },
          ]}
          isLoading={false}
          error={null}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Weather Forecast</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Day</TableHead>
                  <TableHead>Condition</TableHead>
                  <TableHead>Temperature</TableHead>
                  <TableHead>Precipitation</TableHead>
                  <TableHead>Wind</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {weatherForecast.map((day, index) => (
                  <TableRow key={index}>
                    <TableCell>{day.day}</TableCell>
                    <TableCell>{day.condition}</TableCell>
                    <TableCell>{day.temp}</TableCell>
                    <TableCell>{day.precipitation}</TableCell>
                    <TableCell>{day.wind}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Project Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Phase</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projectTimeline.map((phase, index) => (
                  <TableRow key={index}>
                    <TableCell>{phase.phase}</TableCell>
                    <TableCell>{phase.startDate}</TableCell>
                    <TableCell>{phase.endDate}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          phase.status === "completed"
                            ? "default"
                            : phase.status === "in-progress"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {phase.status}
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
