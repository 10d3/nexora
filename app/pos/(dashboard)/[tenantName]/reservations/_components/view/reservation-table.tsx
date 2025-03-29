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
import { MoreHorizontal, Edit, Trash, Check, X } from "lucide-react";
import { useState } from "react";
import { ReservationDialog } from "../reservation-dialog";
import {
  deleteReservation,
  updateReservationStatus,
} from "@/lib/actions/reservation-actions";
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

export function ReservationTable() {
  const { reservations, refreshData, setSelectedReservation } =
    useReservation();
  const { tenantId, businessType } = useDashboard();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

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

  const handleStatusChange = async (id: string, status: string) => {
    const result = await updateReservationStatus(
      businessType || "RETAIL",
      id,
      status,
      tenantId || ""
    );

    if (result.success) {
      toast.success("Status updated", {
        description: `Reservation status changed to ${status.replace(/_/g, " ")}`,
      });
      refreshData();
    } else {
      toast.error("Error", {
        description: result.error || "Failed to update status.",
      });
    }
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
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Resource</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reservations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No reservations found.
                </TableCell>
              </TableRow>
            ) : (
              reservations.map((reservation) => (
                <TableRow key={reservation.id}>
                  <TableCell className="font-medium">
                    <div>{reservation.customerName}</div>
                    <div className="text-sm text-muted-foreground">
                      {reservation.customerEmail || "No email"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      {format(new Date(reservation.startTime), "MMM d, yyyy")}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(reservation.startTime), "h:mm a")}
                      {reservation.endTime &&
                        ` - ${format(new Date(reservation.endTime), "h:mm a")}`}
                    </div>
                  </TableCell>
                  <TableCell>
                    {reservation.resourceName || "Unassigned"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(reservation.status)}>
                      {reservation.status.replace(/_/g, " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
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