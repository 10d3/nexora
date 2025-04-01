/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import StaffForm from "./staff-form";
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
import { StaffTableSkeleton } from "./staff-skeleton";
import { useStaff } from "@/context/staff-provider";
import { useDashboard } from "@/context/dashboard-provider";
import { useStaffMutation } from "@/hooks/use-staff-mutations";

export default function StaffTable() {
  const { staff, loading } = useStaff();
  const { tenantId, businessType } = useDashboard();
  const [editingStaff, setEditingStaff] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<any>(null);

  // Use the staff mutations hook
  const { updateStaffMember, deleteStaffMember, isPending } = useStaffMutation(
    businessType || "RETAIL",
    tenantId || ""
  );

  const handleEdit = (staff: any) => {
    console.log("Editing staff:", staff); // Add this log statement
    setEditingStaff(staff);
  };

  const handleDelete = (staff: any) => {
    setStaffToDelete(staff);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!staffToDelete) return;

    // Use the optimistic delete function
    const result = await deleteStaffMember(staffToDelete.id);

    if (result.success) {
      toast.success("Staff member deleted", {
        description: "The staff member has been deleted successfully.",
      });
    }

    setIsDeleteDialogOpen(false);
    setStaffToDelete(null);
  };

  const handleEditSuccess = async (staffData: any) => {
    // If staffData already has an ID (from the form), use that
    // Otherwise, ensure we're using the ID from editingStaff
    const updatedStaffData = {
      ...staffData,
      id: staffData.id || editingStaff.id,
    };

    // Use the optimistic update function
    const result = await updateStaffMember(updatedStaffData);

    if (result.success) {
      setEditingStaff(null);
      toast.success("Staff member updated", {
        description: "The staff member has been updated successfully.",
      });
    }
  };

  if (loading) {
    return <StaffTableSkeleton />;
  }

  if (staff.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No team members found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Specialization</TableHead>
                <TableHead>Services</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staff.map((member) => {
                const isTemporary = member.id.startsWith("temp-");

                return (
                  <TableRow
                    key={member.id}
                    className={isTemporary ? "opacity-70" : ""}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={member.image || ""} />
                          <AvatarFallback>
                            {member.name
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{member.name}</div>
                          {isTemporary && (
                            <div className="text-xs text-muted-foreground">
                              Creating...
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {member.email && <div>{member.email}</div>}
                        {member.phone && <div>{member.phone}</div>}
                      </div>
                    </TableCell>
                    <TableCell>
                      {member.specialization && (
                        <Badge variant="outline">{member.specialization}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {member.services &&
                          member.services.slice(0, 2).map((service: any) => (
                            <Badge
                              key={service.id}
                              variant="secondary"
                              className="text-xs"
                            >
                              {service.name}
                            </Badge>
                          ))}
                        {member.services && member.services.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{member.services.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            disabled={isTemporary || isPending}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(member)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(member)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Staff Form */}
      <StaffForm
        open={!!editingStaff}
        onOpenChange={(open) => {
          if (!open) setEditingStaff(null);
        }}
        staff={editingStaff}
        onSuccess={handleEditSuccess}
        businessType={businessType || "RETAIL"}
        tenantId={tenantId || ""}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              team member and remove their data from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
