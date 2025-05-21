/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from "zod";
import { revalidatePath } from "next/cache";
import db from "./db.service";
import { Permission } from "../permissions/role-permissions";
import { checkPermission } from "../permissions/server-permissions";

/**
 * Generic CRUD operation handler with offline support
 * @param options Configuration for the CRUD operation
 * @returns Result of the operation with success/error status
 */
export async function performCrudOperation<
  T,
  S extends z.ZodType<any, any>,
>(options: {
  // Operation type
  operation: "create" | "update" | "delete" | "get";

  // Data and validation
  data?: any;
  schema?: S;

  // Entity info
  entityName: string;
  entityId?: string;
  tenantId: string;

  // Permission requirements
  requiredPermission: Permission;

  // Database functions
  dbSaveFunction: (data: any) => Promise<string | void>;
  dbGetFunction?: (id: string) => Promise<any>;

  // Online operation - Prisma calls
  prismaFunction: (validatedData: any) => Promise<any>;

  // Path to revalidate after successful operation
  revalidatePaths?: string[];

  // Additional data transformations
  offlineDataTransform?: (data: any) => any;
  onlineDataTransform?: (data: any) => any;
}): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    // Check permission
    const hasPermission = await checkPermission(options.requiredPermission);
    if (!hasPermission) {
      return {
        success: false,
        error: `You don't have permission to ${options.operation} ${options.entityName}`,
      };
    }

    // Validate input data if schema is provided
    let validatedData = options.data;
    if (options.schema && options.data) {
      validatedData = options.schema.parse(options.data);
    }

    // Handle offline mode
    const isOffline = typeof navigator !== "undefined" && !navigator.onLine;
    if (isOffline) {
      // For read operations in offline mode
      if (
        options.operation === "get" &&
        options.dbGetFunction &&
        options.entityId
      ) {
        const result = await options.dbGetFunction(options.entityId);
        return { success: true, data: result };
      }

      // For write operations in offline mode
      const offlineData = options.offlineDataTransform
        ? options.offlineDataTransform(validatedData)
        : {
            ...validatedData,
            tenantId: options.tenantId,
          };

      // Queue the action for later sync if it's not a read operation
      if (options.operation !== "get") {
        await db.saveQueuedAction({
          id: crypto.randomUUID(),
          name: `${options.operation}_${options.entityName}`,
          params: {
            data: validatedData,
            entityId: options.entityId,
            tenantId: options.tenantId,
          },
          timestamp: new Date(),
          retries: 0,
        });
      }

      const result = await options.dbSaveFunction(offlineData);
      return { success: true, data: result || offlineData };
    }

    // Online mode - process with Prisma
    const dataForPrisma = options.onlineDataTransform
      ? options.onlineDataTransform(validatedData)
      : validatedData;

    const result = await options.prismaFunction(dataForPrisma);

    // Revalidate paths if provided
    if (options.revalidatePaths) {
      options.revalidatePaths.forEach((path) => revalidatePath(path));
    }

    return { success: true, data: result };
  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }

    console.error(
      `Error ${options.operation}ing ${options.entityName}:`,
      error
    );
    return {
      success: false,
      error: `Failed to ${options.operation} ${options.entityName}`,
    };
  }
}

/**
 * Create operation helper
 */
export async function createEntity<T, S extends z.ZodType<any, any>>({
  entityName,
  data,
  schema,
  tenantId,
  requiredPermission,
  dbSaveFunction,
  prismaFunction,
  revalidatePaths,
  offlineDataTransform,
  onlineDataTransform,
}: {
  entityName: string;
  data: any;
  schema: S;
  tenantId: string;
  requiredPermission: Permission;
  dbSaveFunction: (data: any) => Promise<string | void>;
  prismaFunction: (validatedData: any) => Promise<any>;
  revalidatePaths?: string[];
  offlineDataTransform?: (data: any) => any;
  onlineDataTransform?: (data: any) => any;
}) {
  return performCrudOperation({
    operation: "create",
    entityName,
    data,
    schema,
    tenantId,
    requiredPermission,
    dbSaveFunction,
    prismaFunction,
    revalidatePaths,
    offlineDataTransform,
    onlineDataTransform,
  });
}

/**
 * Update operation helper
 */
export async function updateEntity<T, S extends z.ZodType<any, any>>({
  entityName,
  entityId,
  data,
  schema,
  tenantId,
  requiredPermission,
  dbSaveFunction,
  prismaFunction,
  revalidatePaths,
  offlineDataTransform,
  onlineDataTransform,
}: {
  entityName: string;
  entityId: string;
  data: any;
  schema: S;
  tenantId: string;
  requiredPermission: Permission;
  dbSaveFunction: (data: any) => Promise<string | void>;
  prismaFunction: (validatedData: any) => Promise<any>;
  revalidatePaths?: string[];
  offlineDataTransform?: (data: any) => any;
  onlineDataTransform?: (data: any) => any;
}) {
  return performCrudOperation({
    operation: "update",
    entityName,
    entityId,
    data,
    schema,
    tenantId,
    requiredPermission,
    dbSaveFunction,
    prismaFunction,
    revalidatePaths,
    offlineDataTransform,
    onlineDataTransform,
  });
}

/**
 * Delete operation helper
 */
export async function deleteEntity({
  entityName,
  entityId,
  tenantId,
  requiredPermission,
  dbSaveFunction,
  prismaFunction,
  revalidatePaths,
}: {
  entityName: string;
  entityId: string;
  tenantId: string;
  requiredPermission: Permission;
  dbSaveFunction: (data: any) => Promise<string | void>;
  prismaFunction: (id: string) => Promise<any>;
  revalidatePaths?: string[];
}) {
  return performCrudOperation({
    operation: "delete",
    entityName,
    entityId,
    tenantId,
    requiredPermission,
    dbSaveFunction,
    prismaFunction: (data) => prismaFunction(entityId),
    revalidatePaths,
  });
}

/**
 * Get operation helper
 */
export async function getEntity({
  entityName,
  entityId,
  tenantId,
  requiredPermission,
  dbGetFunction,
  prismaFunction,
}: {
  entityName: string;
  entityId: string;
  tenantId: string;
  requiredPermission: Permission;
  dbGetFunction: (id: string) => Promise<any>;
  prismaFunction: (id: string) => Promise<any>;
}) {
  return performCrudOperation({
    operation: "get",
    entityName,
    entityId,
    tenantId,
    requiredPermission,
    dbSaveFunction: async () => {}, // No-op for get operations
    dbGetFunction,
    prismaFunction: (data) => prismaFunction(entityId),
  });
}

/**
 * Helper to create a sync queue handler for when the app comes back online
 */
export async function processSyncQueue() {
  const isOffline = typeof navigator !== "undefined" && !navigator.onLine;
  if (isOffline) return;

  try {
    const queuedActions = await db.getQueuedActions();

    for (const action of queuedActions) {
      try {
        // Process each action based on its name
        const [operation, entityName] = action.name.split("_");

        // Here you would implement the logic to dispatch each action type
        // to the appropriate handler when back online

        // After successful processing, remove from queue
        await db.removeQueuedAction(action.id);
      } catch (error) {
        console.error(`Failed to process queued action ${action.id}:`, error);

        // Increment retry count
        await db.saveQueuedAction({
          ...action,
          retries: action.retries + 1,
        });
      }
    }
  } catch (error) {
    console.error("Error processing sync queue:", error);
  }
}

// Add event listener to process queue when coming back online
if (typeof window !== "undefined" && typeof navigator !== "undefined") {
  window.addEventListener("online", processSyncQueue);
}
