/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createStaff,
  updateStaff,
  deleteStaff,
} from "@/lib/actions/staff-actions";
import { BusinessType } from "@prisma/client";

export function useStaffMutation(businessType: BusinessType, tenantId: string) {
  const [isPending, setIsPending] = useState(false);
  const queryClient = useQueryClient();

  // Create staff with optimistic update
  const createStaffMember = async (staffData: any) => {
    setIsPending(true);

    try {
      // Create a temporary ID for optimistic update
      const tempId = `temp-${Date.now()}`;
      const optimisticStaff = {
        ...staffData,
        id: tempId,
      };

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["staff", businessType, tenantId],
      });

      // Snapshot the previous value
      const previousStaff = queryClient.getQueryData([
        "staff",
        businessType,
        tenantId,
      ]);

      // Optimistically add the new staff member
      queryClient.setQueryData(
        ["staff", businessType, tenantId],
        (old: any[] | undefined) => {
          return old ? [...old, optimisticStaff] : [optimisticStaff];
        }
      );

      // Create the staff member on the server
      const result = await createStaff(businessType, staffData, tenantId);

      if (result.success) {
        // Update with the actual data from the server
        queryClient.setQueryData(
          ["staff", businessType, tenantId],
          (old: any[] | undefined) => {
            if (!old) return old;
            return old.map((staff) =>
              staff.id === tempId ? { ...result.data } : staff
            );
          }
        );

        return { success: true, data: result.data };
      } else {
        // Restore the previous data if there was an error
        queryClient.setQueryData(
          ["staff", businessType, tenantId],
          previousStaff
        );

        toast.error("Error", {
          description: result.error || "Failed to create staff member",
        });

        return { success: false, error: result.error };
      }
    } catch (error) {
      toast.error("Error", {
        description: "An unexpected error occurred",
      });
      return { success: false, error: "An unexpected error occurred" };
    } finally {
      // Always refetch to ensure consistency
      queryClient.invalidateQueries({
        queryKey: ["staff", businessType, tenantId],
      });
      setIsPending(false);
    }
  };

  // Update staff with optimistic update
  const updateStaffMember = async (staffData: any) => {
    setIsPending(true);

    try {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["staff", businessType, tenantId],
      });

      // Snapshot the previous value
      const previousStaff = queryClient.getQueryData([
        "staff",
        businessType,
        tenantId,
      ]);

      // Optimistically update the staff member
      queryClient.setQueryData(
        ["staff", businessType, tenantId],
        (old: any[] | undefined) => {
          if (!old) return old;
          return old.map((staff) =>
            staff.id === staffData.id ? { ...staff, ...staffData } : staff
          );
        }
      );

      // Update the staff member on the server
      const result = await updateStaff(businessType, staffData, tenantId);

      if (result.success) {
        return { success: true, data: result.data };
      } else {
        // Restore the previous data if there was an error
        queryClient.setQueryData(
          ["staff", businessType, tenantId],
          previousStaff
        );

        toast.error("Error", {
          description: result.error || "Failed to update staff member",
        });

        return { success: false, error: result.error };
      }
    } catch (error) {
      toast.error("Error", {
        description: "An unexpected error occurred",
      });
      return { success: false, error: "An unexpected error occurred" };
    } finally {
      // Always refetch to ensure consistency
      queryClient.invalidateQueries({
        queryKey: ["staff", businessType, tenantId],
      });
      setIsPending(false);
    }
  };

  // Delete staff with optimistic update
  const deleteStaffMember = async (staffId: string) => {
    setIsPending(true);

    try {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["staff", businessType, tenantId],
      });

      // Snapshot the previous value
      const previousStaff = queryClient.getQueryData([
        "staff",
        businessType,
        tenantId,
      ]);

      // Optimistically remove the staff member
      queryClient.setQueryData(
        ["staff", businessType, tenantId],
        (old: any[] | undefined) => {
          if (!old) return old;
          return old.filter((staff) => staff.id !== staffId);
        }
      );

      // Delete the staff member on the server
      const result = await deleteStaff(staffId, tenantId);

      if (result.success) {
        return { success: true };
      } else {
        // Restore the previous data if there was an error
        queryClient.setQueryData(
          ["staff", businessType, tenantId],
          previousStaff
        );

        toast.error("Error", {
          description: result.error || "Failed to delete staff member",
        });

        return { success: false, error: result.error };
      }
    } catch (error) {
      toast.error("Error", {
        description: "An unexpected error occurred",
      });
      return { success: false, error: "An unexpected error occurred" };
    } finally {
      // Always refetch to ensure consistency
      queryClient.invalidateQueries({
        queryKey: ["staff", businessType, tenantId],
      });
      setIsPending(false);
    }
  };

  return {
    createStaffMember,
    updateStaffMember,
    deleteStaffMember,
    isPending,
  };
}
