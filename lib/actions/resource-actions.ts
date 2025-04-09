/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { prisma } from "@/lib/prisma";
import { TableStatus, RoomStatus, StaffStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

type ResourceFilter = {
  status?: string[];
  type?: string[];
  search?: string;
};

export async function getResources(
  businessType: string,
  tenantId: string,
  filters: ResourceFilter = {}
) {
  try {

    console.log(filters)
    const { status, type, search } = filters;

    // For restaurant business type, get tables as resources
    if (businessType === "RESTAURANT") {
      const tableStatusFilter =
        status && status.length > 0
          ? { status: { in: status.map((s) => s as TableStatus) } }
          : {};

      const tables = await prisma.table.findMany({
        where: {
          tenantId,
          ...tableStatusFilter,
          ...(search
            ? { number: { contains: search, mode: "insensitive" } }
            : {}),
        },
        select: {
          id: true,
          number: true,
          capacity: true,
          status: true,
        },
      });

      return {
        success: true,
        data: tables.map((table) => ({
          id: table.id,
          name: `Table ${table.number}`,
          capacity: table.capacity,
          type: "TABLE",
          status: table.status,
        })),
      };
    }

    // For hotel business type, get rooms as resources
    if (businessType === "HOTEL") {
      const roomStatusFilter =
        status && status.length > 0
          ? { status: { in: status.map((s) => s as RoomStatus) } }
          : {};

      const rooms = await prisma.room.findMany({
        where: {
          tenantId,
          ...roomStatusFilter,
          ...(type && type.length > 0 ? { type: { in: type } } : {}),
          ...(search
            ? {
                OR: [
                  { number: { contains: search, mode: "insensitive" } },
                  { type: { contains: search, mode: "insensitive" } },
                ],
              }
            : {}),
        },
        select: {
          id: true,
          number: true,
          capacity: true,
          type: true,
          status: true,
          rate: true,
        },
      });

      return {
        success: true,
        data: rooms.map((room) => ({
          id: room.id,
          name: `Room ${room.number} (${room.type})`,
          capacity: room.capacity,
          type: "ROOM",
          roomType: room.type,
          status: room.status,
          rate: room.rate,
        })),
      };
    }

    // For service businesses, get staff as resources
    if (businessType === "SERVICE") {
      const staff = await prisma.universalStaff.findMany({
        where: {
          tenantId,
          ...(status && status.length > 0
            ? { status: { in: status.map((s) => s as StaffStatus) } }
            : {}),
          ...(type && type.length > 0 ? { position: { in: type } } : {}),
          ...(search
            ? {
                OR: [
                  { user: { name: { contains: search, mode: "insensitive" } } },
                  { position: { contains: search, mode: "insensitive" } },
                ],
              }
            : {}),
        },
        select: {
          id: true,
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          position: true,
          status: true,
        },
      });

      return {
        success: true,
        data: staff.map((person) => ({
          id: person.id,
          name: person.user.name,
          type: "STAFF",
          specialization: person.position,
          email: person.user.email,
          status: person.status,
        })),
      };
    }

    // For SALON and OTHER business types, get assets as resources
    if (businessType === "SALON" || businessType === "OTHER") {
      const assets = await prisma.asset.findMany({
        where: {
          tenantId,
          ...(status && status.length > 0 ? { status: { in: status } } : {}),
          ...(type && type.length > 0 ? { type: { in: type } } : {}),
          ...(search
            ? {
                OR: [
                  { name: { contains: search, mode: "insensitive" } },
                  { type: { contains: search, mode: "insensitive" } },
                ],
              }
            : {}),
        },
        select: {
          id: true,
          name: true,
          type: true,
          status: true,
          condition: true,
        },
      });

      return {
        success: true,
        data: assets.map((asset) => ({
          id: asset.id,
          name: asset.name,
          type: "ASSET",
          assetType: asset.type,
          status: asset.status,
          condition: asset.condition,
        })),
      };
    }

    // For unsupported business types
    return {
      success: false,
      error: "Unsupported business type",
    };
  } catch (error) {
    console.error("Error fetching resources:", error);
    return { success: false, error: "Failed to fetch resources" };
  }
}

export async function createResource(
  businessType: string,
  resourceData: any,
  tenantId: string
) {
  console.log("Resooources : ",resourceData)
  try {
    let result;

    // For restaurant business type, create a table
    if (businessType === "RESTAURANT") {
      // Validate required fields
      if (!resourceData.name || !resourceData.capacity) {
        return {
          success: false,
          error: "Table number and capacity are required",
        };
      }

      try {
        result = await prisma.table.create({
          data: {
            tenantId,
            number: resourceData.name,
            capacity: parseInt(resourceData.capacity),
            status: (resourceData.status as TableStatus) || TableStatus.AVAILABLE,
          },
        });

        revalidatePath(`/pos/(dashboard)/${tenantId}/resources`);
        return {
          success: true,
          data: {
            id: result.id,
            name: `Table ${result.number}`,
            capacity: result.capacity,
            type: "TABLE",
            status: result.status,
          },
        };
      } catch (error) {
        console.error("Error creating table:", error);
        return {
          success: false,
          error: "Failed to create table. Please check if table number is unique.",
        };
      }
    }

    // For hotel business type, create a room
    if (businessType === "HOTEL") {
      result = await prisma.room.create({
        data: {
          tenantId,
          number: resourceData.number,
          capacity: resourceData.capacity,
          type: resourceData.type,
          rate: resourceData.rate,
          status: (resourceData.status as RoomStatus) || RoomStatus.AVAILABLE,
        },
      });

      revalidatePath(`/pos/(dashboard)/${tenantId}/resources`);
      return {
        success: true,
        data: {
          id: result.id,
          name: `Room ${result.number} (${result.type})`,
          capacity: result.capacity,
          type: "ROOM",
          roomType: result.type,
          status: result.status,
          rate: result.rate,
        },
      };
    }

    // For service businesses, create a staff member
    if (businessType === "SERVICE") {
      const user = await prisma.user.create({
        data: {
          name: resourceData.name,
          email: resourceData.email,
          password: resourceData.password || "defaultPassword",
          role: "EMPLOYEE", // Using EMPLOYEE role from the Role enum
        },
      });

      result = await prisma.universalStaff.create({
        data: {
          tenantId,
          userId: user.id,
          position: resourceData.specialization,
          status: (resourceData.status as StaffStatus) || StaffStatus.ACTIVE,
          department: resourceData.department,
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });

      revalidatePath(`/pos/(dashboard)/${tenantId}/resources`);
      return {
        success: true,
        data: {
          id: result.id,
          name: result.user.name,
          type: "STAFF",
          specialization: result.position,
          email: result.user.email,
          status: result.status,
        },
      };
    }

    // For SALON and OTHER business types, create an asset
    if (businessType === "SALON" || businessType === "OTHER") {
      // Validate required fields
      if (!resourceData.name || !resourceData.type) {
        return {
          success: false,
          error: "Asset name and type are required",
        };
      }

      result = await prisma.asset.create({
        data: {
          tenantId,
          name: resourceData.name,
          type: resourceData.assetType || resourceData.type,
          status: resourceData.status || "AVAILABLE",
          condition: resourceData.condition || "GOOD",
          projectId: resourceData.projectId,
        },
      });

      revalidatePath(`/pos/(dashboard)/${tenantId}/resources`);
      return {
        success: true,
        data: {
          id: result.id,
          name: result.name,
          type: "ASSET",
          assetType: result.type,
          status: result.status,
          condition: result.condition,
        },
      };
    }

    return {
      success: false,
      error: "Unsupported business type",
    };
  } catch (error) {
    console.error("Error creating resource:", error);
    return { success: false, error: "Failed to create resource" };
  }
}

export async function updateResource(
  businessType: string,
  resourceData: any,
  tenantId: string
) {
  try {
    let result;

    // For restaurant business type, update a table
    if (businessType === "RESTAURANT") {
      result = await prisma.table.update({
        where: { id: resourceData.id },
        data: {
          number: resourceData.name,
          capacity: resourceData.capacity,
          status: resourceData.status as TableStatus,
        },
      });

      revalidatePath(`/pos/(dashboard)/${tenantId}/resources`);
      return {
        success: true,
        data: {
          id: result.id,
          name: `Table ${result.number}`,
          capacity: result.capacity,
          type: "TABLE",
          status: result.status,
        },
      };
    }

    // For hotel business type, update a room
    if (businessType === "HOTEL") {
      result = await prisma.room.update({
        where: { id: resourceData.id },
        data: {
          number: resourceData.number,
          capacity: resourceData.capacity,
          type: resourceData.type,
          rate: resourceData.rate,
          status: resourceData.status as RoomStatus,
        },
      });

      revalidatePath(`/pos/(dashboard)/${tenantId}/resources`);
      return {
        success: true,
        data: {
          id: result.id,
          name: `Room ${result.number} (${result.type})`,
          capacity: result.capacity,
          type: "ROOM",
          roomType: result.type,
          status: result.status,
          rate: result.rate,
        },
      };
    }

    // For service businesses, update a staff member
    if (businessType === "SERVICE") {
      const staff = await prisma.universalStaff.findUnique({
        where: { id: resourceData.id },
        include: { user: true },
      });

      if (!staff) {
        return { success: false, error: "Staff not found" };
      }

      await prisma.user.update({
        where: { id: staff.userId },
        data: {
          name: resourceData.name,
          email: resourceData.email,
        },
      });

      result = await prisma.universalStaff.update({
        where: { id: resourceData.id },
        data: {
          position: resourceData.specialization,
          status: resourceData.status as StaffStatus,
          department: resourceData.department,
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });

      revalidatePath(`/pos/(dashboard)/${tenantId}/resources`);
      return {
        success: true,
        data: {
          id: result.id,
          name: result.user.name,
          type: "STAFF",
          specialization: result.position,
          email: result.user.email,
          status: result.status,
        },
      };
    }

    // For SALON and OTHER business types, update an asset
    if (businessType === "SALON" || businessType === "OTHER") {
      result = await prisma.asset.update({
        where: { id: resourceData.id },
        data: {
          name: resourceData.name,
          type: resourceData.assetType || resourceData.type,
          status: resourceData.status,
          condition: resourceData.condition,
          projectId: resourceData.projectId,
        },
      });

      revalidatePath(`/pos/(dashboard)/${tenantId}/resources`);
      return {
        success: true,
        data: {
          id: result.id,
          name: result.name,
          type: "ASSET",
          assetType: result.type,
          status: result.status,
          condition: result.condition,
        },
      };
    }

    return {
      success: false,
      error: "Unsupported business type",
    };
  } catch (error) {
    console.error("Error updating resource:", error);
    return { success: false, error: "Failed to update resource" };
  }
}

export async function deleteResource(
  businessType: string,
  resourceId: string,
  tenantId: string
) {
  try {
    // For restaurant business type, delete a table
    if (businessType === "RESTAURANT") {
      await prisma.table.delete({
        where: { id: resourceId },
      });

      revalidatePath(`/pos/(dashboard)/${tenantId}/resources`);
      return { success: true };
    }

    // For hotel business type, delete a room
    if (businessType === "HOTEL") {
      await prisma.room.delete({
        where: { id: resourceId },
      });

      revalidatePath(`/pos/(dashboard)/${tenantId}/resources`);
      return { success: true };
    }

    // For service businesses, delete a staff member
    if (businessType === "SERVICE") {
      const staff = await prisma.universalStaff.findUnique({
        where: { id: resourceId },
        select: { userId: true },
      });

      if (staff) {
        await prisma.user.delete({
          where: { id: staff.userId },
        });
      }

      revalidatePath(`/pos/(dashboard)/${tenantId}/resources`);
      return { success: true };
    }

    // For SALON and OTHER business types, delete an asset
    if (businessType === "SALON" || businessType === "OTHER") {
      await prisma.asset.delete({
        where: { id: resourceId },
      });

      revalidatePath(`/pos/(dashboard)/${tenantId}/resources`);
      return { success: true };
    }

    return {
      success: false,
      error: "Unsupported business type",
    };
  } catch (error) {
    console.error("Error deleting resource:", error);
    return { success: false, error: "Failed to delete resource" };
  }
}