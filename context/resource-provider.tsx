/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useDashboard } from "./dashboard-provider";
import { getResources } from "@/lib/actions/resource-actions";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import db, { IResource } from "@/lib/services/db.service";

type ResourceContextType = {
  resources: IResource[];
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  selectedResource: IResource | null;
  setSelectedResource: (resource: IResource | null) => void;
  view: "table" | "grid" | "list";
  setView: (view: "table" | "grid" | "list") => void;
  search: string;
  setSearch: (search: string) => void;
  statusFilter: string[];
  setStatusFilter: (status: string[]) => void;
  typeFilter: string[];
  setTypeFilter: (types: string[]) => void;
  statusOptions: string[];
  updateLocalResource: (updatedResource: IResource) => void;
  addLocalResource: (newResource: IResource) => void;
  removeLocalResource: (resourceId: string) => void;
  isOffline: boolean;
};

const ResourceContext = createContext<ResourceContextType | undefined>(
  undefined
);

export function ResourceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { tenantId, businessType } = useDashboard();
  const queryClient = useQueryClient();
  const [selectedResource, setSelectedResource] = useState<IResource | null>(null);
  const [view, setView] = useState<"table" | "grid" | "list">("table");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [isOffline, setIsOffline] = useState(false);

  // Check online status on mount and when it changes
  useEffect(() => {
    const handleOnlineStatus = () => {
      setIsOffline(!navigator.onLine);
    };

    // Set initial status
    setIsOffline(!navigator.onLine);

    // Add event listeners
    window.addEventListener("online", handleOnlineStatus);
    window.addEventListener("offline", handleOnlineStatus);

    // Clean up
    return () => {
      window.removeEventListener("online", handleOnlineStatus);
      window.removeEventListener("offline", handleOnlineStatus);
    };
  }, []);

  // Status options based on business type
  const statusOptions = getStatusOptionsForBusinessType(businessType);

  // Use TanStack Query for resources
  const resourcesQuery = useQuery({
    queryKey: ["resources", businessType, tenantId, statusFilter, typeFilter, search],
    queryFn: async () => {
      if (!tenantId) return [];

      try {
        // If offline, get data from IndexedDB
        if (isOffline) {
          const resources = await db.getResourcesByTenant(tenantId);

          // Apply status filter
          let filteredResources = resources;
          if (statusFilter.length > 0) {
            filteredResources = filteredResources.filter((resource) =>
              statusFilter.includes(resource.status || '')
            );
          }

          // Apply type filter
          if (typeFilter.length > 0) {
            filteredResources = filteredResources.filter((resource) =>
              typeFilter.includes(resource.type || '')
            );
          }

          // Apply search filter
          if (search) {
            const searchLower = search.toLowerCase();
            filteredResources = filteredResources.filter(
              (resource) =>
                (resource.name?.toLowerCase() || '').includes(searchLower) ||
                (resource.description?.toLowerCase() || '').includes(searchLower)
            );
          }

          return filteredResources;
        }

        // If online, get data from server
        const result = await getResources(businessType, tenantId, {
          status: statusFilter,
          type: typeFilter,
          search,
        });

        if (!result.success) {
          throw new Error(result.error || "Failed to fetch resources");
        }

        // Store the fetched data in IndexedDB for offline use
        if (result.data && Array.isArray(result.data)) {
          const resourcesWithTenantId = result.data.map(resource => ({
            ...resource,
            tenantId
          }));
          
          for (const resource of resourcesWithTenantId) {
            await db.saveResource(resource);
          }
          
          return resourcesWithTenantId;
        }

        return [];
      } catch (error) {
        console.error("Error fetching resources:", error);

        // If there's an error and we have IndexedDB data, use that as fallback
        try {
          const resources = await db.getResourcesByTenant(tenantId);
          return resources;
        } catch (dbError) {
          console.error("IndexedDB fallback failed:", dbError);
          throw error;
        }
      }
    },
    enabled: !!tenantId,
  });

  // Function to refresh data
  const refreshData = async () => {
    // Invalidate React Query cache
    await queryClient.invalidateQueries({
      queryKey: ["resources", businessType, tenantId],
    });

    // If online, process any queued actions
    if (!isOffline) {
      try {
        const queuedActions = await db.getQueuedActions();
        const resourceActions = queuedActions.filter((action) =>
          action.name.includes("resource")
        );

        if (resourceActions.length > 0) {
          console.log(
            `Processing ${resourceActions.length} queued resource actions`
          );
          // In a real app, you would process these actions here
          // This would involve calling your API endpoints with the queued data
        }
      } catch (error) {
        console.error("Error processing queued actions:", error);
      }
    }
  };

  // Function to update a resource locally (optimistic update)
  const updateLocalResource = (updatedResource: IResource) => {
    queryClient.setQueryData(
      ["resources", businessType, tenantId, statusFilter, typeFilter, search],
      (oldData: IResource[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map((resource) =>
          resource.id === updatedResource.id ? updatedResource : resource
        );
      }
    );
  };

  // Function to add a resource locally (optimistic update)
  const addLocalResource = (newResource: IResource) => {
    queryClient.setQueryData(
      ["resources", businessType, tenantId, statusFilter, typeFilter, search],
      (oldData: IResource[] | undefined) => {
        if (!oldData) return [newResource];
        return [...oldData, newResource];
      }
    );
  };

  // Function to remove a resource locally (optimistic update)
  const removeLocalResource = (resourceId: string) => {
    queryClient.setQueryData(
      ["resources", businessType, tenantId, statusFilter, typeFilter, search],
      (oldData: IResource[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.filter((resource) => resource.id !== resourceId);
      }
    );
  };

  return (
    <ResourceContext.Provider
      value={{
        resources: resourcesQuery.data || [],
        loading: resourcesQuery.isLoading,
        error: resourcesQuery.error?.message || null,
        refreshData,
        selectedResource,
        setSelectedResource,
        view,
        setView,
        search,
        setSearch,
        statusFilter,
        setStatusFilter,
        typeFilter,
        setTypeFilter,
        statusOptions,
        updateLocalResource,
        addLocalResource,
        removeLocalResource,
        isOffline,
      }}
    >
      {children}
    </ResourceContext.Provider>
  );
}

// Helper function to get status options based on business type
function getStatusOptionsForBusinessType(businessType: string | undefined) {
  switch (businessType) {
    case "RESTAURANT":
      return ["AVAILABLE", "OCCUPIED", "RESERVED", "CLEANING"];
    case "HOTEL":
      return ["AVAILABLE", "OCCUPIED", "RESERVED", "MAINTENANCE", "CLEANING"];
    case "SALON":
    case "SERVICE":
      return ["AVAILABLE", "BUSY", "ON_LEAVE", "INACTIVE"];
    default:
      return ["AVAILABLE", "UNAVAILABLE"];
  }
}

export function useResource() {
  const context = useContext(ResourceContext);
  if (context === undefined) {
    throw new Error("useResource must be used within a ResourceProvider");
  }
  return context;
}