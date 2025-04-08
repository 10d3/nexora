/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useReservation } from "@/context/reservation-provider";
import { useDashboard } from "@/context/dashboard-provider";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  MoreHorizontal,
  Edit,
  Trash,
  Check,
  X,
  User,
  Calendar,
  MapPin,
  Clock,
} from "lucide-react";
import { useState } from "react";
import { ReservationDialog } from "../reservation-dialog";
import { deleteReservation } from "@/lib/actions/reservation-actions";
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
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useReservationMutation } from "@/hooks/use-reservation-mutations";
import { useQueryClient } from "@tanstack/react-query";
import { CustomPagination } from "@/components/shared/custom-pagination";

export function ReservationTable() {
  const { reservations, setSelectedReservation } = useReservation();
  const { tenantId, businessType } = useDashboard();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const queryClient = useQueryClient();

  // Use the reservation mutations hook
  const { updateReservation, isPending } = useReservationMutation(
    businessType || "RETAIL",
    tenantId || ""
  );

  // Calculate pagination
  const totalPages = Math.ceil(reservations.length / rowsPerPage);
  const paginatedReservations = reservations.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
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

  const handleStatusChange = async (id: string, status: string) => {
    const reservation = reservations.find((r) => r.id === id);
    if (!reservation) return;

    // Create updated reservation object
    const updatedReservation = {
      ...reservation,
      status,
    };

    // Use the mutation from the hook which handles optimistic updates
    updateReservation(updatedReservation);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "CONFIRMED":
      case "COMPLETED":
      case "CHECKED_IN":
      case "CHECKED_OUT":
        return "default";
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

  // Rest of the component remains the same
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "CONFIRMED":
      case "COMPLETED":
      case "CHECKED_IN":
      case "CHECKED_OUT":
        return <Check className="h-3 w-3 mr-1" />;
      case "PENDING":
      case "SCHEDULED":
      case "WAITING_LIST":
        return <Clock className="h-3 w-3 mr-1" />;
      case "CANCELLED":
      case "NO_SHOW":
        return <X className="h-3 w-3 mr-1" />;
      default:
        return null;
    }
  };

  const toggleRowSelection = (id: string) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const toggleAllRows = () => {
    if (selectedRows.length === paginatedReservations.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(paginatedReservations.map((r) => r.id));
    }
  };

  return (
    <>
      <Card className="border-none shadow-md bg-background">
        <CardContent className="p-0">
          <div className="overflow-hidden rounded-md">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="hover:bg-muted/50">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={
                        selectedRows.length === paginatedReservations.length &&
                        paginatedReservations.length > 0
                      }
                      onCheckedChange={toggleAllRows}
                      aria-label="Select all"
                    />
                  </TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Size</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedReservations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No reservations found.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedReservations.map((reservation) => (
                    <TableRow
                      key={reservation.id}
                      className={cn(
                        "border-b border-border/40",
                        selectedRows.includes(reservation.id) && "bg-muted/20",
                        reservation.id.startsWith("temp-") && "opacity-70" // Style for optimistic updates
                      )}
                    >
                      <TableCell className="w-12">
                        <Checkbox
                          checked={selectedRows.includes(reservation.id)}
                          onCheckedChange={() =>
                            toggleRowSelection(reservation.id)
                          }
                          aria-label={`Select ${reservation.customerName}`}
                          disabled={reservation.id.startsWith("temp-")}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div>{reservation.customerName}</div>
                            <div className="text-xs text-muted-foreground">
                              {reservation.customerEmail || "No email"}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-start gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div>
                            <div>
                              {format(
                                new Date(reservation.startTime),
                                "MMM d, yyyy"
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {format(
                                new Date(reservation.startTime),
                                "h:mm a"
                              )}
                              {reservation.endTime &&
                                ` - ${format(new Date(reservation.endTime), "h:mm a")}`}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {reservation.resourceName || "Unassigned"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getStatusBadgeVariant(reservation.status)}
                          className="flex items-center w-fit"
                        >
                          {getStatusIcon(reservation.status)}
                          {reservation.status.replace(/_/g, " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center font-medium">
                        {reservation.size || 1}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 p-0"
                              disabled={
                                reservation.id.startsWith("temp-") || isPending
                              }
                            >
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleEdit(reservation.id)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedId(reservation.id);
                                setDeleteDialogOpen(true);
                              }}
                              className="text-destructive"
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusChange(reservation.id, "CONFIRMED")
                              }
                            >
                              <Check className="mr-2 h-4 w-4" />
                              Confirm
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusChange(reservation.id, "CANCELLED")
                              }
                            >
                              <X className="mr-2 h-4 w-4" />
                              Cancel
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <CustomPagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={rowsPerPage}
          totalItems={reservations.length}
          selectedItems={selectedRows.length}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setRowsPerPage(size);
            setCurrentPage(1);
          }}
        />
        </CardContent>
      </Card>

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
