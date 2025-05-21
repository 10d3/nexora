/* eslint-disable @typescript-eslint/no-explicit-any */
// /** @jsxImportSource react */
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import db from "@/lib/services/db.service";

// Base entity interface
interface BaseEntity {
  id: string;
  [key: string]: unknown;
}

// Response type for API calls
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    total: number;
  };
}

// Query data type
interface QueryData<T> {
  data: T[];
  meta: {
    total: number;
  };
}

// Generic types for our entity manager
type EntityConfig<T extends BaseEntity> = {
  name: string;
  actions: {
    create: (data: Partial<T>, tenantId: string) => Promise<ApiResponse<T>>;
    update: (data: Partial<T>, tenantId: string) => Promise<ApiResponse<T>>;
    delete: (id: string, tenantId: string) => Promise<ApiResponse<void>>;
    get: (
      tenantId: string,
      params?: Record<string, unknown>
    ) => Promise<ApiResponse<T[]>>;
  };
  dbService: {
    save: (data: T) => Promise<void>;
    getByTenant: (tenantId: string) => Promise<T[]>;
    delete: (id: string) => Promise<void>;
  };
  defaultSortBy?: string;
  searchFields?: string[];
  validateData?: (data: Partial<T>) => {
    isValid: boolean;
    error?: string;
    data?: T;
  };
};

export function createEntityManager<T extends BaseEntity>(
  config: EntityConfig<T>
) {
  function useEntityManager(tenantId: string, businessType?: string) {
    const queryClient = useQueryClient();
    const [selectedItem, setSelectedItem] = useState<T | null>(null);
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState(config.defaultSortBy || "id");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
    const [limit, setLimit] = useState(10);
    const [offset, setOffset] = useState(0);
    const [isOffline, setIsOffline] = useState(false);

    // Local update functions
    const addLocalItem = (newItem: T) => {
      queryClient.setQueryData(
        [
          config.name,
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

    const updateLocalItem = (updatedItem: T) => {
      queryClient.setQueryData(
        [
          config.name,
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
          data: old.data.map((item: T) =>
            item.id === updatedItem.id ? updatedItem : item
          ),
        })
      );
    };

    const removeLocalItem = (id: string) => {
      queryClient.setQueryData(
        [
          config.name,
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
          data: old.data.filter((item: T) => item.id !== id),
          meta: { total: old.meta.total - 1 },
        })
      );
    };

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

    // Query setup
    const query = useQuery<QueryData<T>, Error>({
      queryKey: [
        config.name,
        tenantId,
        businessType,
        search,
        sortBy,
        sortOrder,
        limit,
        offset,
      ],
      queryFn: async (): Promise<QueryData<T>> => {
        if (!tenantId) return { data: [], meta: { total: 0 } };

        try {
          if (isOffline) {
            const items = await config.dbService.getByTenant(tenantId);
            let filteredItems = items;

            // Apply search filter
            if (search && config.searchFields) {
              const searchLower = search.toLowerCase();
              filteredItems = items.filter((item) =>
                config.searchFields!.some((field) =>
                  String(item[field as keyof T])
                    .toLowerCase()
                    .includes(searchLower)
                )
              );
            }

            // Apply sorting
            filteredItems.sort((a, b) => {
              const valueA = a[sortBy as keyof T] || "";
              const valueB = b[sortBy as keyof T] || "";
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
          const result = await config.actions.get(tenantId, {
            search,
            sortBy,
            sortOrder,
            limit,
            offset,
            businessType,
          });

          if (!result.success || !result.data) {
            throw new Error(result.error || "Failed to fetch data");
          }

          // Store in IndexedDB for offline use
          if (result.data && Array.isArray(result.data)) {
            for (const item of result.data) {
              await config.dbService.save(item);
            }
          }

          return {
            data: result.data,
            meta: result.meta || { total: result.data.length },
          };
        } catch (error) {
          console.error(`Error fetching ${config.name}:`, error);
          // Fallback to IndexedDB
          const items = await config.dbService.getByTenant(tenantId);
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
            await config.dbService.save(tempItem as T);
            await db.saveQueuedAction({
              id: crypto.randomUUID(),
              name: `create_${config.name}`,
              params: { data, tenantId, businessType },
              timestamp: new Date(),
              retries: 0,
            });
            return { success: true, data: tempItem };
          }
          return config.actions.create(data, tenantId);
        },
        onMutate: async (newItem) => {
          await queryClient.cancelQueries({
            queryKey: [config.name, tenantId, businessType],
          });
          const previousData = queryClient.getQueryData([
            config.name,
            tenantId,
            businessType,
          ]);
          addLocalItem(newItem as T);
          return { previousData };
        },
        onError: (err, newItem, context) => {
          queryClient.setQueryData(
            [config.name, tenantId, businessType],
            context?.previousData
          );
          toast.error("Error", {
            description: `Failed to create ${config.name}. Please try again.`,
          });
        },
        onSuccess: (result) => {
          if (result.success) {
            toast.success(`${config.name} created`, {
              description: isOffline
                ? `The ${config.name} has been saved locally and will sync when you're back online.`
                : `The ${config.name} has been successfully created.`,
            });
          }
        },
        onSettled: () => {
          queryClient.invalidateQueries({
            queryKey: [config.name, tenantId, businessType],
          });
        },
      }),

      update: useMutation({
        mutationFn: async (data: any) => {
          if (isOffline) {
            await config.dbService.save({ ...data, tenantId } as T);
            await db.saveQueuedAction({
              id: crypto.randomUUID(),
              name: `update_${config.name}`,
              params: { data, tenantId, businessType },
              timestamp: new Date(),
              retries: 0,
            });
            return { success: true, data };
          }
          return config.actions.update(data, tenantId);
        },
        onMutate: async (updatedItem) => {
          await queryClient.cancelQueries({
            queryKey: [config.name, tenantId, businessType],
          });
          const previousData = queryClient.getQueryData([
            config.name,
            tenantId,
            businessType,
          ]);
          updateLocalItem(updatedItem as T);
          return { previousData };
        },
        onError: (err, updatedItem, context) => {
          queryClient.setQueryData(
            [config.name, tenantId, businessType],
            context?.previousData
          );
          toast.error("Error", {
            description: `Failed to update ${config.name}. Please try again.`,
          });
        },
        onSuccess: (result) => {
          if (result.success) {
            toast.success(`${config.name} updated`, {
              description: isOffline
                ? `The ${config.name} has been updated locally and will sync when you're back online.`
                : `The ${config.name} has been successfully updated.`,
            });
          }
        },
        onSettled: () => {
          queryClient.invalidateQueries({
            queryKey: [config.name, tenantId, businessType],
          });
        },
      }),

      delete: useMutation({
        mutationFn: async (id: string) => {
          if (isOffline) {
            await config.dbService.delete(id);
            await db.saveQueuedAction({
              id: crypto.randomUUID(),
              name: `delete_${config.name}`,
              params: { id, tenantId, businessType },
              timestamp: new Date(),
              retries: 0,
            });
            return { success: true };
          }
          return config.actions.delete(id, tenantId);
        },
        onMutate: async (id) => {
          await queryClient.cancelQueries({
            queryKey: [config.name, tenantId, businessType],
          });
          const previousData = queryClient.getQueryData([
            config.name,
            tenantId,
            businessType,
          ]);
          removeLocalItem(id);
          return { previousData };
        },
        onError: (err, id, context) => {
          queryClient.setQueryData(
            [config.name, tenantId, businessType],
            context?.previousData
          );
          toast.error("Error", {
            description: `Failed to delete ${config.name}. Please try again.`,
          });
        },
        onSuccess: (result) => {
          if (result.success) {
            toast.success(`${config.name} deleted`, {
              description: isOffline
                ? `The ${config.name} has been marked for deletion and will be removed when you're back online.`
                : `The ${config.name} has been successfully deleted.`,
            });
          }
        },
        onSettled: () => {
          queryClient.invalidateQueries({
            queryKey: [config.name, tenantId, businessType],
          });
        },
      }),
    };

    return {
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
      isOffline,
      mutations,
    };
  }

  return useEntityManager;
}
