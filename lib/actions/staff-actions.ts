/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { checkPermission } from "../permissions/server-permissions";
import { Permission } from "../permissions/role-permissions";
import { BusinessType } from "@prisma/client";

// Validation schema for creating/updating staff
const staffSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  specialization: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  services: z.array(z.string()).optional(),
});

export async function getStaff(
  businessType: BusinessType,
  tenantId: string,
  search?: string,
  specializations?: string[]
) {
  try {
    // Check if user has permission to view staff
    const hasPermission = await checkPermission(Permission.VIEW_USERS);
    if (!hasPermission) {
      return { error: "You don't have permission to view staff" };
    }

    // Build filter conditions
    const where: any = { tenantId };

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { specialization: { contains: search, mode: "insensitive" } },
      ];
    }

    // Specialization filter
    if (specializations && specializations.length > 0) {
      where.specialization = {
        in: specializations,
      };
    }

    const staff = await prisma.staff.findMany({
      where,
      include: {
        services: {
          include: {
            service: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    // Transform the data to match the expected format in the frontend
    const transformedStaff = staff.map((s) => ({
      id: s.id,
      name: s.name,
      email: s.email,
      phone: s.phone,
      specialization: s.specialization,
      bio: s.bio,
      image: s.image,
      services: s.services.map((service) => ({
        id: service.serviceId,
        name: service.service.name,
      })),
    }));

    return { success: true, data: transformedStaff };
  } catch (error) {
    console.error("Error fetching staff:", error);
    return { success: false, error: "Failed to fetch staff" };
  }
}

export async function createStaff(
  businessType: BusinessType,
  data: z.infer<typeof staffSchema>,
  tenantId: string
) {
  try {
    console.log(data)
    // Check if user has permission to create staff
    const hasPermission = await checkPermission(Permission.MANAGE_USERS);
    if (!hasPermission) {
      return {
        success: false,
        error: "You don't have permission to create staff",
      };
    }

    const validatedData = staffSchema.parse(data);

    // Create the staff member
    const staff = await prisma.staff.create({
      data: {
        tenantId,
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        specialization: validatedData.specialization,
        bio: validatedData.bio,
        image: validatedData.image,
        services: {
          create:
            validatedData.services?.map((serviceId) => ({
              serviceId,
              tenantId,
            })) || [],
        },
      },
    });

    revalidatePath("/staff");
    return { success: true, data: staff };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    console.error("Error creating staff:", error);
    return { success: false, error: "Failed to create staff" };
  }
}

export async function updateStaff(
  businessType: BusinessType,
  data: z.infer<typeof staffSchema>,
  tenantId: string
) {
  try {
    // Check if user has permission to update staff
    const hasPermission = await checkPermission(Permission.MANAGE_USERS);
    if (!hasPermission) {
      return {
        success: false,
        error: "You don't have permission to update staff",
      };
    }

    const validatedData = staffSchema.parse(data);
    const { id, services, ...staffData } = validatedData;

    if (!id) {
      return { success: false, error: "Staff ID is required" };
    }

    // Update the staff in a transaction to handle services properly
    const staff = await prisma.$transaction(async (tx) => {
      // Update the staff record
      const updatedStaff = await tx.staff.update({
        where: { id },
        data: staffData,
      });

      // If services are provided, update them
      if (services) {
        // Delete existing services
        await tx.staffService.deleteMany({
          where: { staffId: id },
        });

        // Create new services
        if (services.length > 0) {
          await tx.staffService.createMany({
            data: services.map((serviceId) => ({
              staffId: id,
              serviceId,
              tenantId,
            })),
          });
        }
      }

      return updatedStaff;
    });

    revalidatePath("/staff");
    return { success: true, data: staff };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    console.error("Error updating staff:", error);
    return { success: false, error: "Failed to update staff" };
  }
}

export async function deleteStaff(id: string, tenantId: string) {
  try {
    // Check if user has permission to delete staff
    const hasPermission = await checkPermission(Permission.MANAGE_USERS);
    if (!hasPermission) {
      return {
        success: false,
        error: "You don't have permission to delete staff",
      };
    }

    // Check if staff exists and belongs to the tenant
    const staff = await prisma.staff.findFirst({
      where: { id, tenantId },
    });

    if (!staff) {
      return { success: false, error: "Staff not found" };
    }

    // Delete the staff
    await prisma.staff.delete({
      where: { id },
    });

    revalidatePath("/staff");
    return { success: true };
  } catch (error) {
    console.error("Error deleting staff:", error);
    return { success: false, error: "Failed to delete staff" };
  }
}

export async function getServices(tenantId: string) {
  try {
    const services = await prisma.product.findMany({
      where: {
        tenantId,
        isService: true,
      },
      select: {
        id: true,
        name: true,
        price: true,
        duration: true,
        description: true,
      },
    });

    return { success: true, data: services };
  } catch (error) {
    console.error("Error fetching services:", error);
    return { success: false, error: "Failed to fetch services" };
  }
}

