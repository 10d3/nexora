/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { createContext, useContext, useState } from "react";
import { useDashboard } from "./dashboard-provider";
import { getResources } from "@/lib/actions/resource-actions";
import { useQuery, useQueryClient } from "@tanstack/react-query";

type ResourceContextType = {
  resources: any[];
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  selectedResource: any | null;
  setSelectedResource: (resource: any | null) => void;
  view: "table" | "grid" | "list";
  setView: (view: "table" | "grid" | "list") => void;
  search: string;
  setSearch: (search: string) => void;
  statusFilter: string[];
  setStatusFilter: (status: string[]) => void;
  typeFilter: string[];
  setTypeFilter: (types: string[]) => void;
  statusOptions: string[];
  updateLocalResource: (updatedResource: any) => void;
  addLocalResource: (newResource: any) => void;
  removeLocalResource: (resourceId: string) => void;
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
  const [selectedResource, setSelectedResource] = useState<any | null>(null);
  const [view, setView] = useState<"table" | "grid" | "list">("table");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [typeFilter, setTypeFilter] = useState<string[]>([]);

  // Status options based on business type
  const statusOptions = getStatusOptionsForBusinessType(businessType);

  // Use TanStack Query for resources
  const resourcesQuery = useQuery({
    queryKey: ["resources", businessType, tenantId, statusFilter, typeFilter, search],
    queryFn: async () => {
      if (!tenantId) return [];
      const result = await getResources(businessType, tenantId, {
        status: statusFilter,
        type: typeFilter,
        search,
      });
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch resources");
      }
      return result.data || [];
    },
    enabled: !!tenantId,
  });

  // Function to refresh data
  const refreshData = async () => {
    await queryClient.invalidateQueries({
      queryKey: ["resources", businessType, tenantId],
    });
  };

  // Function to update a resource locally (optimistic update)
  const updateLocalResource = (updatedResource: any) => {
    queryClient.setQueryData(
      ["resources", businessType, tenantId, statusFilter, typeFilter, search],
      (oldData: any[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map((resource) =>
          resource.id === updatedResource.id ? updatedResource : resource
        );
      }
    );
  };

  // Function to add a resource locally (optimistic update)
  const addLocalResource = (newResource: any) => {
    queryClient.setQueryData(
      ["resources", businessType, tenantId, statusFilter, typeFilter, search],
      (oldData: any[] | undefined) => {
        if (!oldData) return [newResource];
        return [...oldData, newResource];
      }
    );
  };

  // Function to remove a resource locally (optimistic update)
  const removeLocalResource = (resourceId: string) => {
    queryClient.setQueryData(
      ["resources", businessType, tenantId, statusFilter, typeFilter, search],
      (oldData: any[] | undefined) => {
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