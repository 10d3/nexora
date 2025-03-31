/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
// import { useStaff } from "@/providers/staff-provider";
// import { useDashboard } from "@/providers/dashboard-provider";
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
import { deleteStaff } from "@/lib/actions/staff-actions";
import { useStaff } from "@/context/staff-provider";
import { useDashboard } from "@/context/dashboard-provider";

export default function StaffTable() {
  const { staff, loading, refreshData } = useStaff();
  const { tenantId, businessType } = useDashboard();
  const [editingStaff, setEditingStaff] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<any>(null);

  const handleEdit = (staff: any) => {
    setEditingStaff(staff);
  };

  const handleDelete = (staff: any) => {
    setStaffToDelete(staff);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!staffToDelete) return;

    try {
      const result = await deleteStaff(staffToDelete.id, tenantId as string);

      if (result.success) {
        toast.success("Staff member deleted", {
          description: "The staff member has been deleted successfully.",
        });
        refreshData();
      } else {
        toast.error("Error", {
          description: result.error || "Failed to delete staff member",
        });
      }
    } catch (error) {
      toast.error("Error", {
        description: "An unexpected error occurred",
      });
      console.error(error);
    } finally {
      setIsDeleteDialogOpen(false);
      setStaffToDelete(null);
    }
  };

  const handleEditSuccess = () => {
    refreshData();
    setEditingStaff(null);
    toast.success("Staff member updated", {
      description: "The staff member has been updated successfully.",
    });
  };

  if (loading) {
    return <StaffTableSkeleton />;
  }

  if (staff.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-6 text-center">
          <p className="text-muted-foreground mb-4">No team members found</p>
          <p className="text-sm text-muted-foreground">
            Add team members to get started or try a different search.
          </p>
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
                <TableHead>Specialization</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Services</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staff.map((member:any) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage
                          src={member.image || ""}
                          alt={member.name}
                        />
                        <AvatarFallback>
                          {member.name
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        {member.bio && (
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {member.bio}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {member.specialization ? (
                      <Badge variant="outline">{member.specialization}</Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">
                        Not specified
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {member.email && (
                        <p className="text-sm">{member.email}</p>
                      )}
                      {member.phone && (
                        <p className="text-sm">{member.phone}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {member.services && member.services.length > 0 ? (
                        member.services.slice(0, 2).map((service: any) => (
                          <Badge
                            key={service.id}
                            variant="secondary"
                            className="text-xs"
                          >
                            {service.name}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground text-sm">
                          No services
                        </span>
                      )}
                      {member.services && member.services.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{member.services.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(member)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(member)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {editingStaff && (
        <StaffForm
          open={!!editingStaff}
          onOpenChange={() => setEditingStaff(null)}
          onSuccess={handleEditSuccess}
          staff={editingStaff}
          businessType={businessType}
        />
      )}

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {staffToDelete?.name}. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
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
