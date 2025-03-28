"use server";

import { prisma } from "@/lib/prisma";
import { BusinessType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { createSlug } from "@/lib/utils";

export async function createTenant(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const businessType = formData.get("businessType") as BusinessType;
    const description = formData.get("description") as string | null;
    const userId = formData.get("userId") as string;

    if (!name || !businessType || !userId) {
      return {
        success: false,
        message: "Missing required fields",
      };
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        tenant: true,
        tenants: true, // Include all tenants the user owns
        subscriptions: {
          where: { status: "ACTIVE" },
          include: { plan: true },
          orderBy: { endDate: "desc" },
          take: 1,
        },
      },
    });

    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    // Check subscription limits
    const activeSubscription = user.subscriptions[0];

    if (activeSubscription) {
      const { plan } = activeSubscription;
      // Fix: Check against the length of user.tenants array
      const currentTenantCount = user.tenants.length;

      if (currentTenantCount >= plan.maxTenants) {
        return {
          success: false,
          message: `Your ${plan.name} plan allows a maximum of ${plan.maxTenants} businesses. Please upgrade your subscription to add more.`,
        };
      }
    } else {
      // If no active subscription, check if they're allowed to create a tenant
      // You might want to allow one free tenant or restrict based on your business logic
      if (user.tenants.length >= 1) {
        return {
          success: false,
          message:
            "You need an active subscription to create additional businesses.",
        };
      }
    }

    // Create slug from name
    const slug = createSlug(name);
    const subdomain = slug;

    // Check if site with this subdomain already exists
    const existingSite = await prisma.site.findFirst({
      where: {
        subdomain: { equals: subdomain, mode: "insensitive" },
      },
    });

    if (existingSite) {
      return {
        success: false,
        message:
          "A business with this subdomain already exists. Please choose a different name.",
      };
    }

    // Check if tenant with this name or slug already exists
    const existingTenant = await prisma.tenant.findFirst({
      where: {
        OR: [
          { name: { equals: name, mode: "insensitive" } },
          { slug: { equals: slug, mode: "insensitive" } },
        ],
      },
    });

    if (existingTenant) {
      return {
        success: false,
        message: "A business with this name already exists",
      };
    }

    // Create the new tenant with a transaction to ensure both tenant and site are created
    const result = await prisma.$transaction(async (tx) => {
      // Create the tenant first
      const tenant = await tx.tenant.create({
        data: {
          name,
          slug, // Add the slug field
          businessType,
          description,
          users: {
            connect: {
              id: userId,
            },
          },
          // Create default settings for the tenant
          settings: {
            create: {
              storeName: name,
              // Set appropriate defaults based on business type
              tableManagement:
                businessType === "RESTAURANT" || businessType === "BAR",
              roomManagement: businessType === "HOTEL",
              appointmentSystem: ["SALON", "SERVICE"].includes(businessType),
            },
          },
          // Create a member record for the user as admin
          members: {
            create: {
              userId,
              role: "ADMIN",
            },
          },
        },
        include: {
          settings: true,
        },
      });

      // Create the site with the subdomain
      const site = await tx.site.create({
        data: {
          name,
          subdomain,
          tenantId: tenant.id,
        },
      });

      // Update user's active tenant if this is their first tenant
      if (!user.tenantId || user.tenants.length === 0) {
        await tx.user.update({
          where: { id: userId },
          data: { tenantId: tenant.id },
        });
      }

      // Create audit log for tenant creation
      await tx.auditLog.create({
        data: {
          action: "CREATE",
          modelName: "Tenant",
          recordId: tenant.id,
          newData: { name, slug, businessType, description, subdomain },
          createdById: userId,
          tenantId: tenant.id,
        },
      });

      return { tenant, site };
    });

    revalidatePath("/pos");

    return {
      success: true,
      message: "Business created successfully",
      tenant: result.tenant,
      site: result.site,
    };
  } catch (error) {
    console.error("Error creating tenant:", error);
    return {
      success: false,
      message: "Failed to create business",
    };
  }
}
