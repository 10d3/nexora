"use server";
import { prisma } from "@/lib/prisma";
import { auth } from "../auth";

/**
 * Gets all tenants a user has access to and determines the active tenant
 * @param userId The user ID to fetch tenants for
 * @param tenantSlug The slug of the tenant to set as active
 * @returns Object containing allTenants, activeTenant, and formatted tenantsData for the sidebar
 */
export async function getAllTenants(
  includeSiteInfo?: boolean,
  tenantSlug?: string,
  userId1?: string
) {
  let session;

  if (!userId1) {
    session = await auth();
  }

  const userId = userId1 || session?.user.id;

  if (!userId) {
    console.error("No user ID found");
    return { allTenants: [], activeTenant: null, tenantsData: [] };
  }

  // 1. Tenants the user owns (direct relation)
  const ownedTenants = await prisma.tenant.findMany({
    where: {
      users: {
        some: {
          id: userId,
        },
      },
    },
    include: {
      settings: true,
      site: includeSiteInfo,
    },
  });

  // Get IDs of owned tenants to exclude them from member query
  const ownedTenantIds = ownedTenants.map((tenant) => tenant.id);

  // 2. Tenants where the user is a member (excluding owned tenants)
  const memberTenants = await prisma.tenant.findMany({
    where: {
      members: {
        some: {
          userId,
        },
      },
      // Exclude tenants that the user already owns
      id: {
        notIn: ownedTenantIds,
      },
    },
    include: {
      settings: true,
      members: {
        where: {
          userId,
        },
        select: {
          role: true,
        },
      },
    },
  });

  // Combine all tenants
  const allTenants = [
    ...ownedTenants.map((tenant) => ({
      ...tenant,
      role: "OWNER", // Assuming ownership means OWNER role
    })),
    ...memberTenants.map((tenant) => ({
      ...tenant,
      role: tenant.members[0]?.role || "MEMBER", // Get the user's role in this tenant
    })),
  ];

  // Rest of the function remains the same
  if (allTenants.length === 0) {
    console.error("No tenants found for user:", userId);
    return { allTenants: [], activeTenant: null, tenantsData: [] };
  }

  // Get the active tenant from the user's session
  let activeTenant = allTenants.find((tenant) => tenant.slug === tenantSlug);

  // If no active tenant is set, use the first one
  if (!activeTenant) {
    activeTenant = allTenants[0];
  }

  // Format tenant data for the sidebar
  const tenantsData = allTenants.map((tenant) => ({
    id: tenant.id,
    name: tenant.name,
    businessType: tenant.businessType,
    logo: tenant.settings?.logoUrl || null,
    role: tenant.role,
    slug: tenant.slug,
  }));

  return {
    allTenants,
    activeTenant,
    tenantsData,
  };
}
