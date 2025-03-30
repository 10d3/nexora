"use client";

import type React from "react";

import { useReservation } from "@/context/reservation-provider";
import { useDashboard } from "@/context/dashboard-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Edit, Trash, Clock, User, MapPin } from "lucide-react";
import { useState } from "react";
import { ReservationDialog } from "../reservation-dialog";
import {
  deleteReservation,
  updateReservationResource,
} from "@/lib/actions/reservation-actions";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Define types for resources and reservations
interface Resource {
  id: string;
  name: string;
  capacity?: number;
  type?: string;
  status?: string;
}

interface Reservation {
  id: string;
  customerName: string;
  startTime: string | Date;
  endTime?: string | Date;
  status: string;
  size?: number;
  resourceId?: string;
  resourceName?: string;
}

// Define the type for resource groups
interface ResourceGroup {
  resource: Resource;
  reservations: Reservation[];
}

export function ReservationBoard() {
  const { reservations, resources, refreshData, setSelectedReservation } =
    useReservation();
  const { tenantId, businessType } = useDashboard();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  console.log("ressource", resources);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const handleEdit = (id: string) => {
    const reservation = reservations.find((r) => r.id === id);
    if (reservation) {
      setSelectedReservation(reservation);
      setEditDialogOpen(true);
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return;

    const result = await deleteReservation(
      businessType || "RETAIL",
      selectedId,
      tenantId || ""
    );

    if (result.success) {
      toast.success("Reservation deleted", {
        description: "The reservation has been successfully deleted.",
      });
      refreshData();
    } else {
      toast.error("Error", {
        description: result.error || "Failed to delete reservation.",
      });
    }

    setDeleteDialogOpen(false);
    setSelectedId(null);
  };

  // Group reservations by resource with proper typing
  const resourceGroups = resources.reduce<Record<string, ResourceGroup>>(
    (acc, resource) => {
      acc[resource.id] = {
        resource: resource as Resource,
        reservations: reservations.filter(
          (r) => r.resourceId === resource.id
        ) as Reservation[],
      };
      return acc;
    },
    {}
  );

  console.log("resourceGroups", resourceGroups);

  // Add unassigned group
  const unassignedReservations = reservations.filter(
    (r) => !r.resourceId
  ) as Reservation[];

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    console.log("Drag end:", event);
    console.log("Active:", active);
    console.log("Over:", over.data.current);

    const reservationId = active.id as string;

    // Extract the resource ID from the over data
    let newResourceId;
    if (over.data.current && over.data.current.resourceId) {
      // If dropped on another reservation card, get its resource ID
      newResourceId = over.data.current.resourceId;
    } else {
      // If dropped directly on a droppable area
      newResourceId = over.id as string;
    }

    console.log("Reservation ID:", reservationId);
    console.log("New Resource ID:", newResourceId);

    // Skip if dropped in the same place
    const reservation = reservations.find((r) => r.id === reservationId);
    if (!reservation) {
      toast.error("Error", {
        description: "Reservation not found",
      });
      return;
    }

    // Check if it's the same resource to avoid unnecessary updates
    if (reservation.resourceId === newResourceId) return;

    // Set a loading toast
    const loadingToast = toast.loading("Updating reservation...");

    try {
      // Update the reservation's resource
      const result = await updateReservationResource(
        businessType || "RETAIL",
        reservationId,
        newResourceId === "unassigned" ? "" : newResourceId,
        tenantId || ""
      );

      console.log("Update result:", result);

      // Dismiss the loading toast
      toast.dismiss(loadingToast);

      if (result.success) {
        toast.success("Resource updated", {
          description: "The reservation has been moved to a new resource.",
        });

        // Force refresh data to update UI
        await refreshData();
      } else {
        toast.error("Error", {
          description: result.error || "Failed to update resource.",
        });
      }
    } catch (error) {
      // Dismiss the loading toast
      toast.dismiss(loadingToast);

      console.error("Error in drag and drop:", error);
      toast.error("Error", {
        description: "An unexpected error occurred during the update.",
      });
    }
  };

  // Sortable reservation item component
  function SortableReservationItem({
    reservation,
    resourceId,
  }: {
    reservation: Reservation;
    resourceId: string;
  }) {
    const { attributes, listeners, setNodeRef, transform, transition } =
      useSortable({
        id: reservation.id,
        data: {
          reservation,
          resourceId,
        },
      });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    const getStatusBadgeVariant = (status: string) => {
      switch (status) {
        case "CONFIRMED":
        case "COMPLETED":
        case "CHECKED_IN":
        case "CHECKED_OUT":
          return "outline";
        case "PENDING":
        case "SCHEDULED":
        case "WAITING_LIST":
          return "secondary";
        case "CANCELLED":
        case "NO_SHOW":
          return "destructive";
        default:
          return "secondary";
      }
    };

    return (
      <Card
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="mb-3 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-shadow duration-200"
      >
        <CardHeader className="p-3 pb-0 flex flex-row justify-between items-start">
          <div>
            <CardTitle className="text-sm font-medium">
              {reservation.customerName}
            </CardTitle>
            <Badge
              variant={getStatusBadgeVariant(reservation.status)}
              className="mt-1"
            >
              {reservation.status.replace(/_/g, " ")}
            </Badge>
          </div>
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 hover:bg-muted/80"
              onClick={() => handleEdit(reservation.id)}
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-destructive hover:bg-destructive/10"
              onClick={() => {
                setSelectedId(reservation.id);
                setDeleteDialogOpen(true);
              }}
            >
              <Trash className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-2">
          <div className="text-xs space-y-1.5">
            <div className="flex items-center text-muted-foreground">
              <Clock className="h-3 w-3 mr-1.5" />
              <span>
                {format(new Date(reservation.startTime), "MMM d, h:mm a")}
              </span>
            </div>
            {reservation.size && (
              <div className="flex items-center text-muted-foreground">
                <User className="h-3 w-3 mr-1.5" />
                <span>{reservation.size} guests</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Droppable area component
  function DroppableArea({
    id,
    children,
  }: {
    id: string;
    children: React.ReactNode;
  }) {
    return (
      <div
        id={`droppable-${id}`}
        data-droppable-id={id}
        className="min-h-[200px] bg-muted/20 rounded-lg p-3 space-y-2 border border-muted/30"
      >
        {children}
      </div>
    );
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
          {/* Unassigned column */}
          <div className="space-y-4">
            <h3 className="font-medium text-lg flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-gray-500"></span>
              Unassigned
            </h3>
            <DroppableArea id="unassigned">
              {unassignedReservations.length === 0 ? (
                <div className="h-24 flex items-center justify-center text-muted-foreground border border-dashed rounded-md">
                  No unassigned reservations
                </div>
              ) : (
                <SortableContext
                  items={unassignedReservations.map((r) => r.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {unassignedReservations.map((reservation) => (
                    <SortableReservationItem
                      key={reservation.id}
                      reservation={reservation}
                      resourceId="unassigned"
                    />
                  ))}
                </SortableContext>
              )}
            </DroppableArea>
          </div>

          {/* Resource columns */}
          {Object.values(resourceGroups).map(({ resource, reservations }) => (
            <div key={resource.id} className="space-y-4">
              <h3 className="font-medium text-lg flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                <MapPin className="h-4 w-4" />
                {resource.name}
                {resource.capacity && (
                  <span className="text-xs text-muted-foreground">
                    ({resource.capacity})
                  </span>
                )}
              </h3>
              <DroppableArea id={resource.id}>
                {reservations.length === 0 ? (
                  <div className="h-24 flex items-center justify-center text-muted-foreground border border-dashed rounded-md">
                    No reservations
                  </div>
                ) : (
                  <SortableContext
                    items={reservations.map((r) => r.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {reservations.map((reservation) => (
                      <SortableReservationItem
                        key={reservation.id}
                        reservation={reservation}
                        resourceId={resource.id}
                      />
                    ))}
                  </SortableContext>
                )}
              </DroppableArea>
            </div>
          ))}
        </div>
      </DndContext>

      {/* Edit Dialog */}
      <ReservationDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        businessType={businessType || "RETAIL"}
        tenantId={tenantId || ""}
        mode="edit"
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              reservation from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
