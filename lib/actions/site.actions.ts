/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function getSite(tenantId: string) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      throw new Error("Unauthorized");
    }

    if (!tenantId) {
      throw new Error("No active tenant");
    }

    const site = await prisma.site.findUnique({
      where: { tenantId },
    });

    return site;
  } catch (error) {
    console.error("Error fetching site:", error);
    throw error;
  }
}

export async function updateSite(formData: any, tenantId: string) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      throw new Error("Unauthorized");
    }

    if (!tenantId) {
      throw new Error("No active tenant");
    }

    // Check if the custom domain is already in use by another site
    if (formData.customDomain) {
      const existingDomain = await prisma.site.findUnique({
        where: { customDomain: formData.customDomain },
      });

      if (existingDomain && existingDomain.tenantId !== tenantId) {
        throw new Error("This custom domain is already in use");
      }
    }

    // Check if the subdomain is already in use by another site
    if (formData.subdomain) {
      const existingSubdomain = await prisma.site.findUnique({
        where: { subdomain: formData.subdomain },
      });

      if (existingSubdomain && existingSubdomain.tenantId !== tenantId) {
        throw new Error("This subdomain is already in use");
      }
    }

    // Check if site exists for this tenant
    const existingSite = await prisma.site.findUnique({
      where: { tenantId },
    });

    let site;

    if (existingSite) {
      // Update existing site
      site = await prisma.site.update({
        where: { tenantId },
        data: {
          name: formData.name,
          subdomain: formData.subdomain || null,
          customDomain: formData.customDomain || null,
        },
      });
    } else {
      // Create new site
      site = await prisma.site.create({
        data: {
          name: formData.name,
          subdomain: formData.subdomain || null,
          customDomain: formData.customDomain || null,
          tenantId,
        },
      });
    }

    // Revalidate the settings page
    revalidatePath(`/pos/(dashboard)/[tenantName]/settings/general`);

    return site;
  } catch (error) {
    console.error("Error updating site:", error);
    throw error;
  }
}