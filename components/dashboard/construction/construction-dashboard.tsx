"use client";

import { HardHat, Truck, CloudSun, Clock } from "lucide-react";
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
import { useConstructionStats } from "@/hooks/use-construction";
import { Skeleton } from "@/components/ui/skeleton";

export function ConstructionDashboard() {
  const { data, isLoading, error } = useConstructionStats();

  console.log(data);

  // Calculate summary metrics
  const activeProjects = data?.projects.length || 0;
  const nearingCompletion =
    data?.projects.filter((p) => p.progress > 80).length || 0;

  const avgEquipmentUtilization = data?.equipment.length
    ? Math.round(
        data.equipment.reduce((sum, eq) => sum + eq.utilization, 0) /
          data.equipment.length
      )
    : 0;

  // Calculate total labor hours (assuming 8 hours per worker per day)
  const totalLaborHours =
    data?.laborData.reduce((sum, day) => {
      const dailyTotal =
        (day.carpenters + day.masons + day.electricians + day.plumbers) * 8;
      return sum + dailyTotal;
    }, 0) || 0;

  // Weather impact from the data
  const weatherImpact = data?.weatherData.impact || "Unknown";

  if (error) {
    return (
      <div className="p-4">
        Error loading construction data: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DataCard
          title="Active Projects"
          value={
            isLoading ? (
              <Skeleton className="h-6 w-16" />
            ) : (
              activeProjects.toString()
            )
          }
          description={
            isLoading ? "" : `${nearingCompletion} nearing completion`
          }
          icon={<HardHat className="h-4 w-4" />}
        />
        <DataCard
          title="Equipment Utilization"
          value={
            isLoading ? (
              <Skeleton className="h-6 w-16" />
            ) : (
              `${avgEquipmentUtilization}%`
            )
          }
          description={isLoading ? "" : "Average across all equipment"}
          icon={<Truck className="h-4 w-4" />}
        />
        <DataCard
          title="Labor Hours"
          value={
            isLoading ? (
              <Skeleton className="h-6 w-16" />
            ) : (
              totalLaborHours.toLocaleString()
            )
          }
          description="This month"
          icon={<Clock className="h-4 w-4" />}
        />
        <DataCard
          title="Weather Impact"
          value={isLoading ? <Skeleton className="h-6 w-16" /> : weatherImpact}
          description={
            isLoading
              ? ""
              : `Forecast available for ${data?.weatherData.forecast.length || 0} days`
          }
          icon={<CloudSun className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Project Status</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>
            ) : (
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
                  {data?.projects.map((project) => (
                    <TableRow key={project.id}>
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
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Equipment Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>
            ) : (
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
                  {data?.equipment.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>
                        <div className="flex w-full items-center gap-2">
                          <Progress value={item.utilization} className="h-2" />
                          <span className="text-xs text-muted-foreground">
                            {item.utilization}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{item.maintenance}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            item.status === "operational"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {item.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Material Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>
            ) : (
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
                  {data?.materials.map((material) => (
                    <TableRow key={material.id}>
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
            )}
          </CardContent>
        </Card>

        <InteractiveAreaChart
          title="Labor Allocation"
          description="Worker distribution by trade"
          data={data?.laborData || []}
          dataKeys={["carpenters", "masons", "electricians", "plumbers"]}
          timeRangeOptions={[
            { value: "1m", label: "Last month", days: 30 },
            { value: "3m", label: "Last 3 months", days: 90 },
          ]}
          isLoading={isLoading}
          error={error}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Weather Forecast</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            ) : (
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
                  {data?.weatherData.forecast.map((day, index) => (
                    <TableRow key={index}>
                      <TableCell>{day.day}</TableCell>
                      <TableCell>{day.condition}</TableCell>
                      <TableCell>{day.temperature}</TableCell>
                      <TableCell>{day.precipitation}</TableCell>
                      <TableCell>{day.wind}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Project Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            ) : (
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
                  {data?.timeline.map((phase) => (
                    <TableRow key={phase.id}>
                      <TableCell>{phase.name}</TableCell>
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
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
