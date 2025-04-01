/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useDashboard } from "@/context/dashboard-provider";
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
import { DataCard } from "./data-card";
import { InteractivePieChart } from "@/components/chart/interactive-pie";
import { InteractiveAreaChart } from "@/components/chart/area-chart";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
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

type BusinessDashboardConfigs = Record<string, BusinessDashboardConfig>;

// Universal Dashboard Component
export default function UniversalDashboard() {
  const { businessType, tenantId, dateRange } = useDashboard();
  const [dashboardData, setDashboardData] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get business-specific stats based on business type
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!tenantId) return;

      setIsLoading(true);
      try {
        let data;
        switch (businessType) {
          case "RESTAURANT":
            const { getRestaurantStats } = await import(
              "@/lib/actions/action.data"
            );
            data = await getRestaurantStats(
              tenantId,
              dateRange.from,
              dateRange.to
            );
            break;
          case "HOTEL":
            const { getHotelStats } = await import("@/lib/actions/action.data");
            data = await getHotelStats(tenantId, dateRange.from, dateRange.to);
            break;
          case "SALON":
            const { getSalonStats } = await import("@/lib/actions/action.data");
            data = await getSalonStats(tenantId, dateRange.from, dateRange.to);
            break;
          case "PHARMACIE":
            const { getPharmacyStats } = await import(
              "@/lib/actions/action.data"
            );
            data = await getPharmacyStats(
              tenantId,
              dateRange.from,
              dateRange.to
            );
            break;
          case "SUPERMARKET":
            const { getSupermarketStats } = await import(
              "@/lib/actions/action.data"
            );
            data = await getSupermarketStats(
              tenantId,
              dateRange.from,
              dateRange.to
            );
            break;
          case "CYBERCAFE":
            const { getCybercafeStats } = await import(
              "@/lib/actions/action.data"
            );
            data = await getCybercafeStats(
              tenantId,
              dateRange.from,
              dateRange.to
            );
            break;
          case "CONSTRUCTION":
            const { getConstructionStats } = await import(
              "@/lib/actions/construction-action"
            );
            data = await getConstructionStats(
              tenantId,
              dateRange.from,
              dateRange.to
            );
            break;
          default:
            data = { error: "Business type not supported" };
        }

        if (data.error) {
          setError(data.error);
        } else {
          setDashboardData(data);
        }
      } catch (err) {
        setError("Failed to fetch dashboard data");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [businessType, tenantId, dateRange]);

  console.log(dashboardData); // Add this line to log the dashboardData to the console

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
          description: "Most ordered items",
          dataKey: "menuItemPopularity",
        },
        {
          type: "area",
          title: "Service Time Trend",
          description: "Average service time in minutes",
          dataKey: "serviceTimeData",
          keys: ["time"],
        },
      ],
      tables: [
        {
          title: "Current Reservations",
          columns: ["Time", "Party Name", "Party Size", "Table", "Status"],
          dataKey: "currentReservations",
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
      charts: [], // Empty array instead of undefined
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
      charts: [], // Empty array instead of undefined
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
      charts: [], // Empty array instead of undefined
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
      charts: [], // Empty array instead of undefined
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
            const chartData =
              dashboardData && chart.dataKey
                ? dashboardData[chart.dataKey] || []
                : [];

            if (chart.type === "pie") {
              return (
                <InteractivePieChart
                  key={index}
                  title={chart.title}
                  description={chart.description}
                  data={chartData}
                  isLoading={false}
                  error={null}
                />
              );
            } else if (chart.type === "area") {
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
            return null;
          })}
        </div>
      )}

      {/* Tables */}
      {config.tables && config.tables.length > 0 && (
        <div className="grid gap-4 md:grid-cols-1">
          {config.tables.map((table, index) => {
            const tableData =
              dashboardData && table.dataKey
                ? dashboardData[table.dataKey] || []
                : [];

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
