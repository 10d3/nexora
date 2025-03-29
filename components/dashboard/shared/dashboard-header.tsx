"use client";

import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
// import { SidebarTrigger } from "@/components/ui/sidebar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type DashboardTab, useDashboard } from "@/context/dashboard-provider";

export function DashboardHeader() {
  const { dateRange, setDateRange, activeTab, setActiveTab } =
    useDashboard();

//   const businessLabels = {
//     restaurant: "Restaurant Dashboard",
//     hotel: "Hotel Dashboard",
//     salon: "Salon/Service Dashboard",
//     pharmacy: "Pharmacy Dashboard",
//     supermarket: "Supermarket Dashboard",
//     cybercafe: "Cybercafe Dashboard",
//     construction: "Construction Dashboard",
//     education: "Education Dashboard",
//   };

  return (
    <header className="sticky top-0 z-10 flex h-auto flex-col gap-4 border-b bg-background px-4 pb-3 sm:px-6">
      <div className="flex items-center gap-4">
        {/* <SidebarTrigger /> */}
        <h1 className="text-lg font-semibold sm:text-xl">
          {/* {businessLabels[businessType]} */} Dashboard
        </h1>
        <div className="ml-auto flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="justify-start text-left font-normal sm:w-[240px]"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="range"
                selected={{
                  from: dateRange.from,
                  to: dateRange.to,
                }}
                onSelect={(range) => {
                  setDateRange({
                    from: range?.from,
                    to: range?.to,
                  });
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as DashboardTab)}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-3 lg:w-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          {/* <TabsTrigger value="customers" className="hidden md:inline-flex">
            Customers
          </TabsTrigger>
          <TabsTrigger value="inventory" className="hidden md:inline-flex">
            Inventory
          </TabsTrigger>
          <TabsTrigger value="reports" className="hidden md:inline-flex">
            Reports
          </TabsTrigger>
          <TabsTrigger value="settings" className="hidden md:inline-flex">
            Settings
          </TabsTrigger> */}
        </TabsList>
      </Tabs>
    </header>
  );
}
