import { Role } from "@prisma/client";

// Define all possible permissions in the system
export enum Permission {
  // General permissions
  VIEW_DASHBOARD = "view_dashboard",

  // Resource management
  VIEW_RESOURCES = "view_resources",
  CREATE_RESOURCES = "create_resources",

  // User management
  MANAGE_USERS = "manage_users",
  VIEW_USERS = "view_users",

  // Tenant management
  MANAGE_TENANTS = "manage_tenants",
  VIEW_TENANTS = "view_tenants",

  // Product management
  MANAGE_PRODUCTS = "manage_products",
  VIEW_PRODUCTS = "view_products",

  // Inventory management
  MANAGE_INVENTORY = "manage_inventory",
  VIEW_INVENTORY = "view_inventory",

  // Order management
  MANAGE_ORDERS = "manage_orders",
  VIEW_ORDERS = "view_orders",
  PROCESS_PAYMENTS = "process_payments",
  ISSUE_REFUNDS = "issue_refunds",
  // VIEW_ORDERS: "view:orders",
  CREATE_ORDERS = "create:orders",
  UPDATE_ORDERS = "update:orders",
  DELETE_ORDERS = "delete:orders",

  // Financial management
  VIEW_FINANCES = "view_finances",
  MANAGE_FINANCES = "manage_finances",

  // Customer management
  MANAGE_CUSTOMERS = "manage_customers",
  VIEW_CUSTOMERS = "view_customers",

  // Settings
  MANAGE_SETTINGS = "manage_settings",
  VIEW_SETTINGS = "view_settings",

  // Business-specific permissions
  MANAGE_TABLES = "manage_tables", // Restaurant
  MANAGE_ROOMS = "manage_rooms", // Hotel
  MANAGE_APPOINTMENTS = "manage_appointments", // Salon/Service
  MANAGE_PRESCRIPTIONS = "manage_prescriptions", // Pharmacy

  // Reservation management
  VIEW_RESERVATIONS = "view_reservations",
  CREATE_RESERVATIONS = "create_reservations",
  UPDATE_RESERVATIONS = "update_reservations",
  DELETE_RESERVATIONS = "delete_reservations",
}

// Define role hierarchy (higher roles inherit permissions from lower roles)
const roleHierarchy: Record<Role, Role[]> = {
  [Role.OWNER]: [],
  [Role.ADMIN]: [Role.OWNER],
  [Role.MANAGER]: [Role.ADMIN],
  [Role.SUPERVISOR]: [Role.MANAGER],
  [Role.ACCOUNTANT]: [],
  [Role.CASHIER]: [],
  [Role.INVENTORY_MANAGER]: [],
  [Role.EMPLOYEE]: [],

  // Retail specific
  [Role.SALES_ASSOCIATE]: [Role.EMPLOYEE],
  [Role.MERCHANDISER]: [Role.EMPLOYEE],
  [Role.STORE_CLERK]: [Role.EMPLOYEE],

  // Restaurant specific
  [Role.CHEF]: [Role.EMPLOYEE],
  [Role.SOUS_CHEF]: [Role.CHEF],
  [Role.WAITER]: [Role.EMPLOYEE],
  [Role.BARTENDER]: [Role.EMPLOYEE],
  [Role.HOST]: [Role.EMPLOYEE],
  [Role.KITCHEN_STAFF]: [Role.EMPLOYEE],

  // Hotel specific
  [Role.RECEPTIONIST]: [Role.EMPLOYEE],
  [Role.CONCIERGE]: [Role.EMPLOYEE],
  [Role.HOUSEKEEPER]: [Role.EMPLOYEE],
  [Role.MAINTENANCE]: [Role.EMPLOYEE],
  [Role.BELLHOP]: [Role.EMPLOYEE],

  // Salon/Service specific
  [Role.STYLIST]: [Role.EMPLOYEE],
  [Role.BEAUTICIAN]: [Role.EMPLOYEE],
  [Role.THERAPIST]: [Role.EMPLOYEE],
  [Role.TECHNICIAN]: [Role.EMPLOYEE],

  // Healthcare/Pharmacy specific
  [Role.PHARMACIST]: [Role.EMPLOYEE],
  [Role.PHARMACY_TECH]: [Role.EMPLOYEE],
  [Role.DOCTOR]: [Role.EMPLOYEE],
  [Role.NURSE]: [Role.EMPLOYEE],

  // Supermarket specific
  [Role.BUTCHER]: [Role.EMPLOYEE],
  [Role.BAKER]: [Role.EMPLOYEE],
  [Role.PRODUCE_MANAGER]: [Role.SUPERVISOR],
  [Role.DELI_WORKER]: [Role.EMPLOYEE],

  // Education specific
  [Role.TEACHER]: [Role.EMPLOYEE],
  [Role.INSTRUCTOR]: [Role.EMPLOYEE],
  [Role.ADMINISTRATOR]: [Role.MANAGER],

  // Transportation/Automotive specific
  [Role.DRIVER]: [Role.EMPLOYEE],
  [Role.MECHANIC]: [Role.EMPLOYEE],
  [Role.DISPATCHER]: [Role.EMPLOYEE],

  // Construction specific
  [Role.FOREMAN]: [Role.SUPERVISOR],
  [Role.CONTRACTOR]: [Role.EMPLOYEE],
  [Role.SITE_MANAGER]: [Role.MANAGER],

  // Cybercafe specific
  [Role.TECH_SUPPORT]: [Role.EMPLOYEE],
  [Role.NETWORK_ADMIN]: [Role.SUPERVISOR],

  // Event planning specific
  [Role.EVENT_COORDINATOR]: [Role.EMPLOYEE],
  [Role.DECORATOR]: [Role.EMPLOYEE],

  // Security specific
  [Role.SECURITY_GUARD]: [Role.EMPLOYEE],
  [Role.SECURITY_MANAGER]: [Role.SUPERVISOR],

  // Read-only role
  [Role.VIEWER]: [],

  // Default user
  [Role.USER]: [],
};

// Define direct permissions for each role
const directRolePermissions: Record<Role, Permission[]> = {
  [Role.OWNER]: [
    // Owners have all permissions
    ...Object.values(Permission),
  ],

  [Role.ADMIN]: [
    // Admins have most permissions except some critical financial ones
    ...Object.values(Permission).filter(
      (p) => p !== Permission.MANAGE_FINANCES
    ),
  ],

  [Role.MANAGER]: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_USERS,
    Permission.VIEW_TENANTS,
    Permission.MANAGE_PRODUCTS,
    Permission.VIEW_PRODUCTS,
    Permission.MANAGE_INVENTORY,
    Permission.VIEW_INVENTORY,
    Permission.MANAGE_ORDERS,
    Permission.VIEW_ORDERS,
    Permission.PROCESS_PAYMENTS,
    Permission.VIEW_FINANCES,
    Permission.MANAGE_CUSTOMERS,
    Permission.VIEW_CUSTOMERS,
    Permission.VIEW_SETTINGS,
    Permission.MANAGE_TABLES,
    Permission.MANAGE_ROOMS,
    Permission.MANAGE_APPOINTMENTS,
  ],

  [Role.SUPERVISOR]: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_PRODUCTS,
    Permission.VIEW_INVENTORY,
    Permission.MANAGE_ORDERS,
    Permission.VIEW_ORDERS,
    Permission.PROCESS_PAYMENTS,
    Permission.VIEW_CUSTOMERS,
    Permission.MANAGE_TABLES,
    Permission.MANAGE_ROOMS,
    Permission.MANAGE_APPOINTMENTS,
  ],

  [Role.ACCOUNTANT]: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_FINANCES,
    Permission.MANAGE_FINANCES,
    Permission.VIEW_ORDERS,
    Permission.ISSUE_REFUNDS,
  ],

  [Role.CASHIER]: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_PRODUCTS,
    Permission.VIEW_ORDERS,
    Permission.PROCESS_PAYMENTS,
    Permission.VIEW_CUSTOMERS,
  ],

  [Role.INVENTORY_MANAGER]: [
    Permission.VIEW_DASHBOARD,
    Permission.MANAGE_INVENTORY,
    Permission.VIEW_INVENTORY,
    Permission.VIEW_PRODUCTS,
    Permission.MANAGE_PRODUCTS,
  ],

  [Role.EMPLOYEE]: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_PRODUCTS,
    Permission.VIEW_CUSTOMERS,
  ],

  // Retail specific
  [Role.SALES_ASSOCIATE]: [
    Permission.PROCESS_PAYMENTS,
    Permission.VIEW_INVENTORY,
  ],

  [Role.MERCHANDISER]: [Permission.MANAGE_PRODUCTS, Permission.VIEW_INVENTORY],

  [Role.STORE_CLERK]: [Permission.VIEW_INVENTORY, Permission.PROCESS_PAYMENTS],

  // Restaurant specific
  [Role.CHEF]: [Permission.MANAGE_PRODUCTS],

  [Role.SOUS_CHEF]: [],

  [Role.WAITER]: [
    Permission.MANAGE_ORDERS,
    Permission.PROCESS_PAYMENTS,
    Permission.MANAGE_TABLES,
  ],

  [Role.BARTENDER]: [Permission.MANAGE_ORDERS, Permission.PROCESS_PAYMENTS],

  [Role.HOST]: [Permission.MANAGE_TABLES],

  [Role.KITCHEN_STAFF]: [],

  // Hotel specific
  [Role.RECEPTIONIST]: [
    Permission.MANAGE_ROOMS,
    Permission.PROCESS_PAYMENTS,
    Permission.MANAGE_CUSTOMERS,
  ],

  [Role.CONCIERGE]: [Permission.VIEW_CUSTOMERS],

  [Role.HOUSEKEEPER]: [Permission.MANAGE_ROOMS],

  [Role.MAINTENANCE]: [Permission.MANAGE_ROOMS],

  [Role.BELLHOP]: [],

  // Salon/Service specific
  [Role.STYLIST]: [Permission.MANAGE_APPOINTMENTS],

  [Role.BEAUTICIAN]: [Permission.MANAGE_APPOINTMENTS],

  [Role.THERAPIST]: [Permission.MANAGE_APPOINTMENTS],

  [Role.TECHNICIAN]: [Permission.MANAGE_APPOINTMENTS],

  // Healthcare/Pharmacy specific
  [Role.PHARMACIST]: [
    Permission.MANAGE_PRESCRIPTIONS,
    Permission.MANAGE_INVENTORY,
  ],

  [Role.PHARMACY_TECH]: [
    Permission.MANAGE_PRESCRIPTIONS,
    Permission.VIEW_INVENTORY,
  ],

  [Role.DOCTOR]: [
    Permission.MANAGE_PRESCRIPTIONS,
    Permission.MANAGE_APPOINTMENTS,
  ],

  [Role.NURSE]: [
    Permission.MANAGE_PRESCRIPTIONS,
    Permission.MANAGE_APPOINTMENTS,
  ],

  // Supermarket specific
  [Role.BUTCHER]: [Permission.MANAGE_PRODUCTS],

  [Role.BAKER]: [Permission.MANAGE_PRODUCTS],

  [Role.PRODUCE_MANAGER]: [
    Permission.MANAGE_PRODUCTS,
    Permission.MANAGE_INVENTORY,
  ],

  [Role.DELI_WORKER]: [Permission.MANAGE_PRODUCTS],

  // Education specific
  [Role.TEACHER]: [Permission.MANAGE_APPOINTMENTS],

  [Role.INSTRUCTOR]: [Permission.MANAGE_APPOINTMENTS],

  [Role.ADMINISTRATOR]: [],

  // Transportation/Automotive specific
  [Role.DRIVER]: [],

  [Role.MECHANIC]: [Permission.MANAGE_INVENTORY],

  [Role.DISPATCHER]: [Permission.MANAGE_ORDERS],

  // Construction specific
  [Role.FOREMAN]: [Permission.MANAGE_INVENTORY],

  [Role.CONTRACTOR]: [],

  [Role.SITE_MANAGER]: [],

  // Cybercafe specific
  [Role.TECH_SUPPORT]: [],

  [Role.NETWORK_ADMIN]: [],

  // Event planning specific
  [Role.EVENT_COORDINATOR]: [Permission.MANAGE_APPOINTMENTS],

  [Role.DECORATOR]: [],

  // Security specific
  [Role.SECURITY_GUARD]: [],

  [Role.SECURITY_MANAGER]: [],

  // Read-only role
  [Role.VIEWER]: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_PRODUCTS,
    Permission.VIEW_INVENTORY,
    Permission.VIEW_ORDERS,
    Permission.VIEW_CUSTOMERS,
    Permission.VIEW_SETTINGS,
  ],

  // Default user
  [Role.USER]: [Permission.VIEW_DASHBOARD],
};

// Helper function to get all permissions for a role including inherited ones
export function getAllPermissionsForRole(role: Role): Permission[] {
  const permissions = new Set<Permission>(directRolePermissions[role] || []);

  // Get permissions from parent roles
  const getParentPermissions = (currentRole: Role) => {
    const parentRoles = roleHierarchy[currentRole] || [];

    for (const parentRole of parentRoles) {
      // Add direct permissions from parent
      for (const permission of directRolePermissions[parentRole] || []) {
        permissions.add(permission);
      }

      // Recursively get permissions from grandparents
      getParentPermissions(parentRole);
    }
  };

  getParentPermissions(role);
  return Array.from(permissions);
}

// Export a map of all permissions for each role (for quick lookup)
export const rolePermissionsMap = Object.fromEntries(
  Object.values(Role).map((role) => [role, getAllPermissionsForRole(role)])
) as Record<Role, Permission[]>;
