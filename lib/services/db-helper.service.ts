import db from "./db.service";
import type {
  IUser,
  ITenant,
  ICustomerProfile,
  IProject,
  ITask,
  IAsset,
  IOrder,
  IOrderItem,
  ICategory,
  IProduct,
} from "./db.service";

/**
 * DbHelperService provides a simplified API for interacting with the offline database
 * and handles synchronization with the server when online.
 */
export class DbHelperService {
  private static instance: DbHelperService;
  private isOnline: boolean =
    typeof navigator !== "undefined" ? navigator.onLine : true;

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
    }
  }

  /**
   * Get the singleton instance of DbHelperService
   */
  public static getInstance(): DbHelperService {
    if (!DbHelperService.instance) {
      DbHelperService.instance = new DbHelperService();
    }
    return DbHelperService.instance;
  }

  /**
   * Handle changes in online status
   */
  private handleOnlineStatusChange() {
    this.isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;

    // If we're back online, attempt to sync pending changes
    if (this.isOnline) {
      this.syncWithServer();
    }
  }

  /**
   * Sync local database with server
   */
  public async syncWithServer(): Promise<void> {
    if (!this.isOnline) {
      console.log("Cannot sync with server while offline");
      return;
    }

    try {
      // Get pending changes to send to server
      const pendingChanges = await db.getPendingChanges();

      // If there are pending changes, send them to server
      if (Object.keys(pendingChanges).length > 0) {
        // Implementation would depend on your API structure
        // const response = await fetch('/api/sync', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(pendingChanges)
        // });
        // const serverData = await response.json();
        // await db.syncFromServer(serverData);
      }

      // Get latest data from server
      // const response = await fetch('/api/data');
      // const serverData = await response.json();
      // await db.syncFromServer(serverData);

      console.log("Sync with server completed successfully");
    } catch (error) {
      console.error("Error syncing with server:", error);
    }
  }

  /**
   * Initialize the database with data from the server
   */
  public async initializeFromServer(tenantId: string): Promise<void> {
    if (!this.isOnline) {
      console.log("Cannot initialize from server while offline for", tenantId);
      return;
    }

    try {
      // Fetch initial data from server
      // const response = await fetch(`/api/data/initialize?tenantId=${tenantId}`);
      // const serverData = await response.json();
      // await db.syncFromServer(serverData);

      console.log("Database initialized from server successfully");
    } catch (error) {
      console.error("Error initializing from server:", error);
    }
  }

  // User methods
  public async getUser(id: string): Promise<IUser | undefined> {
    return db.getUser(id);
  }

  public async getUserByEmail(email: string): Promise<IUser | undefined> {
    return db.getUserByEmail(email);
  }

  public async saveUser(user: IUser): Promise<string> {
    const id = await db.saveUser(user);
    this.syncIfOnline();
    return id;
  }

  // Tenant methods
  public async getTenant(id: string): Promise<ITenant | undefined> {
    return db.getTenant(id);
  }

  public async getTenantBySlug(slug: string): Promise<ITenant | undefined> {
    return db.getTenantBySlug(slug);
  }

  public async saveTenant(tenant: ITenant): Promise<string> {
    const id = await db.saveTenant(tenant);
    this.syncIfOnline();
    return id;
  }

  // Customer Profile methods
  public async getCustomerProfile(
    id: string
  ): Promise<ICustomerProfile | undefined> {
    return db.getCustomerProfile(id);
  }

  public async getCustomerProfilesByTenant(
    tenantId: string
  ): Promise<ICustomerProfile[]> {
    return db.getCustomerProfilesByTenant(tenantId);
  }

  public async saveCustomerProfile(profile: ICustomerProfile): Promise<string> {
    const id = await db.saveCustomerProfile(profile);
    this.syncIfOnline();
    return id;
  }

  // Project methods
  public async getProject(id: string): Promise<IProject | undefined> {
    return db.getProject(id);
  }

  public async getProjectsByTenant(tenantId: string): Promise<IProject[]> {
    return db.getProjectsByTenant(tenantId);
  }

  public async saveProject(project: IProject): Promise<string> {
    const id = await db.saveProject(project);
    this.syncIfOnline();
    return id;
  }

  // Task methods
  public async getTask(id: string): Promise<ITask | undefined> {
    return db.getTask(id);
  }

  public async getTasksByProject(projectId: string): Promise<ITask[]> {
    return db.getTasksByProject(projectId);
  }

  public async saveTask(task: ITask): Promise<string> {
    const id = await db.saveTask(task);
    this.syncIfOnline();
    return id;
  }

  // Asset methods
  public async getAsset(id: string): Promise<IAsset | undefined> {
    return db.getAsset(id);
  }

  public async getAssetsByTenant(tenantId: string): Promise<IAsset[]> {
    return db.getAssetsByTenant(tenantId);
  }

  public async getAssetsByProject(projectId: string): Promise<IAsset[]> {
    return db.getAssetsByProject(projectId);
  }

  public async saveAsset(asset: IAsset): Promise<string> {
    const id = await db.saveAsset(asset);
    this.syncIfOnline();
    return id;
  }

  // Order methods
  public async getOrder(id: string): Promise<IOrder | undefined> {
    return db.getOrder(id);
  }

  public async getOrdersByTenant(tenantId: string): Promise<IOrder[]> {
    return db.getOrdersByTenant(tenantId);
  }

  public async getOrdersByCustomer(
    customerProfileId: string
  ): Promise<IOrder[]> {
    return db.getOrdersByCustomer(customerProfileId);
  }

  public async saveOrder(order: IOrder): Promise<string> {
    const id = await db.saveOrder(order);
    this.syncIfOnline();
    return id;
  }

  // OrderItem methods
  public async getOrderItem(id: string): Promise<IOrderItem | undefined> {
    return db.getOrderItem(id);
  }

  public async getOrderItemsByOrder(orderId: string): Promise<IOrderItem[]> {
    return db.getOrderItemsByOrder(orderId);
  }

  public async saveOrderItem(orderItem: IOrderItem): Promise<string> {
    const id = await db.saveOrderItem(orderItem);
    this.syncIfOnline();
    return id;
  }

  // Category methods
  public async getCategory(id: string): Promise<ICategory | undefined> {
    return db.getCategory(id);
  }

  public async getCategoriesByTenant(tenantId: string): Promise<ICategory[]> {
    return db.getCategoriesByTenant(tenantId);
  }

  public async saveCategory(category: ICategory): Promise<string> {
    const id = await db.saveCategory(category);
    this.syncIfOnline();
    return id;
  }

  // Product methods
  public async getProduct(id: string): Promise<IProduct | undefined> {
    return db.getProduct(id);
  }

  public async getProductsByTenant(tenantId: string): Promise<IProduct[]> {
    return db.getProductsByTenant(tenantId);
  }

  public async getProductsByCategory(categoryId: string): Promise<IProduct[]> {
    return db.getProductsByCategory(categoryId);
  }

  public async saveProduct(product: IProduct): Promise<string> {
    const id = await db.saveProduct(product);
    this.syncIfOnline();
    return id;
  }

  /**
   * Helper method to trigger sync if online
   */
  private syncIfOnline(): void {
    if (this.isOnline) {
      this.syncWithServer().catch((error) => {
        console.error("Error during automatic sync:", error);
      });
    }
  }

  /**
   * Clear all data from the database
   */
  public async clearDatabase(): Promise<void> {
    return db.clearDatabase();
  }
}

// Export a singleton instance
export const dbHelper = DbHelperService.getInstance();
