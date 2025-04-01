/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createReservation,
  updateReservation,
} from "@/lib/actions/reservation-actions";
import { toast } from "sonner";
import { useReservation } from "@/context/reservation-provider";

export function useReservationMutation(businessType: string, tenantId: string) {
  const queryClient = useQueryClient();
  const { updateLocalReservation, addLocalReservation } = useReservation();

  const createMutation = useMutation({
    mutationFn: async (reservationData: any) => {
      return createReservation(businessType, reservationData, tenantId);
    },
    onMutate: async (newReservation) => {
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

      // Create a temporary reservation with a temporary ID
      const tempReservation = {
        ...newReservation,
        id: `temp-${Date.now()}`,
        startTime: new Date(newReservation.startTime),
        endTime: new Date(newReservation.endTime),
      };

      // Add to local state for immediate UI update
      addLocalReservation(tempReservation);

      // Return a context object with the snapshot
      return { previousReservations, tempReservation };
    },
    onError: (err, newReservation, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(
        ["reservations", businessType, tenantId],
        context?.previousReservations
      );

      toast.error("Error", {
        description: "Failed to create reservation. Please try again.",
      });
    },
    onSuccess: (result, variables, context) => {
      if (result.success) {
        // Replace the temp reservation with the real one from the server
        if (result.data && context?.tempReservation) {
          queryClient.setQueryData(
            ["reservations", businessType, tenantId],
            (old: any[] | undefined) => {
              if (!old) return old;
              return old.map((reservation) =>
                reservation.id === context.tempReservation.id
                  ? { ...result.data }
                  : reservation
              );
            }
          );
        }

        toast.success("Reservation created", {
          description: "The reservation has been successfully created.",
        });
      } else {
        toast.error("Error", {
          description: result.error || "Failed to create reservation.",
        });
      }
    },
    onSettled: () => {
      // Always refetch after error or success to make sure our local data is correct
      queryClient.invalidateQueries({
        queryKey: ["reservations", businessType, tenantId],
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (reservationData: any) => {
      return updateReservation(businessType, reservationData, tenantId);
    },
    onMutate: async (updatedReservation) => {
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

      // Format dates for UI consistency
      const formattedReservation = {
        ...updatedReservation,
        startTime: new Date(updatedReservation.startTime),
        endTime: new Date(updatedReservation.endTime),
      };

      // Update local state for immediate UI update
      updateLocalReservation(formattedReservation);

      // Return a context with the snapshot
      return { previousReservations };
    },
    onError: (err, updatedReservation, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(
        ["reservations", businessType, tenantId],
        context?.previousReservations
      );

      toast.error("Error", {
        description: "Failed to update reservation. Please try again.",
      });
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Reservation updated", {
          description: "The reservation has been successfully updated.",
        });
      } else {
        toast.error("Error", {
          description: result.error || "Failed to update reservation.",
        });
      }
    },
    onSettled: () => {
      // Always refetch after error or success to make sure our local data is correct
      queryClient.invalidateQueries({
        queryKey: ["reservations", businessType, tenantId],
      });
    },
  });

  return {
    createReservation: createMutation.mutate,
    updateReservation: updateMutation.mutate,
    isPending: createMutation.isPending || updateMutation.isPending,
  };
}
