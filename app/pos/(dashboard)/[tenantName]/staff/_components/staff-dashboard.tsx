"use client";

import { useState } from "react";
// import { useStaff } from "@/providers/staff-provider";
// import { useDashboard } from "@/providers/dashboard-provider";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StaffHeader from "./staff-header";
import StaffTable from "./staff-table";
import StaffGrid from "./staff-grid";
// import StaffCalendar from "./staff-calendar";
import StaffForm from "./staff-form";
import { toast } from "sonner";
import { useStaff } from "@/context/staff-provider";
import { useDashboard } from "@/context/dashboard-provider";
// import { StaffCalendarSkeleton } from "./staff-skeleton";
import StaffCalendar from "./staff-calendar";

export default function StaffDashboard() {
  const { view, setView, refreshData } = useStaff();
  const { businessType } = useDashboard();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleCreateSuccess = () => {
    refreshData();
    setIsFormOpen(false);
    toast.success("Staff member created", {
      description: "The staff member has been created successfully.",
    });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Team Member
        </Button>
      </div>

      <StaffHeader />

      <Tabs
        value={view}
        onValueChange={(v) => setView(v as "table" | "grid" | "calendar")}
      >
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="table">Table</TabsTrigger>
          <TabsTrigger value="grid">Grid</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
        </TabsList>
        <TabsContent value="table" className="mt-6">
          <StaffTable />
        </TabsContent>
        <TabsContent value="grid" className="mt-6">
          <StaffGrid />
        </TabsContent>
        <TabsContent value="calendar" className="mt-6">
          <StaffCalendar />
        </TabsContent>
      </Tabs>

      <StaffForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSuccess={handleCreateSuccess}
        businessType={businessType}
      />
    </div>
  );
}
