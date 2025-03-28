import { Role } from "@prisma/client";
import { Permission, rolePermissionsMap } from "./role-permissions";

export interface UserWithRole {
  role?: string;
  // Add other user properties as needed
}

/**
 * Check if a user has a specific permission
 * @param user The user object with role information
 * @param permission The permission to check
 * @returns Boolean indicating if the user has the permission
 */
export function hasPermission(
  user: UserWithRole | undefined,
  permission: Permission
): boolean {
  if (!user || !user.role) {
    return false;
  }

  try {
    const userRole = user.role as Role;
    const permissions = rolePermissionsMap[userRole] || [];
    return permissions.includes(permission);
  } catch (error) {
    console.error("Error checking permission:", error);
    return false;
  }
}

/**
 * Check if a user has any of the specified permissions
 * @param user The user object with role information
 * @param permissions Array of permissions to check
 * @returns Boolean indicating if the user has any of the permissions
 */
export function hasAnyPermission(
  user: UserWithRole | undefined,
  permissions: Permission[]
): boolean {
  return permissions.some((permission) => hasPermission(user, permission));
}

/**
 * Check if a user has all of the specified permissions
 * @param user The user object with role information
 * @param permissions Array of permissions to check
 * @returns Boolean indicating if the user has all of the permissions
 */
export function hasAllPermissions(
  user: UserWithRole | undefined,
  permissions: Permission[]
): boolean {
  return permissions.every((permission) => hasPermission(user, permission));
}
