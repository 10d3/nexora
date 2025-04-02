/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useDashboard } from "@/context/dashboard-provider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DataCard } from "./data-card";
// import { InteractivePieChart } from "@/components/chart/interactive-pie";
import { InteractiveAreaChart } from "@/components/chart/area-chart";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import {
  Utensils,
  Users,
  Clock,
  Calendar,
  Building2,
  TrendingUp,
  UserCheck,
  ShoppingCart,
  Package,
  Truck,
  Monitor,
  Pill,
  ClipboardList,
  AlertTriangle,
  FileText,
} from "lucide-react";
import { LucideIcon } from "lucide-react";
import { PieTest } from "@/components/chart/pie";

// Import React Query hooks
import { useRestaurantStats } from "@/hooks/stats/use-restaurant-stats";
import { useHotelStats } from "@/hooks/stats/use-hotel-stats";
import { usePharmacyStats } from "@/hooks/stats/use-pharmacy-stats";
import { useConstructionStats } from "@/hooks/stats/use-construction-stats";
import { UseQueryResult } from "@tanstack/react-query";

// Define types for our dashboard configuration
interface MetricConfig {
  title: string;
  icon: LucideIcon;
  valueKey: string;
  descriptionKey: string;
}

interface ChartConfig {
  type: "pie" | "area";
  title: string;
  description: string;
  dataKey: string;
  keys?: string[];
}

interface TableConfig {
  title: string;
  columns: string[];
  dataKey: string;
}

interface BusinessDashboardConfig {
  title: string;
  metrics: MetricConfig[];
  charts?: ChartConfig[];
  tables?: TableConfig[];
}

// Define a type for dashboard data to fix indexing issues
interface DashboardData {
  [key: string]: any;
}

type BusinessDashboardConfigs = Record<string, BusinessDashboardConfig>;

// Universal Dashboard Component
export default function UniversalDashboard() {
  const { businessType, tenantId, dateRange } = useDashboard();
  const [dashboardData, setDashboardData] = useState<DashboardData>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Always declare hooks at the top level, even if we don't use them all
  const restaurantStatsQuery = useRestaurantStats(
    tenantId as string,
    dateRange.from,
    dateRange.to
  );
  const hotelStatsQuery = useHotelStats(
    tenantId as string,
    dateRange.from,
    dateRange.to
  );
  const pharmacyStatsQuery = usePharmacyStats(
    tenantId as string,
    dateRange.from,
    dateRange.to
  );
  const constructionStatsQuery = useConstructionStats(
    tenantId as string,
    dateRange.from,
    dateRange.to
  );

  // Use effect to set the appropriate data based on business type
  useEffect(() => {
    setIsLoading(true);
    setError(null);

    let activeQuery: UseQueryResult<any, Error>;

    switch (businessType) {
      case "RESTAURANT":
        activeQuery = restaurantStatsQuery;
        break;
      case "HOTEL":
        activeQuery = hotelStatsQuery;
        break;
      case "PHARMACIE":
        activeQuery = pharmacyStatsQuery;
        break;
      case "CONSTRUCTION":
        activeQuery = constructionStatsQuery;
        break;
      default:
        setError("Business type not supported");
        setIsLoading(false);
        return;
    }

    if (activeQuery.isLoading) {
      setIsLoading(true);
    } else if (activeQuery.error) {
      setError(String(activeQuery.error));
      setIsLoading(false);
    } else if (activeQuery.data) {
      setDashboardData(activeQuery.data);
      setIsLoading(false);
    }
  }, [
    businessType,
    restaurantStatsQuery.data,
    restaurantStatsQuery.isLoading,
    restaurantStatsQuery.error,
    hotelStatsQuery.data,
    hotelStatsQuery.isLoading,
    hotelStatsQuery.error,
    pharmacyStatsQuery.data,
    pharmacyStatsQuery.isLoading,
    pharmacyStatsQuery.error,
    constructionStatsQuery.data,
    constructionStatsQuery.isLoading,
    constructionStatsQuery.error,
  ]);

  const getDataValue = (key: string, defaultValue: any = []) => {
    if (!dashboardData || typeof dashboardData !== "object")
      return defaultValue;
    return key in dashboardData ? dashboardData[key] : defaultValue;
  };

  // Business-specific dashboard configurations
  const dashboardConfig: BusinessDashboardConfigs = {
    RESTAURANT: {
      title: "Restaurant Dashboard",
      metrics: [
        {
          title: "Today's Orders",
          icon: Utensils,
          valueKey: "totalOrders",
          descriptionKey: "ordersTrend",
        },
        {
          title: "Customers Today",
          icon: Users,
          valueKey: "totalCustomers",
          descriptionKey: "customersTrend",
        },
        {
          title: "Average Service Time",
          icon: Clock,
          valueKey: "avgServiceTime",
          descriptionKey: "serviceTimeTrend",
        },
        {
          title: "Reservations",
          icon: Calendar,
          valueKey: "totalReservations",
          descriptionKey: "reservationsTrend",
        },
      ],
      charts: [
        {
          type: "pie",
          title: "Menu Item Popularity",
          description: "Most popular items ordered",
          dataKey: "menuItemPopularity",
        },
        {
          type: "pie",
          title: "Table Status",
          description: "Current table availability",
          dataKey: "tablesByStatus",
        },
        {
          type: "area",
          title: "Average Service Time",
          description: "Time from order to delivery",
          dataKey: "serviceTimeData",
          keys: ["time"],
        },
        {
          type: "area",
          title: "Table Turnover Rate",
          description: "Tables served per hour",
          dataKey: "turnoverData",
          keys: ["rate"],
        },
      ],
      tables: [
        {
          title: "Current Reservations",
          columns: ["Party Name", "Time", "Party Size", "Table", "Status"],
          dataKey: "upcomingReservations",
        },
      ],
    },
    HOTEL: {
      title: "Hotel Dashboard",
      metrics: [
        {
          title: "Room Occupancy",
          icon: Building2,
          valueKey: "occupancyRate",
          descriptionKey: "occupancyTrend",
        },
        {
          title: "Current Guests",
          icon: Users,
          valueKey: "currentGuests",
          descriptionKey: "guestsSummary",
        },
        {
          title: "Check-ins Today",
          icon: Calendar,
          valueKey: "checkInsToday",
          descriptionKey: "checkInsSummary",
        },
        {
          title: "Check-outs Today",
          icon: Clock,
          valueKey: "checkOutsToday",
          descriptionKey: "checkOutsSummary",
        },
        {
          title: "RevPAR",
          icon: TrendingUp,
          valueKey: "revPAR",
          descriptionKey: "revPARTrend",
        },
      ],
      charts: [
        {
          type: "area",
          title: "Room Occupancy Rate",
          description: "Daily occupancy percentage",
          dataKey: "occupancyData",
          keys: ["rate"],
        },
        {
          type: "pie",
          title: "Average Length of Stay",
          description: "Distribution by nights stayed",
          dataKey: "stayLengthData",
        },
      ],
      tables: [
        {
          title: "Room Type Availability",
          columns: [
            "Room Type",
            "Available",
            "Occupied",
            "Maintenance",
            "Occupancy Rate",
          ],
          dataKey: "roomTypeAvailability",
        },
      ],
    },
    SALON: {
      title: "Salon Dashboard",
      metrics: [
        {
          title: "Today's Appointments",
          icon: Calendar,
          valueKey: "appointmentsToday",
          descriptionKey: "appointmentsTrend",
        },
        {
          title: "Available Staff",
          icon: Users,
          valueKey: "availableStaff",
          descriptionKey: "staffSummary",
        },
        {
          title: "Customer Retention",
          icon: UserCheck,
          valueKey: "customerRetention",
          descriptionKey: "retentionTrend",
        },
        {
          title: "Average Service Time",
          icon: Clock,
          valueKey: "avgServiceTime",
          descriptionKey: "serviceTimeSummary",
        },
      ],
      charts: [
        {
          type: "area",
          title: "Service Time Trends",
          description: "Average service duration over time",
          dataKey: "serviceTimeData",
          keys: ["time"],
        },
        {
          type: "pie",
          title: "Staff Utilization",
          description: "Current staff workload distribution",
          dataKey: "staffUtilizationChart",
        },
      ],
      tables: [
        {
          title: "Appointment Schedule",
          columns: ["Time", "Client", "Service", "Stylist", "Duration"],
          dataKey: "upcomingAppointments",
        },
      ],
    },
    PHARMACIE: {
      title: "Pharmacy Dashboard",
      metrics: [
        {
          title: "Prescriptions Today",
          icon: ClipboardList,
          valueKey: "prescriptionsToday",
          descriptionKey: "prescriptionsSummary",
        },
        {
          title: "Inventory Items",
          icon: Pill,
          valueKey: "inventoryItems",
          descriptionKey: "inventorySummary",
        },
        {
          title: "Expiring Soon",
          icon: AlertTriangle,
          valueKey: "expiringSoon",
          descriptionKey: "expiringSummary",
        },
        {
          title: "Insurance Claims",
          icon: FileText,
          valueKey: "insuranceClaims",
          descriptionKey: "claimsSummary",
        },
      ],
      charts: [
        {
          type: "area",
          title: "Prescription Trends",
          description: "Daily prescription volume",
          dataKey: "prescriptionTrends",
          keys: ["count"],
        },
        {
          type: "pie",
          title: "Medication Categories",
          description: "Distribution by medication type",
          dataKey: "medicationCategories",
        },
        {
          type: "area",
          title: "Inventory Levels",
          description: "Stock levels over time",
          dataKey: "inventoryTrends",
          keys: ["level"],
        },
      ],
      tables: [
        {
          title: "Prescription Tracking",
          columns: ["Rx #", "Patient", "Medication", "Status", "Date"],
          dataKey: "prescriptionTracking",
        },
      ],
    },
    SUPERMARKET: {
      title: "Supermarket Dashboard",
      metrics: [
        {
          title: "Today's Sales",
          icon: ShoppingCart,
          valueKey: "salesToday",
          descriptionKey: "salesTrend",
        },
        {
          title: "Transactions",
          icon: TrendingUp,
          valueKey: "transactionsToday",
          descriptionKey: "transactionsTrend",
        },
        {
          title: "Inventory Items",
          icon: Package,
          valueKey: "inventoryItems",
          descriptionKey: "inventorySummary",
        },
        {
          title: "Deliveries Today",
          icon: Truck,
          valueKey: "deliveriesToday",
          descriptionKey: "deliveriesSummary",
        },
      ],
      charts: [
        {
          type: "area",
          title: "Sales Trends",
          description: "Daily sales volume",
          dataKey: "salesTrends",
          keys: ["amount"],
        },
        {
          type: "pie",
          title: "Department Sales",
          description: "Sales distribution by department",
          dataKey: "departmentSales",
        },
        {
          type: "area",
          title: "Inventory Levels",
          description: "Stock levels over time",
          dataKey: "inventoryTrends",
          keys: ["level"],
        },
      ],
      tables: [
        {
          title: "Department Performance",
          columns: ["Department", "Sales", "Target", "Progress"],
          dataKey: "departmentPerformance",
        },
      ],
    },
    CYBERCAFE: {
      title: "Cybercafe Dashboard",
      metrics: [
        {
          title: "Active Computers",
          icon: Monitor,
          valueKey: "activeComputers",
          descriptionKey: "computersSummary",
        },
        {
          title: "Current Users",
          icon: Users,
          valueKey: "currentUsers",
          descriptionKey: "usersSummary",
        },
        {
          title: "Average Session",
          icon: Clock,
          valueKey: "avgSession",
          descriptionKey: "sessionTrend",
        },
        {
          title: "Today's Revenue",
          icon: TrendingUp,
          valueKey: "revenueToday",
          descriptionKey: "revenueTrend",
        },
      ],
      charts: [], // Empty array instead of undefined
      tables: [
        {
          title: "Computer Usage Stats",
          columns: ["Computer ID", "User", "Start Time", "Duration", "Status"],
          dataKey: "computerUsage",
        },
      ],
    },
    CONSTRUCTION: {
      title: "Construction Dashboard",
      metrics: [
        {
          title: "Active Projects",
          icon: Building2,
          valueKey: "activeProjects",
          descriptionKey: "projectsSummary",
        },
        {
          title: "Workers On-site",
          icon: Users,
          valueKey: "workersOnsite",
          descriptionKey: "workersSummary",
        },
        {
          title: "Equipment Usage",
          icon: Truck,
          valueKey: "equipmentUsage",
          descriptionKey: "equipmentSummary",
        },
        {
          title: "Project Timeline",
          icon: Calendar,
          valueKey: "projectTimeline",
          descriptionKey: "timelineSummary",
        },
      ],
      charts: [
        {
          type: "pie",
          title: "Project Progress",
          description: "Current progress of active projects",
          dataKey: "projectProgress",
        },
        {
          type: "pie",
          title: "Worker Allocation",
          description: "Distribution of workers by role",
          dataKey: "workerAllocation",
        },
        {
          type: "area",
          title: "Equipment Usage Trend",
          description: "Equipment utilization over time",
          dataKey: "equipmentUsageTrend",
          keys: ["rate"],
        },
        {
          type: "area",
          title: "Task Completion",
          description: "Daily completed tasks",
          dataKey: "taskCompletion",
          keys: ["completed"],
        },
      ],
      tables: [
        {
          title: "Project Status",
          columns: ["Project", "Progress", "Deadline", "Status"],
          dataKey: "projects",
        },
      ],
    },
  };

  // Get the configuration for the current business type or use a default
  const config = dashboardConfig[
    businessType as keyof typeof dashboardConfig
  ] || {
    title: `${businessType} Dashboard`,
    metrics: [],
    charts: [],
    tables: [],
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">{config.title}</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="mt-2 h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-500">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{config.title}</h2>

      {/* Metrics Cards */}
      {config.metrics && config.metrics.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {config.metrics.map((metric, index) => {
            const value =
              dashboardData && metric.valueKey
                ? dashboardData[metric.valueKey]
                : "N/A";
            const description =
              dashboardData && metric.descriptionKey
                ? dashboardData[metric.descriptionKey]
                : "";

            return (
              <DataCard
                key={index}
                title={metric.title}
                value={value}
                description={description}
                icon={<metric.icon className="h-4 w-4" />}
              />
            );
          })}
        </div>
      )}

      {/* Charts */}
      {config.charts && config.charts.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {config.charts.map((chart, index) => {
            const chartData = getDataValue(chart.dataKey, []);

            if (
              chart.type === "pie" &&
              Array.isArray(chartData) &&
              chartData.length > 0
            ) {
              return (
                <PieTest
                  key={index}
                  title={chart.title}
                  description={chart.description}
                  data={chartData}
                  isLoading={false}
                  error={null}
                />
              );
            } else if (
              chart.type === "area" &&
              Array.isArray(chartData) &&
              chartData.length > 0
            ) {
              return (
                <InteractiveAreaChart
                  key={index}
                  title={chart.title}
                  description={chart.description}
                  data={chartData}
                  dataKeys={chart.keys || []}
                  timeRangeOptions={[
                    { value: "7d", label: "Last 7 days", days: 7 },
                    { value: "30d", label: "Last 30 days", days: 30 },
                  ]}
                  isLoading={false}
                  error={null}
                />
              );
            }

            // If we get here, show a placeholder for empty data
            return (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>{chart.title}</CardTitle>
                  <CardDescription>{chart.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center py-10">
                  <p className="text-muted-foreground">
                    No data available for this chart
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Tables */}
      {config.tables && config.tables.length > 0 && (
        <div className="grid gap-4 md:grid-cols-1">
          {config.tables.map((table, index) => {
            const tableData = getDataValue(table.dataKey, []);

            return (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>{table.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  {tableData && tableData.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {table.columns.map((column, colIndex) => (
                            <TableHead key={colIndex}>{column}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tableData.map(
                          (row: Record<string, any>, rowIndex: number) => (
                            <TableRow key={rowIndex}>
                              {Object.values(row).map(
                                (cell: any, cellIndex: number) => (
                                  <TableCell key={cellIndex}>
                                    {typeof cell === "object" &&
                                    cell !== null ? (
                                      <Badge
                                        variant={
                                          cell.status === "active" ||
                                          cell.status === "ready" ||
                                          cell.status === "on-track"
                                            ? "default"
                                            : cell.status === "available" ||
                                                cell.status === "processing"
                                              ? "secondary"
                                              : cell.status === "maintenance" ||
                                                  cell.status === "delayed" ||
                                                  cell.status === "at-risk"
                                                ? "destructive"
                                                : "outline"
                                        }
                                      >
                                        {cell.label || cell.status}
                                      </Badge>
                                    ) : (
                                      cell
                                    )}
                                  </TableCell>
                                )
                              )}
                            </TableRow>
                          )
                        )}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-center text-muted-foreground">
                      No data available
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Fallback for unconfigured business types */}
      {(!config.metrics || config.metrics.length === 0) && (
        <div className="text-center p-8">
          <p className="text-muted-foreground">
            Dashboard configuration for {businessType} is not complete.
          </p>
        </div>
      )}
    </div>
  );
}
