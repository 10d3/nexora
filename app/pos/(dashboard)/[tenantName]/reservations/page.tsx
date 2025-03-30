/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useReservation } from "@/context/reservation-provider";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReservationTable } from "./_components/view/reservation-table";
import { ReservationBoard } from "./_components/view/reservation-board";
import { ReservationFilters } from "./_components/filters/reservation-filters";
import { ReservationDialog } from "./_components/reservation-dialog";
import { useDashboard } from "@/context/dashboard-provider";
import { CalendarIcon, LayoutGrid, ListIcon, Plus } from "lucide-react";
import { ReservationCalendar } from "./_components/view/reservation-calendar";
import { ReservationTimeline } from "./_components/view/reservation-timeline";
import { PermissionGate } from "@/components/shared/permission-gate";
import { Permission } from "@/lib/permissions/role-permissions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function ReservationsPage() {
  const { view, setView } = useReservation();
  const { tenantId, businessType } = useDashboard();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  return (
    <div className="space-y-4 p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reservations</h1>
          <p className="text-muted-foreground">
            Manage your customer reservations and bookings
          </p>
        </div>

        <PermissionGate
          permission={Permission.CREATE_RESERVATIONS}
          fallback={
            <Button variant="outline" disabled>
              <Plus className="h-4 w-4 mr-2" />
              New Reservation
            </Button>
          }
        >
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Reservation
          </Button>
        </PermissionGate>
      </div>

      <PermissionGate
        permission={Permission.VIEW_RESERVATIONS}
        fallback={
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4 mr-2" />
            <AlertDescription>
              You don&apos;t have permission to view reservations.
            </AlertDescription>
          </Alert>
        }
      >
        <ReservationFilters />

        <Tabs value={view} onValueChange={(v) => setView(v as any)}>
          <TabsList>
            <TabsTrigger value="table">
              <ListIcon className="h-4 w-4 mr-2" />
              List
            </TabsTrigger>
            <TabsTrigger value="board">
              <LayoutGrid className="h-4 w-4 mr-2" />
              Board
            </TabsTrigger>
            <TabsTrigger value="calendar">
              <CalendarIcon className="h-4 w-4 mr-2" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="timeline">
              <CalendarIcon className="h-4 w-4 mr-2" />
              Timeline
            </TabsTrigger>
          </TabsList>
          <TabsContent value="table" className="mt-4">
            <ReservationTable />
          </TabsContent>
          <TabsContent value="board" className="mt-4">
            <ReservationBoard />
          </TabsContent>
          <TabsContent value="calendar" className="mt-4">
            <ReservationCalendar />
          </TabsContent>
          <TabsContent value="timeline" className="mt-4 overflow-auto">
            <ReservationTimeline />
          </TabsContent>
        </Tabs>
      </PermissionGate>

      <PermissionGate permission={Permission.CREATE_RESERVATIONS}>
        <ReservationDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          businessType={businessType}
          tenantId={tenantId || ""}
          mode="create"
        />
      </PermissionGate>
    </div>
  );
}
