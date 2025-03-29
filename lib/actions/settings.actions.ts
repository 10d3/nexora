/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function getSettings(tenantId: string) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      throw new Error("Unauthorized");
    }

    // const tenantId = session.user.tenantId;

    if (!tenantId) {
      throw new Error("No active tenant");
    }

    const settings = await prisma.settings.findUnique({
      where: { tenantId },
    });

    console.log("Settings:", settings);
    return settings;
  } catch (error) {
    console.error("Error fetching settings:", error);
    throw error;
  }
}

export async function updateSettings(formData: any, tenantId: string) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      throw new Error("Unauthorized");
    }

    // const tenantId = session.user.tenantId;

    if (!tenantId) {
      throw new Error("No active tenant");
    }

    // Check if settings exist for this tenant
    const existingSettings = await prisma.settings.findUnique({
      where: { tenantId },
    });

    let settings;

    if (existingSettings) {
      // Update existing settings
      settings = await prisma.settings.update({
        where: { tenantId },
        data: {
          currency: formData.currency,
          taxRate: formData.taxRate,
          storeName: formData.storeName,
          address: formData.address,
          phoneNumber: formData.phoneNumber,
          email: formData.email,
          logoUrl: formData.logoUrl,
          businessHours: formData.businessHours,
          tableManagement: formData.tableManagement,
          roomManagement: formData.roomManagement,
          appointmentSystem: formData.appointmentSystem,
        },
      });
    } else {
      // Create new settings
      settings = await prisma.settings.create({
        data: {
          currency: formData.currency,
          taxRate: formData.taxRate,
          storeName: formData.storeName,
          address: formData.address,
          phoneNumber: formData.phoneNumber,
          email: formData.email,
          logoUrl: formData.logoUrl,
          businessHours: formData.businessHours,
          tableManagement: formData.tableManagement,
          roomManagement: formData.roomManagement,
          appointmentSystem: formData.appointmentSystem,
          tenantId,
        },
      });
    }

    // Revalidate the settings page
    revalidatePath(`/pos/(dashboard)/[tenantName]/settings/general`);

    return settings;
  } catch (error) {
    console.error("Error updating settings:", error);
    throw error;
  }
}
