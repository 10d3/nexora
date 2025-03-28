import { auth } from "@/lib/auth";
import { Permission } from "./role-permissions";
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
} from "./check-permission";
import { redirect } from "next/navigation";

/**
 * Check if the current user has a specific permission (server-side)
 * @param permission The permission to check
 * @param redirectTo Optional path to redirect to if permission is denied
 * @returns Promise resolving to a boolean indicating if the user has the permission
 */
export async function checkPermission(
  permission: Permission,
  redirectTo?: string
): Promise<boolean> {
  const session = await auth();
  const user = session?.user;

  const hasAccess = hasPermission(user, permission);

  if (!hasAccess && redirectTo) {
    redirect(redirectTo);
  }

  return hasAccess;
}

/**
 * Check if the current user has any of the specified permissions (server-side)
 * @param permissions Array of permissions to check
 * @param redirectTo Optional path to redirect to if permission is denied
 * @returns Promise resolving to a boolean indicating if the user has any of the permissions
 */
export async function checkAnyPermission(
  permissions: Permission[],
  redirectTo?: string
): Promise<boolean> {
  const session = await auth();
  const user = session?.user;

  const hasAccess = hasAnyPermission(user, permissions);

  if (!hasAccess && redirectTo) {
    redirect(redirectTo);
  }

  return hasAccess;
}

/**
 * Check if the current user has all of the specified permissions (server-side)
 * @param permissions Array of permissions to check
 * @param redirectTo Optional path to redirect to if permission is denied
 * @returns Promise resolving to a boolean indicating if the user has all of the permissions
 */
export async function checkAllPermissions(
  permissions: Permission[],
  redirectTo?: string
): Promise<boolean> {
  const session = await auth();
  const user = session?.user;

  const hasAccess = hasAllPermissions(user, permissions);

  if (!hasAccess && redirectTo) {
    redirect(redirectTo);
  }

  return hasAccess;
}
