/* eslint-disable @typescript-eslint/no-explicit-any */
import { dbHelper } from "./db-helper.service";
import db from "./db.service";

type ActionFunction<T, R> = (params: T) => Promise<R>;

interface QueuedAction {
  id: string;
  name: string;
  params: any;
  timestamp: Date;
  retries: number;
}

/**
 * SyncService provides offline-first functionality for server actions
 * It handles:
 * - Executing actions against local DB when offline
 * - Queuing actions for later sync when online
 * - Executing actions against server when online
 * - Updating local DB with server responses
 * - Automatic synchronization of queued actions
 */
export class SyncService {
  private static instance: SyncService;
  private isOnline: boolean =
    typeof navigator !== "undefined" ? navigator.onLine : true;
  private actionQueue: QueuedAction[] = [];
  private syncInProgress: boolean = false;

  private constructor() {
    // Initialize online status listener if in browser environment
    if (typeof window !== "undefined") {
      window.addEventListener(
        "online",
        this.handleOnlineStatusChange.bind(this)
      );
      window.addEventListener(
        "offline",
        this.handleOnlineStatusChange.bind(this)
      );

      // Load queued actions from IndexedDB
      this.loadQueuedActions();
    }
  }

  /**
   * Get the singleton instance of SyncService
   */
  public static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  /**
   * Handle changes in online status
   */
  private handleOnlineStatusChange() {
    const wasOffline = !this.isOnline;
    this.isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;

    // If we're back online and we were offline before, sync queued actions
    if (this.isOnline && wasOffline) {
      this.syncQueuedActions();
    }
  }

  /**
   * Execute an action with offline support
   * @param actionName Name of the action (for queuing and logging)
   * @param params Parameters to pass to the action
   * @param serverAction The actual server action function
   * @returns The result of the action
   */
  public async executeAction<T, R>(
    actionName: string,
    params: T,
    serverAction: ActionFunction<T, R>
  ): Promise<R> {
    try {
      if (this.isOnline) {
        // Online: Execute against server
        const result = await serverAction(params);

        // Update local database with the result
        await this.updateLocalDatabase(actionName, params, result);

        return result;
      } else {
        // Offline: Execute against local database
        const result = await this.executeLocalAction<T, R>(actionName, params);

        // Queue the action for later sync
        await this.queueAction(actionName, params);

        return result;
      }
    } catch (error) {
      console.error(`Error executing action ${actionName}:`, error);
      throw error;
    }
  }

  /**
   * Execute an action against the local database
   * @param actionName Name of the action
   * @param params Parameters for the action
   * @returns The result of the local action
   */
  private async executeLocalAction<T, R>(
    actionName: string,
    params: T
  ): Promise<R> {
    // This is a simplified implementation that would need to be expanded
    // based on the specific actions and their local equivalents

    // For now, we'll just return a mock result
    // In a real implementation, this would use dbHelper methods to perform
    // the equivalent action on the local database

    console.log(`Executing local action: ${actionName}`, params);

    // This is where you would implement the local version of each action
    // For example, if actionName is 'getProducts', you would call the local
    // equivalent using dbHelper

    // Example implementation for specific actions:
    switch (actionName) {
      case "getProducts":
        return dbHelper.getProductsByTenant(params.tenantId) as Promise<R>;
      case "getOrders":
        return dbHelper.getOrdersByTenant(params.tenantId) as Promise<R>;
      // Add cases for other actions as needed
      default:
        throw new Error(`No local implementation for action: ${actionName}`);
    }
  }

  /**
   * Queue an action for later synchronization
   * @param actionName Name of the action
   * @param params Parameters for the action
   */
  private async queueAction(actionName: string, params: any): Promise<void> {
    const queuedAction: QueuedAction = {
      id: `${actionName}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      name: actionName,
      params,
      timestamp: new Date(),
      retries: 0,
    };

    this.actionQueue.push(queuedAction);

    // Save the updated queue to IndexedDB
    await this.saveQueuedActions();

    console.log(`Action queued for later sync: ${actionName}`, params);
  }

  /**
   * Update the local database with the result of a server action
   * @param actionName Name of the action
   * @param params Parameters that were passed to the action
   * @param result Result from the server
   */
  private async updateLocalDatabase(
    actionName: string,
    params: any,
    result: any
  ): Promise<void> {
    // This is a simplified implementation that would need to be expanded
    // based on the specific actions and how their results should update the local DB

    console.log(`Updating local database for action: ${actionName}`, result);

    // Example implementation for specific actions:
    switch (actionName) {
      case "getProducts":
        if (result.products) {
          // Update local products
          for (const product of result.products) {
            await dbHelper.saveProduct(product);
          }
        }
        break;
      case "getOrders":
        if (result.orders) {
          // Update local orders
          for (const order of result.orders) {
            await dbHelper.saveOrder(order);

            // Also update order items
            if (order.orderItems) {
              for (const item of order.orderItems) {
                await dbHelper.saveOrderItem(item);
              }
            }
          }
        }
        break;
      // Add cases for other actions as needed
    }
  }

  /**
   * Synchronize all queued actions with the server
   */
  public async syncQueuedActions(): Promise<void> {
    if (
      !this.isOnline ||
      this.syncInProgress ||
      this.actionQueue.length === 0
    ) {
      return;
    }

    this.syncInProgress = true;

    try {
      console.log(`Syncing ${this.actionQueue.length} queued actions...`);

      const actionsToSync = [...this.actionQueue];
      const successfulActions: string[] = [];

      for (const action of actionsToSync) {
        try {
          // Here you would implement the actual server call
          // For example, using fetch to call your API endpoint

          // This is a placeholder for the actual implementation
          console.log(`Syncing action: ${action.name}`, action.params);

          // Mark action as successfully synced
          successfulActions.push(action.id);
        } catch (error) {
          console.error(`Error syncing action ${action.name}:`, error);

          // Increment retry count
          action.retries += 1;

          // If we've retried too many times, remove from queue
          if (action.retries >= 3) {
            successfulActions.push(action.id);
            console.warn(
              `Action ${action.name} failed after 3 retries, removing from queue`
            );
          }
        }
      }

      // Remove successful actions from queue
      this.actionQueue = this.actionQueue.filter(
        (action) => !successfulActions.includes(action.id)
      );

      // Save the updated queue
      await this.saveQueuedActions();

      console.log(
        `Sync completed. ${successfulActions.length} actions synced, ${this.actionQueue.length} remaining.`
      );
    } catch (error) {
      console.error("Error during sync:", error);
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Save queued actions to IndexedDB for persistence
   */
  private async saveQueuedActions(): Promise<void> {
    try {
      // Use Dexie to store the action queue
      await db.saveQueuedActions(this.actionQueue);
      console.log("Action queue saved to IndexedDB");
    } catch (error) {
      console.error("Error saving action queue:", error);
    }
  }

  /**
   * Load queued actions from IndexedDB
   */
  private async loadQueuedActions(): Promise<void> {
    try {
      // Use Dexie to load the action queue
      const actions = await db.getQueuedActions();
      this.actionQueue = actions;
      console.log(`Loaded ${actions.length} queued actions from IndexedDB`);
    } catch (error) {
      console.error("Error loading action queue:", error);
    }
  }
}

// Export a singleton instance
export const syncService = SyncService.getInstance();
