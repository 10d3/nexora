/* eslint-disable @typescript-eslint/no-explicit-any */
import Dexie from "dexie";
import { BusinessType } from "@prisma/client";

// Define types that match Prisma models
export interface IQueuedAction {
  id: string;
  name: string;
  params: any;
  timestamp: Date;
  retries: number;
}

export interface IUser {
  id?: string;
  name: string;
  email: string;
  emailVerified?: Date;
  password?: string;
  image?: string;
  role: string;
  tenantId?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export interface ITenant {
  id?: string;
  name: string;
  slug: string;
  businessType: BusinessType;
  description?: string;
  subscriptionId?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export interface ICustomerProfile {
  id?: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  dateOfBirth?: Date | null;
  gender?: string | null;
  notes?: string | null;
  totalSpent?: number | null;
  lastVisit?: Date | null;
  loyaltyPoints?: number | null;
  customerSince?: Date | null;
  preferences?: any;
  tags?: string | null;
  userId?: string | null;
  tenantId: string;
  createdById?: string | null;
  creditAccountId?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
  [key: string]: any; // Add index signature to allow dynamic property access
}

export interface IProject {
  id?: string;
  name: string;
  description?: string;
  startDate: Date;
  dueDate: Date;
  status: string;
  progress: number;
  budget?: number;
  location?: string;
  tenantId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ITask {
  id?: string;
  name: string;
  description?: string;
  startDate?: Date;
  dueDate?: Date;
  completedAt?: Date;
  status: string;
  progress: number;
  projectId: string;
  tenantId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IAsset {
  id?: string;
  name: string;
  type: string;
  status: string;
  condition: string;
  projectId?: string;
  tenantId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IOrder {
  id?: string;
  orderNumber: string;
  status: string;
  total: number;
  tax: number;
  discount: number;
  paymentType: string;
  orderType: string;
  reservationId?: string;
  bookingId?: string;
  appointmentId?: string;
  userId: string;
  tenantId: string;
  customerProfileId?: string;
  createdAt?: Date;
  updatedAt?: Date;
  completedAt?: Date;
  completedBy?: string;
  completedReason?: string;
  deletedBy?: string;
  deletedAt?: Date;
  orderItems?: IOrderItem[];
}

export interface IOrderItem {
  id?: string;
  quantity: number;
  price: number;
  notes: string | null;
  productId: string | null;
  menuId: string | null;
  roomId: string | null;
  orderId: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICategory {
  id?: string;
  name: string;
  description?: string;
  tenantId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IProduct {
  id?: string;
  name: string;
  description?: string;
  price: number;
  sku?: string;
  barcode?: string;
  categoryId?: string;
  tenantId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// New interfaces for missing models
export interface ISite {
  id?: string;
  name: string;
  subdomain?: string;
  customDomain?: string;
  tenantId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IMember {
  id?: string;
  tenantId: string;
  userId: string;
  role: string;
  createdAt?: Date;
}

export interface IInvitation {
  id?: string;
  tenantId: string;
  email: string;
  role?: string;
  status: string;
  expiresAt: Date;
  inviterId: string;
}

export interface ISubscriptionPlan {
  id?: string;
  name: string;
  description?: string;
  price: number;
  billingCycle: string;
  maxTenants: number;
  maxUsers: number;
  maxProducts?: number;
  maxOrders?: number;
  features?: any;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserSubscription {
  id?: string;
  userId: string;
  planId: string;
  startDate: Date;
  endDate?: Date;
  status: string;
  autoRenew: boolean;
  paymentMethod?: string;
  lastPaymentDate?: Date;
  nextPaymentDate?: Date;
  cancellationDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ISettings {
  id?: string;
  theme: string;
  currency: string;
  taxRate: number;
  message404?: string;
  logoUrl?: string;
  storeName?: string;
  address?: string;
  phoneNumber?: string;
  email?: string;
  businessHours?: any;
  tableManagement?: boolean;
  roomManagement?: boolean;
  appointmentSystem?: boolean;
  tenantId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IResource {
  id?: string;
  name: string;
  description?: string;
  type: string;
  status: string;
  tenantId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IReservation {
  id?: string;
  customerName: string;
  customerPhone?: string | null;
  customerEmail?: string | null;
  specialRequests?: string | null;
  status: string;
  partySize: number;
  reservationTime: Date;
  endTime?: Date | null;
  tableId?: string | null;
  tenantId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IOrderStats {
  id: string;
  tenantId: string;
  stats: {
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    ordersByStatus: Record<string, number>;
    ordersByPaymentType: Record<string, number>;
  };
  timestamp: Date;
}

// Define the database class
class NexoraDatabase extends Dexie {
  users: Dexie.Table<IUser, string>;
  tenants: Dexie.Table<ITenant, string>;
  customerProfiles: Dexie.Table<ICustomerProfile, string>;
  projects: Dexie.Table<IProject, string>;
  tasks: Dexie.Table<ITask, string>;
  assets: Dexie.Table<IAsset, string>;
  orders: Dexie.Table<IOrder, string>;
  orderItems: Dexie.Table<IOrderItem, string>;
  categories: Dexie.Table<ICategory, string>;
  products: Dexie.Table<IProduct, string>;
  actionQueue: Dexie.Table<IQueuedAction, string>;
  sites: Dexie.Table<ISite, string>;
  members: Dexie.Table<IMember, string>;
  invitations: Dexie.Table<IInvitation, string>;
  subscriptionPlans: Dexie.Table<ISubscriptionPlan, string>;
  userSubscriptions: Dexie.Table<IUserSubscription, string>;
  settings: Dexie.Table<ISettings, string>;
  resources: Dexie.Table<IResource, string>;
  reservations: Dexie.Table<IReservation, string>;
  orderStats: Dexie.Table<IOrderStats, string>;

  constructor() {
    super("NexoraDB");

    // Define tables and indexes
    this.version(1).stores({
      users: "id, email, tenantId, role",
      tenants: "id, slug, businessType",
      customerProfiles:
        "id, tenantId, userId, [lastName+firstName], email, phone, lastVisit, totalSpent, customerSince",
      projects: "id, tenantId, status",
      tasks: "id, projectId, tenantId, status",
      assets: "id, tenantId, type, status",
      orders:
        "id, orderNumber, tenantId, userId, status, customerProfileId, createdAt, completedAt",
      orderItems: "id, orderId, productId",
      categories: "id, tenantId, name",
      products: "id, tenantId, categoryId, sku, barcode",
      actionQueue: "id, name, timestamp, retries",
      sites: "id, subdomain, customDomain, tenantId",
      members: "id, tenantId, userId, role",
      invitations: "id, tenantId, email, inviterId",
      subscriptionPlans: "id, isActive",
      userSubscriptions: "id, userId, planId, status",
      settings: "id, tenantId",
      resources: "id, tenantId, type, status",
      reservations: "id, tenantId, tableId, status, reservationTime",
      orderStats: "id, tenantId, timestamp"
    });

    // Define table mappings
    this.users = this.table("users");
    this.tenants = this.table("tenants");
    this.customerProfiles = this.table("customerProfiles");
    this.projects = this.table("projects");
    this.tasks = this.table("tasks");
    this.assets = this.table("assets");
    this.orders = this.table("orders");
    this.orderItems = this.table("orderItems");
    this.categories = this.table("categories");
    this.products = this.table("products");
    this.actionQueue = this.table("actionQueue");
    this.sites = this.table("sites");
    this.members = this.table("members");
    this.invitations = this.table("invitations");
    this.subscriptionPlans = this.table("subscriptionPlans");
    this.userSubscriptions = this.table("userSubscriptions");
    this.settings = this.table("settings");
    this.resources = this.table("resources");
    this.reservations = this.table("reservations");
    this.orderStats = this.table("orderStats");
  }

  // Helper methods for CRUD operations with offline support

  // User methods
  async getUser(id: string): Promise<IUser | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<IUser | undefined> {
    return this.users.where("email").equals(email).first();
  }

  async saveUser(user: IUser): Promise<string> {
    return this.users.put(user);
  }

  // Tenant methods
  async getTenant(id: string): Promise<ITenant | undefined> {
    return this.tenants.get(id);
  }

  async getTenantBySlug(slug: string): Promise<ITenant | undefined> {
    return this.tenants.where("slug").equals(slug).first();
  }

  async saveTenant(tenant: ITenant): Promise<string> {
    return this.tenants.put(tenant);
  }

  // Customer Profile methods
  async getCustomerProfile(id: string): Promise<ICustomerProfile | undefined> {
    return this.customerProfiles.get(id);
  }

  async getCustomerIdByTenant(id:string, tenantId:string){
    return this.customerProfiles.where(['id', 'tenantId']).equals([id, tenantId])
  }

  async getCustomerProfilesByTenant(
    tenantId: string
  ): Promise<ICustomerProfile[]> {
    return this.customerProfiles.where("tenantId").equals(tenantId).toArray();
  }

  async saveCustomerProfile(profile: ICustomerProfile): Promise<string> {
    console.log(profile)
    return this.customerProfiles.put(profile);
  }

  // Project methods
  async getProject(id: string): Promise<IProject | undefined> {
    return this.projects.get(id);
  }

  async getProjectsByTenant(tenantId: string): Promise<IProject[]> {
    return this.projects.where("tenantId").equals(tenantId).toArray();
  }

  async saveProject(project: IProject): Promise<string> {
    return this.projects.put(project);
  }

  // Task methods
  async getTask(id: string): Promise<ITask | undefined> {
    return this.tasks.get(id);
  }

  async getTasksByProject(projectId: string): Promise<ITask[]> {
    return this.tasks.where("projectId").equals(projectId).toArray();
  }

  async saveTask(task: ITask): Promise<string> {
    return this.tasks.put(task);
  }

  // Asset methods
  async getAsset(id: string): Promise<IAsset | undefined> {
    return this.assets.get(id);
  }

  async getAssetsByTenant(tenantId: string): Promise<IAsset[]> {
    return this.assets.where("tenantId").equals(tenantId).toArray();
  }

  async getAssetsByProject(projectId: string): Promise<IAsset[]> {
    return this.assets.where("projectId").equals(projectId).toArray();
  }

  async saveAsset(asset: IAsset): Promise<string> {
    return this.assets.put(asset);
  }

  // Order methods
  async getOrder(id: string): Promise<IOrder | undefined> {
    return this.orders.get(id);
  }

  async getOrdersByTenant(tenantId: string): Promise<IOrder[]> {
    return this.orders.where("tenantId").equals(tenantId).toArray();
  }

  async getOrdersByCustomer(customerProfileId: string): Promise<IOrder[]> {
    return this.orders
      .where("customerProfileId")
      .equals(customerProfileId)
      .toArray();
  }

  async saveOrder(order: IOrder): Promise<string> {
    return this.orders.put(order);
  }

  // OrderItem methods
  async getOrderItem(id: string): Promise<IOrderItem | undefined> {
    return this.orderItems.get(id);
  }

  async getOrderItemsByOrder(orderId: string): Promise<IOrderItem[]> {
    return this.orderItems.where("orderId").equals(orderId).toArray();
  }

  async saveOrderItem(orderItem: IOrderItem): Promise<string> {
    return this.orderItems.put(orderItem);
  }

  // Category methods
  async getCategory(id: string): Promise<ICategory | undefined> {
    return this.categories.get(id);
  }

  async getCategoriesByTenant(tenantId: string): Promise<ICategory[]> {
    return this.categories.where("tenantId").equals(tenantId).toArray();
  }

  async saveCategory(category: ICategory): Promise<string> {
    return this.categories.put(category);
  }

  // Product methods
  async getProduct(id: string): Promise<IProduct | undefined> {
    return this.products.get(id);
  }

  async getProductsByTenant(tenantId: string): Promise<IProduct[]> {
    return this.products.where("tenantId").equals(tenantId).toArray();
  }

  async getProductsByCategory(categoryId: string): Promise<IProduct[]> {
    return this.products.where("categoryId").equals(categoryId).toArray();
  }

  async saveProduct(product: IProduct): Promise<string> {
    return this.products.put(product);
  }

  // Site methods
  async getSite(id: string): Promise<ISite | undefined> {
    return this.sites.get(id);
  }

  async getSiteByTenant(tenantId: string): Promise<ISite | undefined> {
    return this.sites.where("tenantId").equals(tenantId).first();
  }

  async saveSite(site: ISite): Promise<string> {
    return this.sites.put(site);
  }

  // Member methods
  async getMember(id: string): Promise<IMember | undefined> {
    return this.members.get(id);
  }

  async getMembersByTenant(tenantId: string): Promise<IMember[]> {
    return this.members.where("tenantId").equals(tenantId).toArray();
  }

  async saveMember(member: IMember): Promise<string> {
    return this.members.put(member);
  }

  // Invitation methods
  async getInvitation(id: string): Promise<IInvitation | undefined> {
    return this.invitations.get(id);
  }

  async getInvitationsByTenant(tenantId: string): Promise<IInvitation[]> {
    return this.invitations.where("tenantId").equals(tenantId).toArray();
  }

  async saveInvitation(invitation: IInvitation): Promise<string> {
    return this.invitations.put(invitation);
  }

  // Subscription Plan methods
  async getSubscriptionPlan(
    id: string
  ): Promise<ISubscriptionPlan | undefined> {
    return this.subscriptionPlans.get(id);
  }

  async getActiveSubscriptionPlans(): Promise<ISubscriptionPlan[]> {
    return this.subscriptionPlans.where("isActive").equals("true").toArray();
  }

  async saveSubscriptionPlan(plan: ISubscriptionPlan): Promise<string> {
    return this.subscriptionPlans.put(plan);
  }

  // User Subscription methods
  async getUserSubscription(
    id: string
  ): Promise<IUserSubscription | undefined> {
    return this.userSubscriptions.get(id);
  }

  async getUserSubscriptionsByUser(
    userId: string
  ): Promise<IUserSubscription[]> {
    return this.userSubscriptions.where("userId").equals(userId).toArray();
  }

  async saveUserSubscription(subscription: IUserSubscription): Promise<string> {
    return this.userSubscriptions.put(subscription);
  }

  // Settings methods
  async getSettings(id: string): Promise<ISettings | undefined> {
    return this.settings.get(id);
  }

  async getSettingsByTenant(tenantId: string): Promise<ISettings | undefined> {
    return this.settings.where("tenantId").equals(tenantId).first();
  }

  async saveSettings(settings: ISettings): Promise<string> {
    return this.settings.put(settings);
  }

  // Resource methods
  async getResource(id: string): Promise<IResource | undefined> {
    return this.resources.get(id);
  }

  async getResourcesByTenant(tenantId: string): Promise<IResource[]> {
    return this.resources.where("tenantId").equals(tenantId).toArray();
  }

  async saveResource(resource: IResource): Promise<string> {
    return this.resources.put(resource);
  }

  // Reservation methods
  async getReservation(id: string): Promise<IReservation | undefined> {
    return this.reservations.get(id);
  }

  async getReservationsByTenant(tenantId: string): Promise<IReservation[]> {
    return this.reservations.where("tenantId").equals(tenantId).toArray();
  }

  async getReservationsByTable(tableId: string): Promise<IReservation[]> {
    return this.reservations.where("tableId").equals(tableId).toArray();
  }

  async saveReservation(reservation: IReservation): Promise<string> {
    return this.reservations.put(reservation);
  }

  // Order Stats methods
  async saveOrderStats(stats: IOrderStats): Promise<string> {
    return await this.orderStats.put(stats);
  }

  async getOrderStats(tenantId: string, from?: Date, to?: Date): Promise<IOrderStats | undefined> {
    if (from && to) {
      // If date range is provided, get stats for that specific range
      const statsId = `${tenantId}-${from.toISOString()}-${to.toISOString()}`;
      return await this.orderStats.get(statsId);
    }
    // Otherwise get the most recent stats for the tenant
    return await this.orderStats
      .where("tenantId")
      .equals(tenantId)
      .sortBy("timestamp")
      .then(stats => stats[stats.length - 1]);
  }

  // Sync methods for offline-first functionality
  async syncFromServer(data: any): Promise<void> {
    // Transaction to ensure data consistency
    return this.transaction(
      "rw",
      [
        this.users,
        this.tenants,
        this.customerProfiles,
        this.projects,
        this.tasks,
        this.assets,
        this.orders,
        this.orderItems,
        this.categories,
        this.products,
        this.actionQueue,
        this.sites,
        this.members,
        this.invitations,
        this.subscriptionPlans,
        this.userSubscriptions,
        this.settings,
        this.resources,
        this.reservations,
        this.orderStats,
      ],
      async () => {
        // Sync each table with server data
        if (data.users) {
          for (const user of data.users) {
            await this.users.put(user);
          }
        }

        if (data.tenants) {
          for (const tenant of data.tenants) {
            await this.tenants.put(tenant);
          }
        }

        if (data.customerProfiles) {
          for (const profile of data.customerProfiles) {
            await this.customerProfiles.put(profile);
          }
        }

        if (data.projects) {
          for (const project of data.projects) {
            await this.projects.put(project);
          }
        }

        if (data.tasks) {
          for (const task of data.tasks) {
            await this.tasks.put(task);
          }
        }

        if (data.assets) {
          for (const asset of data.assets) {
            await this.assets.put(asset);
          }
        }

        if (data.orders) {
          for (const order of data.orders) {
            await this.orders.put(order);
          }
        }

        if (data.orderItems) {
          for (const item of data.orderItems) {
            await this.orderItems.put(item);
          }
        }

        if (data.categories) {
          for (const category of data.categories) {
            await this.categories.put(category);
          }
        }

        if (data.products) {
          for (const product of data.products) {
            await this.products.put(product);
          }
        }

        if (data.sites) {
          for (const site of data.sites) {
            await this.sites.put(site);
          }
        }

        if (data.members) {
          for (const member of data.members) {
            await this.members.put(member);
          }
        }

        if (data.invitations) {
          for (const invitation of data.invitations) {
            await this.invitations.put(invitation);
          }
        }

        if (data.subscriptionPlans) {
          for (const plan of data.subscriptionPlans) {
            await this.subscriptionPlans.put(plan);
          }
        }

        if (data.userSubscriptions) {
          for (const subscription of data.userSubscriptions) {
            await this.userSubscriptions.put(subscription);
          }
        }

        if (data.settings) {
          for (const setting of data.settings) {
            await this.settings.put(setting);
          }
        }

        if (data.resources) {
          for (const resource of data.resources) {
            await this.resources.put(resource);
          }
        }

        if (data.reservations) {
          for (const reservation of data.reservations) {
            await this.reservations.put(reservation);
          }
        }

        if (data.orderStats) {
          for (const stats of data.orderStats) {
            await this.orderStats.put(stats);
          }
        }
      }
    );
  }

  async getPendingChanges(): Promise<any> {
    // Get all queued actions as pending changes
    const queuedActions = await this.actionQueue.toArray();
    return { queuedActions };
  }

  // Action Queue methods
  async saveQueuedAction(action: IQueuedAction): Promise<string> {
    return this.actionQueue.put(action);
  }

  async saveQueuedActions(actions: IQueuedAction[]): Promise<void> {
    await this.actionQueue.bulkPut(actions);
  }

  async getQueuedActions(): Promise<IQueuedAction[]> {
    return this.actionQueue.toArray();
  }

  async removeQueuedAction(id: string): Promise<void> {
    await this.actionQueue.delete(id);
  }

  async clearDatabase(): Promise<void> {
    return this.transaction(
      "rw",
      [
        this.users,
        this.tenants,
        this.customerProfiles,
        this.projects,
        this.tasks,
        this.assets,
        this.orders,
        this.orderItems,
        this.categories,
        this.products,
        this.actionQueue,
        this.sites,
        this.members,
        this.invitations,
        this.subscriptionPlans,
        this.userSubscriptions,
        this.settings,
        this.resources,
        this.reservations,
        this.orderStats,
      ],
      async () => {
        await Promise.all([
          this.users.clear(),
          this.tenants.clear(),
          this.customerProfiles.clear(),
          this.projects.clear(),
          this.tasks.clear(),
          this.assets.clear(),
          this.orders.clear(),
          this.orderItems.clear(),
          this.categories.clear(),
          this.products.clear(),
          this.actionQueue.clear(),
          this.sites.clear(),
          this.members.clear(),
          this.invitations.clear(),
          this.subscriptionPlans.clear(),
          this.userSubscriptions.clear(),
          this.settings.clear(),
          this.resources.clear(),
          this.reservations.clear(),
          this.orderStats.clear(),
        ]);
      }
    );
  }
}

// Create and export a singleton instance
const db = new NexoraDatabase();
export default db;
