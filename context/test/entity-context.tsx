/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext, useContext, useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import db from "@/lib/services/db.service";

// Define the base entity types
type EntityType =
  | "customer"
  | "order"
  | "resource"
  | "menu"
  | "inventory"
  | "staff"
  | "reservation";

type EntityConfig = {
  [K in EntityType]: {
    actions: {
      create: (data: any, tenantId: string) => Promise<any>;
      update: (data: any, tenantId: string) => Promise<any>;
      delete: (id: string, tenantId: string) => Promise<any>;
      get: (tenantId: string, params?: any) => Promise<any>;
    };
    dbService: {
      save: (data: any) => Promise<void>;
      getByTenant: (tenantId: string) => Promise<any[]>;
      delete: (id: string) => Promise<void>;
    };
    defaultSortBy: string;
    searchFields: string[];
    validateData?: (data: any) => {
      isValid: boolean;
      error?: string;
      data?: any;
    };
  };
};

type EntityContextType = {
  // Common state
  selectedEntity: EntityType;
  setSelectedEntity: (entity: EntityType) => void;
  isOffline: boolean;

  // Data state
  data: any[];
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;

  // Selection state
  selectedItem: any | null;
  setSelectedItem: (item: any | null) => void;

  // Filtering and sorting
  search: string;
  setSearch: (search: string) => void;
  sortBy: string;
  setSortBy: (sortBy: string) => void;
  sortOrder: "asc" | "desc";
  setSortOrder: (sortOrder: "asc" | "desc") => void;

  // Pagination
  limit: number;
  setLimit: (limit: number) => void;
  offset: number;
  setOffset: (offset: number) => void;
  totalItems: number;

  // Local updates
  updateLocalItem: (updatedItem: any) => void;
  addLocalItem: (newItem: any) => void;
  removeLocalItem: (id: string) => void;

  // Mutations
  mutations: {
    create: ReturnType<
      typeof useMutation<any, Error, any, { previousData: unknown }>
    >;
    update: ReturnType<
      typeof useMutation<any, Error, any, { previousData: unknown }>
    >;
    delete: ReturnType<
      typeof useMutation<any, Error, string, { previousData: unknown }>
    >;
  };
};

const EntityContext = createContext<EntityContextType | undefined>(undefined);

export function EntityProvider({
  children,
  tenantId,
  businessType,
  config,
}: {
  children: React.ReactNode;
  tenantId: string;
  businessType?: string;
  config: EntityConfig;
}) {
  const queryClient = useQueryClient();
  const [selectedEntity, setSelectedEntity] = useState<EntityType>("customer");
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState(config[selectedEntity].defaultSortBy);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(0);
  const [isOffline, setIsOffline] = useState(false);

  // Online status handling
  useEffect(() => {
    const handleOnlineStatus = () => setIsOffline(!navigator.onLine);
    setIsOffline(!navigator.onLine);
    window.addEventListener("online", handleOnlineStatus);
    window.addEventListener("offline", handleOnlineStatus);
    return () => {
      window.removeEventListener("online", handleOnlineStatus);
      window.removeEventListener("offline", handleOnlineStatus);
    };
  }, []);

  // Update sortBy when entity changes
  useEffect(() => {
    setSortBy(config[selectedEntity].defaultSortBy);
  }, [selectedEntity, config]);

  // Query setup
  const query = useQuery({
    queryKey: [
      selectedEntity,
      tenantId,
      businessType,
      search,
      sortBy,
      sortOrder,
      limit,
      offset,
    ],
    queryFn: async () => {
      if (!tenantId) return { data: [], meta: { total: 0 } };

      try {
        if (isOffline) {
          const items =
            await config[selectedEntity].dbService.getByTenant(tenantId);
          let filteredItems = items;

          // Apply search filter
          if (search && config[selectedEntity].searchFields) {
            const searchLower = search.toLowerCase();
            filteredItems = items.filter((item) =>
              config[selectedEntity].searchFields.some((field) =>
                String(item[field]).toLowerCase().includes(searchLower)
              )
            );
          }

          // Apply sorting
          filteredItems.sort((a, b) => {
            const valueA = a[sortBy] || "";
            const valueB = b[sortBy] || "";
            return sortOrder === "asc"
              ? String(valueA).localeCompare(String(valueB))
              : String(valueB).localeCompare(String(valueA));
          });

          // Apply pagination
          const total = filteredItems.length;
          const paginatedItems = filteredItems.slice(offset, offset + limit);

          return { data: paginatedItems, meta: { total } };
        }

        // Online mode
        const result = await config[selectedEntity].actions.get(tenantId, {
          search,
          sortBy,
          sortOrder,
          limit,
          offset,
          businessType,
        });

        if (!result.success) {
          throw new Error(result.error || `Failed to fetch ${selectedEntity}`);
        }

        // Store in IndexedDB for offline use
        if (result.data && Array.isArray(result.data)) {
          for (const item of result.data) {
            await config[selectedEntity].dbService.save(item);
          }
        }

        return result;
      } catch (error) {
        console.error(`Error fetching ${selectedEntity}:`, error);
        // Fallback to IndexedDB
        const items =
          await config[selectedEntity].dbService.getByTenant(tenantId);
        return {
          data: items.slice(offset, offset + limit),
          meta: { total: items.length },
        };
      }
    },
    enabled: !!tenantId,
  });

  // Mutations setup
  const mutations = {
    create: useMutation({
      mutationFn: async (data: any) => {
        if (isOffline) {
          const tempId = `temp-${Date.now()}`;
          const tempItem = { ...data, id: tempId, tenantId };
          await config[selectedEntity].dbService.save(tempItem);
          await db.saveQueuedAction({
            id: crypto.randomUUID(),
            name: `create_${selectedEntity}`,
            params: { data, tenantId, businessType },
            timestamp: new Date(),
            retries: 0,
          });
          return { success: true, data: tempItem };
        }
        return config[selectedEntity].actions.create(data, tenantId);
      },
      onMutate: async (newItem) => {
        await queryClient.cancelQueries({
          queryKey: [selectedEntity, tenantId, businessType],
        });
        const previousData = queryClient.getQueryData([
          selectedEntity,
          tenantId,
          businessType,
        ]);
        addLocalItem(newItem);
        return { previousData };
      },
      onError: (err, newItem, context) => {
        queryClient.setQueryData(
          [selectedEntity, tenantId, businessType],
          context?.previousData
        );
        toast.error("Error", {
          description: `Failed to create ${selectedEntity}. Please try again.`,
        });
      },
      onSuccess: (result) => {
        if (result.success) {
          toast.success(`${selectedEntity} created`, {
            description: isOffline
              ? `The ${selectedEntity} has been saved locally and will sync when you're back online.`
              : `The ${selectedEntity} has been successfully created.`,
          });
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: [selectedEntity, tenantId, businessType],
        });
      },
    }),

    update: useMutation({
      mutationFn: async (data: any) => {
        if (isOffline) {
          await config[selectedEntity].dbService.save({ ...data, tenantId });
          await db.saveQueuedAction({
            id: crypto.randomUUID(),
            name: `update_${selectedEntity}`,
            params: { data, tenantId, businessType },
            timestamp: new Date(),
            retries: 0,
          });
          return { success: true, data };
        }
        return config[selectedEntity].actions.update(data, tenantId);
      },
      onMutate: async (updatedItem) => {
        await queryClient.cancelQueries({
          queryKey: [selectedEntity, tenantId, businessType],
        });
        const previousData = queryClient.getQueryData([
          selectedEntity,
          tenantId,
          businessType,
        ]);
        updateLocalItem(updatedItem);
        return { previousData };
      },
      onError: (err, updatedItem, context) => {
        queryClient.setQueryData(
          [selectedEntity, tenantId, businessType],
          context?.previousData
        );
        toast.error("Error", {
          description: `Failed to update ${selectedEntity}. Please try again.`,
        });
      },
      onSuccess: (result) => {
        if (result.success) {
          toast.success(`${selectedEntity} updated`, {
            description: isOffline
              ? `The ${selectedEntity} has been updated locally and will sync when you're back online.`
              : `The ${selectedEntity} has been successfully updated.`,
          });
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: [selectedEntity, tenantId, businessType],
        });
      },
    }),

    delete: useMutation({
      mutationFn: async (id: string) => {
        if (isOffline) {
          await config[selectedEntity].dbService.delete(id);
          await db.saveQueuedAction({
            id: crypto.randomUUID(),
            name: `delete_${selectedEntity}`,
            params: { id, tenantId, businessType },
            timestamp: new Date(),
            retries: 0,
          });
          return { success: true };
        }
        return config[selectedEntity].actions.delete(id, tenantId);
      },
      onMutate: async (id) => {
        await queryClient.cancelQueries({
          queryKey: [selectedEntity, tenantId, businessType],
        });
        const previousData = queryClient.getQueryData([
          selectedEntity,
          tenantId,
          businessType,
        ]);
        removeLocalItem(id);
        return { previousData };
      },
      onError: (err, id, context) => {
        queryClient.setQueryData(
          [selectedEntity, tenantId, businessType],
          context?.previousData
        );
        toast.error("Error", {
          description: `Failed to delete ${selectedEntity}. Please try again.`,
        });
      },
      onSuccess: (result) => {
        if (result.success) {
          toast.success(`${selectedEntity} deleted`, {
            description: isOffline
              ? `The ${selectedEntity} has been marked for deletion and will be removed when you're back online.`
              : `The ${selectedEntity} has been successfully deleted.`,
          });
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: [selectedEntity, tenantId, businessType],
        });
      },
    }),
  };

  // Local update functions
  const addLocalItem = (newItem: any) => {
    queryClient.setQueryData(
      [
        selectedEntity,
        tenantId,
        businessType,
        search,
        sortBy,
        sortOrder,
        limit,
        offset,
      ],
      (old: any) => ({
        ...old,
        data: [newItem, ...(old?.data || [])],
        meta: { total: (old?.meta?.total || 0) + 1 },
      })
    );
  };

  const updateLocalItem = (updatedItem: any) => {
    queryClient.setQueryData(
      [
        selectedEntity,
        tenantId,
        businessType,
        search,
        sortBy,
        sortOrder,
        limit,
        offset,
      ],
      (old: any) => ({
        ...old,
        data: old.data.map((item: any) =>
          item.id === updatedItem.id ? updatedItem : item
        ),
      })
    );
  };

  const removeLocalItem = (id: string) => {
    queryClient.setQueryData(
      [
        selectedEntity,
        tenantId,
        businessType,
        search,
        sortBy,
        sortOrder,
        limit,
        offset,
      ],
      (old: any) => ({
        ...old,
        data: old.data.filter((item: any) => item.id !== id),
        meta: { total: old.meta.total - 1 },
      })
    );
  };

  const value = {
    selectedEntity,
    setSelectedEntity,
    isOffline,
    data: query.data?.data || [],
    loading: query.isLoading,
    error: query.error?.message || null,
    refreshData: async () => {
      await query.refetch();
    },
    selectedItem,
    setSelectedItem,
    search,
    setSearch,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    updateLocalItem,
    addLocalItem,
    removeLocalItem,
    totalItems: query.data?.meta?.total || 0,
    limit,
    setLimit,
    offset,
    setOffset,
    mutations,
  };

  return (
    <EntityContext.Provider value={value}>{children}</EntityContext.Provider>
  );
}

export function useEntity() {
  const context = useContext(EntityContext);
  if (!context) {
    throw new Error("useEntity must be used within an EntityProvider");
  }
  return context;
}
