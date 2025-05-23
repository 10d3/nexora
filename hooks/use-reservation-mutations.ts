/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createReservation,
  updateReservation,
} from "@/lib/actions/reservation-actions";
import { toast } from "sonner";
import { useReservation } from "@/context/reservation-provider";
import db, { IReservation } from "@/lib/services/db.service";

interface ReservationResult {
  success: boolean;
  data?: IReservation;
  error?: string;
}

export function useReservationMutation(businessType: string, tenantId: string) {
  const queryClient = useQueryClient();
  const { updateLocalReservation, addLocalReservation, isOffline } =
    useReservation();

  const createMutation = useMutation({
    mutationFn: async (reservationData: any): Promise<ReservationResult> => {
      // If offline, save to IndexedDB and return a temporary success response
      if (isOffline) {
        const tempId = `temp-${Date.now()}`;
        const tempReservation: IReservation = {
          ...reservationData,
          id: tempId,
          partySize: reservationData.size,
          reservationTime: new Date(reservationData.startTime),
          endTime: reservationData.endTime
            ? new Date(reservationData.endTime)
            : null,
          createdAt: new Date(),
          updatedAt: new Date(),
          tenantId,
        };

        await db.saveReservation(tempReservation);

        // Queue for later sync
        await db.saveQueuedAction({
          id: crypto.randomUUID(),
          name: "create_reservation",
          params: {
            data: reservationData,
            tenantId,
            businessType,
          },
          timestamp: new Date(),
          retries: 0,
        });

        return { success: true, data: tempReservation };
      }

      // If online, use the regular API
      const result = await createReservation(
        businessType,
        reservationData,
        tenantId
      );
      if (result.success && result.data) {
        // Convert API response to IReservation format
        const reservation: IReservation = {
          ...result.data,
          partySize: result.data.partySize,
          reservationTime: new Date(result.data.reservationTime),
          endTime: result.data.endTime ? new Date(result.data.endTime) : null,
          createdAt: new Date(result.data.createdAt),
          updatedAt: new Date(result.data.updatedAt),
          tenantId,
        };
        return { success: true, data: reservation };
      }
      return result;
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
        partySize: newReservation.size,
        reservationTime: new Date(newReservation.startTime),
        endTime: newReservation.endTime
          ? new Date(newReservation.endTime)
          : null,
        createdAt: new Date(),
        updatedAt: new Date(),
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

          // Also update in IndexedDB if we got a server response
          if (!isOffline) {
            db.saveReservation(result.data).catch((error: Error) =>
              console.error("Error saving reservation to IndexedDB:", error)
            );
          }
        }

        toast.success("Reservation created", {
          description: isOffline
            ? "The reservation has been saved locally and will sync when you're back online."
            : "The reservation has been successfully created.",
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
    mutationFn: async (reservationData: any): Promise<ReservationResult> => {
      // If offline, update in IndexedDB and return a temporary success response
      if (isOffline) {
        const updatedReservation: IReservation = {
          ...reservationData,
          partySize: reservationData.size,
          reservationTime: new Date(reservationData.startTime),
          endTime: reservationData.endTime
            ? new Date(reservationData.endTime)
            : null,
          updatedAt: new Date(),
          tenantId,
        };

        await db.saveReservation(updatedReservation);

        // Queue for later sync
        await db.saveQueuedAction({
          id: crypto.randomUUID(),
          name: "update_reservation",
          params: {
            data: reservationData,
            tenantId,
            businessType,
          },
          timestamp: new Date(),
          retries: 0,
        });

        return { success: true, data: updatedReservation };
      }

      // If online, use the regular API
      const result = await updateReservation(
        businessType,
        reservationData,
        tenantId
      );
      if (result.success && result.data) {
        // Convert API response to IReservation format
        const reservation: IReservation = {
          ...result.data,
          partySize: result.data.partySize,
          reservationTime: new Date(result.data.reservationTime),
          endTime: result.data.endTime ? new Date(result.data.endTime) : null,
          createdAt: new Date(result.data.createdAt),
          updatedAt: new Date(result.data.updatedAt),
          tenantId,
        };
        return { success: true, data: reservation };
      }
      return result;
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
        partySize: updatedReservation.size,
        reservationTime: new Date(updatedReservation.startTime),
        endTime: updatedReservation.endTime
          ? new Date(updatedReservation.endTime)
          : null,
        updatedAt: new Date(),
        tenantId: updatedReservation.tenantId,
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
          description: isOffline
            ? "The reservation has been updated locally and will sync when you're back online."
            : "The reservation has been successfully updated.",
        });

        // Also update in IndexedDB if we got a server response
        if (!isOffline && result.data) {
          db.saveReservation(result.data).catch((error: Error) =>
            console.error("Error updating reservation in IndexedDB:", error)
          );
        }
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
