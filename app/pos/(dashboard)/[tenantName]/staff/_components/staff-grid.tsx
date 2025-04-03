/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
// import { useStaff } from "@/providers/staff-provider";
// import { useDashboard } from "@/providers/dashboard-provider";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Mail, Phone, MoreVertical, Pencil, Trash2 } from "lucide-react";
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
// import { deleteStaff } from "@/actions/get-staff";
import { toast } from "sonner";
import { StaffGridSkeleton } from "./staff-skeleton";
import { useStaff } from "@/context/staff-provider";
import { useDashboard } from "@/context/dashboard-provider";
import { deleteStaff } from "@/lib/actions/staff-actions";

export default function StaffGrid() {
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
    return <StaffGridSkeleton />;
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {staff.map((member) => (
          <Card key={member.id} className="overflow-hidden">
            <CardHeader className="relative p-0">
              <div className="absolute top-2 right-2 z-10">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 bg-background/80 backdrop-blur-sm"
                    >
                      <MoreVertical className="h-4 w-4" />
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
              </div>
              <div className="h-32 bg-gradient-to-r from-primary/20 to-primary/10" />
            </CardHeader>
            <CardContent className="pt-0 relative -mt-12 space-y-4">
              <div className="flex flex-col items-center">
                <Avatar className="h-24 w-24 border-4 border-background">
                  <AvatarImage src={member.image || ""} alt={member.name} />
                  <AvatarFallback className="text-2xl">
                    {member.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h3 className="mt-2 font-semibold text-lg">{member.name}</h3>
                {member.specialization && (
                  <Badge variant="secondary" className="mt-1">
                    {member.specialization}
                  </Badge>
                )}
              </div>

              {member.bio && (
                <p className="text-sm text-muted-foreground text-center line-clamp-2">
                  {member.bio}
                </p>
              )}

              <div className="flex flex-col gap-2">
                {member.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{member.email}</span>
                  </div>
                )}
                {member.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{member.phone}</span>
                  </div>
                )}
              </div>
            </CardContent>
            {member.services && member.services.length > 0 && (
              <CardFooter className="border-t pt-4 pb-4 flex flex-wrap gap-1">
                {member.services.map((service: any) => (
                  <Badge key={service.id} variant="outline" className="text-xs">
                    {service.name}
                  </Badge>
                ))}
              </CardFooter>
            )}
          </Card>
        ))}
      </div>

      {editingStaff && (
        <StaffForm
          tenantId={tenantId as string}
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
