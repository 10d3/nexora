/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createResource,
  updateResource,
  deleteResource,
} from "@/lib/actions/resource-actions";
import { toast } from "sonner";
import { useResource } from "@/context/resource-provider";
import { useDashboard } from "@/context/dashboard-provider";
import db from "@/lib/services/db.service";

export function useResourceMutation() {
  const { tenantId, businessType } = useDashboard();
  const queryClient = useQueryClient();
  const { updateLocalResource, addLocalResource, removeLocalResource, isOffline } =
    useResource();

  // Validation function based on business type
  const validateResourceData = (resourceData: any) => {
    console.log("Validating resource data:", { businessType, resourceData });

    if (!businessType || !tenantId) {
      return {
        isValid: false,
        error: "Business type and tenant ID are required",
      };
    }

    switch (businessType) {
      case "RESTAURANT":
        // Convert and validate table data
        const tableData = {
          ...resourceData,
          number: String(resourceData.number),
          capacity: Number(resourceData.capacity),
        };

        if (!tableData.number || tableData.number.trim() === "") {
          return { isValid: false, error: "Table number is required" };
        }
        if (isNaN(tableData.capacity) || tableData.capacity <= 0) {
          return { isValid: false, error: "Valid capacity is required" };
        }
        return {
          isValid: true,
          data: tableData,
        };

      case "HOTEL":
        // Convert and validate room data
        const roomData = {
          ...resourceData,
          number: String(resourceData.name),
          capacity: Number(resourceData.capacity),
          rate: Number(resourceData.rate),
          type: String(resourceData.roomType)
        };

        if (!roomData.number || roomData.number.trim() === "") {
          return { isValid: false, error: "Room number is required" };
        }
        if (isNaN(roomData.capacity) || roomData.capacity <= 0) {
          return { isValid: false, error: "Valid capacity is required" };
        }
        if (!roomData.type) {
          return { isValid: false, error: "Room type is required" };
        }
        if (isNaN(roomData.rate) || roomData.rate <= 0) {
          return { isValid: false, error: "Valid rate is required" };
        }
        return {
          isValid: true,
          data: roomData,
        };

      case "SALON":
      case "OTHER":
        if (!resourceData.name || resourceData.name.trim() === "") {
          return { isValid: false, error: "Asset name is required" };
        }
        if (!resourceData.type || resourceData.type.trim() === "") {
          return { isValid: false, error: "Asset type is required" };
        }
        return {
          isValid: true,
          data: resourceData,
        };

      case "SERVICE":
        if (!resourceData.name || resourceData.name.trim() === "") {
          return { isValid: false, error: "Name is required" };
        }
        if (!resourceData.email || resourceData.email.trim() === "") {
          return { isValid: false, error: "Email is required" };
        }
        if (
          !resourceData.specialization ||
          resourceData.specialization.trim() === ""
        ) {
          return { isValid: false, error: "Specialization is required" };
        }
        return {
          isValid: true,
          data: resourceData,
        };

      default:
        return {
          isValid: false,
          error: `Unsupported business type: ${businessType}`,
        };
    }
  };

  const createMutation = useMutation({
    mutationFn: async (resourceData: any) => {
      // Validate and format data before sending to server
      const validation = validateResourceData(resourceData);
      if (!validation.isValid) {
        console.error("Validation failed:", validation.error);
        throw new Error(validation.error || "Validation failed");
      }

      // If offline, save to IndexedDB and return a temporary success response
      if (isOffline) {
        const tempId = `temp-${Date.now()}`;
        const tempResource = {
          ...validation.data,
          id: tempId,
          tenantId,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        await db.saveResource(tempResource);

        // Queue for later sync
        await db.saveQueuedAction({
          id: crypto.randomUUID(),
          name: "create_resource",
          params: {
            data: validation.data,
            tenantId,
            businessType
          },
          timestamp: new Date(),
          retries: 0
        });

        return { success: true, data: tempResource };
      }

      // If online, use the regular API
      return createResource(
        businessType,
        validation.data || resourceData,
        tenantId as string
      );
    },
    onMutate: async (newResource) => {
      await queryClient.cancelQueries({
        queryKey: ["resources", businessType, tenantId],
      });

      const previousResources = queryClient.getQueryData([
        "resources",
        businessType,
        tenantId,
      ]);

      const tempResource = {
        ...newResource,
        id: `temp-${Date.now()}`,
        tenantId,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      addLocalResource(tempResource);

      return { previousResources, tempResource };
    },
    onError: (err, newResource, context) => {
      console.error("Mutation error:", err);
      queryClient.setQueryData(
        ["resources", businessType, tenantId],
        context?.previousResources
      );

      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";
      toast.error("Error creating resource", {
        description: errorMessage,
      });
    },
    onSuccess: (result, variables, context) => {
      if (result.success) {
        if (result.data && context?.tempResource) {
          queryClient.setQueryData(
            ["resources", businessType, tenantId],
            (old: any[] | undefined) => {
              if (!old) return [result.data];
              return old.map((resource) =>
                resource.id === context.tempResource.id ? result.data : resource
              );
            }
          );

          // Also update in IndexedDB if we got a server response
          if (!isOffline) {
            db.saveResource({
              ...result.data,
              tenantId,
            }).catch((error: Error) => 
              console.error("Error saving resource to IndexedDB:", error)
            );
          }
        }

        toast.success("Resource created", {
          description: isOffline
            ? "The resource has been saved locally and will sync when you're back online."
            : "The resource has been successfully created.",
        });
      } else {
        toast.error("Error", {
          description: "Failed to create resource",
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["resources", businessType, tenantId],
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (resourceData: any) => {
      const validation = validateResourceData(resourceData);
      if (!validation.isValid) {
        throw new Error(validation.error || "Validation failed");
      }

      // If offline, update in IndexedDB and return a temporary success response
      if (isOffline) {
        const updatedResource = {
          ...validation.data,
          tenantId,
          updatedAt: new Date()
        };

        await db.saveResource(updatedResource);

        // Queue for later sync
        await db.saveQueuedAction({
          id: crypto.randomUUID(),
          name: "update_resource",
          params: {
            data: validation.data,
            tenantId,
            businessType
          },
          timestamp: new Date(),
          retries: 0
        });

        return { success: true, data: updatedResource };
      }

      // If online, use the regular API
      return updateResource(businessType, validation.data, tenantId as string);
    },
    onMutate: async (updatedResource) => {
      await queryClient.cancelQueries({
        queryKey: ["resources", businessType, tenantId],
      });

      const previousResources = queryClient.getQueryData([
        "resources",
        businessType,
        tenantId,
      ]);

      updateLocalResource(updatedResource);

      return { previousResources };
    },
    onError: (err, updatedResource, context) => {
      queryClient.setQueryData(
        ["resources", businessType, tenantId],
        context?.previousResources
      );

      if (err instanceof Error) {
        toast.error("Error", {
          description: err.message,
        });
      } else {
        toast.error("Error updating resource", {
          description: "Please try again",
        });
      }
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Resource updated", {
          description: isOffline
            ? "The resource has been updated locally and will sync when you're back online."
            : "The resource has been successfully updated.",
        });

        // Also update in IndexedDB if we got a server response
        if (!isOffline && result.data) {
          db.saveResource({
            ...result.data,
            tenantId,
          }).catch((error: Error) => 
            console.error("Error updating resource in IndexedDB:", error)
          );
        }
      } else {
        toast.error("Error", {
          description: "Failed to update resource",
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["resources", businessType, tenantId],
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (resourceId: string) => {
      // If offline, queue the delete and return a temporary success response
      if (isOffline) {
        // Get the resource first to preserve it in the delete queue
        const resource = await db.getResource(resourceId);

        if (resource) {
          // Queue for later sync
          await db.saveQueuedAction({
            id: crypto.randomUUID(),
            name: "delete_resource",
            params: {
              resourceId,
              tenantId,
              businessType
            },
            timestamp: new Date(),
            retries: 0
          });
        }

        return { success: true };
      }

      // If online, use the regular API
      return deleteResource(businessType, resourceId, tenantId as string);
    },
    onMutate: async (resourceId) => {
      await queryClient.cancelQueries({
        queryKey: ["resources", businessType, tenantId],
      });

      const previousResources = queryClient.getQueryData([
        "resources",
        businessType,
        tenantId,
      ]);

      removeLocalResource(resourceId);

      return { previousResources };
    },
    onError: (err, resourceId, context) => {
      queryClient.setQueryData(
        ["resources", businessType, tenantId],
        context?.previousResources
      );

      if (err instanceof Error) {
        toast.error("Error", {
          description: err.message,
        });
      } else {
        toast.error("Error deleting resource", {
          description: "Please try again",
        });
      }
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Resource deleted", {
          description: isOffline
            ? "The resource has been marked for deletion and will be removed when you're back online."
            : "The resource has been successfully deleted.",
        });
      } else {
        toast.error("Error", {
          description: "Failed to delete resource",
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["resources", businessType, tenantId],
      });
    },
  });

  return {
    createResource: createMutation.mutate,
    updateResource: updateMutation.mutate,
    deleteResource: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isPending:
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending,
  };
}
