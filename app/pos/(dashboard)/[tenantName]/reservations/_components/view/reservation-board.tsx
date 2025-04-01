/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type React from "react";

import { useReservation } from "@/context/reservation-provider";
import { useDashboard } from "@/context/dashboard-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import {
  Edit,
  Trash,
  Clock,
  User,
  MapPin,
  CalendarClock,
  Layers,
  MoveHorizontal,
} from "lucide-react";
import { useState } from "react";
import { ReservationDialog } from "../reservation-dialog";
import { deleteReservation } from "@/lib/actions/reservation-actions";
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
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useReservationMutation } from "@/hooks/use-reservation-mutations";
import { useQueryClient } from "@tanstack/react-query";

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
  const { reservations, resources, setSelectedReservation } = useReservation();
  const { tenantId, businessType } = useDashboard();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const queryClient = useQueryClient();

  // Use the reservation mutations hook
  const { updateReservation, isPending } = useReservationMutation(
    businessType || "RETAIL",
    tenantId || ""
  );

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

    // Optimistically update UI before server response
    const reservationToDelete = reservations.find((r) => r.id === selectedId);
    if (reservationToDelete) {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["reservations", businessType, tenantId],
      });

      // Snapshot the previous value
      const previousReservations = queryClient.getQueryData([
        "reservations",
        businessType,
        tenantId,
      ]);

      // Optimistically remove from UI
      queryClient.setQueryData(
        ["reservations", businessType, tenantId],
        (old: any[] | undefined) => {
          if (!old) return old;
          return old.filter((r) => r.id !== selectedId);
        }
      );

      const result = await deleteReservation(
        businessType || "RETAIL",
        selectedId,
        tenantId || ""
      );

      if (result.success) {
        toast.success("Reservation deleted", {
          description: "The reservation has been successfully deleted.",
        });
      } else {
        // Restore previous data if operation failed
        queryClient.setQueryData(
          ["reservations", businessType, tenantId],
          previousReservations
        );

        toast.error("Error", {
          description: result.error || "Failed to delete reservation.",
        });
      }

      // Always refetch to ensure consistency
      queryClient.invalidateQueries({
        queryKey: ["reservations", businessType, tenantId],
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

  // Add unassigned group
  const unassignedReservations = reservations.filter(
    (r) => !r.resourceId
  ) as Reservation[];

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setIsDragging(false);

    if (!over) return;

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

    // Find the resource name for the new resource
    let newResourceName = "";
    if (newResourceId !== "unassigned") {
      const resource = resources.find((r) => r.id === newResourceId);
      newResourceName = resource?.name || "";
    }

    // Create updated reservation object with new resource
    const updatedReservation = {
      ...reservation,
      resourceId: newResourceId === "unassigned" ? "" : newResourceId,
      resourceName: newResourceName,
    };

    // Use the mutation from the hook which handles optimistic updates
    updateReservation(updatedReservation);
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  // Sortable reservation item component
  function SortableReservationItem({
    reservation,
    resourceId,
  }: {
    reservation: Reservation;
    resourceId: string;
  }) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging: isItemDragging,
    } = useSortable({
      id: reservation.id,
      data: {
        reservation,
        resourceId,
      },
    });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      zIndex: isItemDragging ? 50 : "auto",
    };

    const getStatusBadgeVariant = (status: string) => {
      switch (status.toUpperCase()) {
        case "CONFIRMED":
        case "COMPLETED":
        case "CHECKED_IN":
          return "outline";
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

    const getStatusColor = (status: string) => {
      switch (status.toUpperCase()) {
        case "CONFIRMED":
        case "COMPLETED":
        case "CHECKED_IN":
          return "bg-green-500";
        case "CHECKED_OUT":
          return "bg-blue-500";
        case "PENDING":
        case "SCHEDULED":
        case "WAITING_LIST":
          return "bg-amber-500";
        case "CANCELLED":
        case "NO_SHOW":
          return "bg-red-500";
        default:
          return "bg-gray-500";
      }
    };

    const formatStatus = (status: string) => {
      return status
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (l) => l.toUpperCase());
    };

    // Check if this is a temporary item (from optimistic update)
    const isTemporary = reservation.id.startsWith("temp-");

    return (
      <Card
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={cn(
          "mb-3 cursor-grab transition-all duration-200",
          isItemDragging
            ? "shadow-lg scale-105 opacity-90 rotate-1"
            : "shadow-sm hover:shadow-md",
          isTemporary && "opacity-70 border-dashed border-primary"
        )}
      >
        <CardHeader className="p-3 pb-0 flex flex-row justify-between items-start">
          <div>
            <CardTitle className="text-sm font-medium line-clamp-1">
              {reservation.customerName}
            </CardTitle>
            <Badge
              variant={getStatusBadgeVariant(reservation.status)}
              className="mt-1"
            >
              <span
                className={`w-2 h-2 rounded-full mr-1.5 ${getStatusColor(reservation.status)}`}
              ></span>
              {formatStatus(reservation.status)}
            </Badge>
          </div>
          <div className="flex space-x-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 hover:bg-muted/80"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(reservation.id);
                    }}
                    disabled={isTemporary || isPending}
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Edit reservation</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:bg-destructive/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedId(reservation.id);
                      setDeleteDialogOpen(true);
                    }}
                    disabled={isTemporary || isPending}
                  >
                    <Trash className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Delete reservation</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-2">
          <div className="text-xs space-y-1.5">
            <div className="flex items-center text-muted-foreground">
              <Clock className="h-3 w-3 mr-1.5 flex-shrink-0" />
              <span className="truncate">
                {format(new Date(reservation.startTime), "MMM d, h:mm a")}
              </span>
            </div>
            {reservation.size && (
              <div className="flex items-center text-muted-foreground">
                <User className="h-3 w-3 mr-1.5 flex-shrink-0" />
                <span>
                  {reservation.size} guest{reservation.size !== 1 ? "s" : ""}
                </span>
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
    isEmpty,
  }: {
    id: string;
    children: React.ReactNode;
    isEmpty: boolean;
  }) {
    // Use the useDroppable hook to make this area droppable
    const { setNodeRef } = useDroppable({
      id: id,
      data: { type: "resource-area" }
    });

    return (
      <div
        ref={setNodeRef}
        id={`droppable-${id}`}
        data-droppable-id={id}
        className={cn(
          "min-h-[200px] rounded-lg p-3 space-y-2 transition-colors duration-200",
          isDragging
            ? "bg-muted/40 border-2 border-dashed border-primary/40"
            : "bg-muted/20 border border-muted/30",
          isEmpty && isDragging && "flex items-center justify-center"
        )}
      >
        {isEmpty && isDragging ? (
          <div className="text-center text-muted-foreground flex flex-col items-center">
            <MoveHorizontal className="h-5 w-5 mb-2 animate-pulse" />
            <p className="text-sm">Drop here</p>
          </div>
        ) : (
          children
        )}
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="bg-background rounded-lg border shadow-sm">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Reservation Board</h2>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Layers className="h-4 w-4" />
            <span>{reservations.length} reservations</span>
          </div>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          onDragStart={handleDragStart}
        >
          <ScrollArea className="h-[calc(100vh-12rem)]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
              {/* Unassigned column */}
              <div className="space-y-4">
                <h3 className="font-medium text-base flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-gray-500"></span>
                  Unassigned
                  <Badge variant="outline" className="ml-auto">
                    {unassignedReservations.length}
                  </Badge>
                </h3>
                <DroppableArea
                  id="unassigned"
                  isEmpty={unassignedReservations.length === 0}
                >
                  {unassignedReservations.length === 0 && !isDragging ? (
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
              {Object.values(resourceGroups).map(
                ({ resource, reservations }) => (
                  <div key={resource.id} className="space-y-4">
                    <h3 className="font-medium text-base flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-1 truncate">
                            <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                            <span className="truncate">{resource.name}</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          {resource.name}
                          {resource.type && ` (${resource.type})`}
                        </TooltipContent>
                      </Tooltip>

                      {resource.capacity && (
                        <Badge variant="secondary" className="ml-1">
                          <User className="h-3 w-3 mr-1" />
                          {resource.capacity}
                        </Badge>
                      )}

                      <Badge variant="outline" className="ml-auto">
                        {reservations.length}
                      </Badge>
                    </h3>
                    <DroppableArea
                      id={resource.id}
                      isEmpty={reservations.length === 0}
                    >
                      {reservations.length === 0 && !isDragging ? (
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
                )
              )}
            </div>
          </ScrollArea>
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
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}
