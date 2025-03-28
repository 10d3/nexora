"use client";

import { ReactNode } from "react";
import { useSession } from "next-auth/react";
import { Permission } from "@/lib/permissions/role-permissions";
import {
  //   hasPermission,
  hasAnyPermission,
  hasAllPermissions,
} from "@/lib/permissions/check-permission";

interface PermissionGateProps {
  children: ReactNode;
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean;
  fallback?: ReactNode;
}

/**
 * A component that conditionally renders its children based on user permissions
 */
export function PermissionGate({
  children,
  permission,
  permissions = [],
  requireAll = false,
  fallback = null,
}: PermissionGateProps) {
  const { data: session } = useSession();
  const user = session?.user;

  // If a single permission is provided, add it to the permissions array
  const allPermissions = permission
    ? [permission, ...permissions]
    : permissions;

  // If no permissions are specified, render the children
  if (allPermissions.length === 0) {
    return <>{children}</>;
  }

  // Check if the user has the required permissions
  const hasRequiredPermissions = requireAll
    ? hasAllPermissions(user, allPermissions)
    : hasAnyPermission(user, allPermissions);

  // Render the children if the user has the required permissions, otherwise render the fallback
  return hasRequiredPermissions ? <>{children}</> : <>{fallback}</>;
}
