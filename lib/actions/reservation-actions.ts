/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ReservationStatus } from "@prisma/client";

// Validation schema for creating/updating reservations
const reservationSchema = z.object({
  id: z.string().optional(),
  customerName: z.string().min(1, "Customer name is required"),
  customerPhone: z.string().optional().nullable(),
  customerEmail: z.string().email().optional().nullable(),
  startTime: z.coerce.date(),
  endTime: z.coerce.date().optional().nullable(),
  size: z.coerce.number().int().min(1, "Size must be at least 1"),
  specialRequests: z.string().optional().nullable(),
  status: z.string().default("CONFIRMED"),
  resourceId: z.string().optional().nullable(),
  resourceName: z.string().optional().nullable(),
  resourceType: z.string().optional().nullable(),
  tableId: z.string().optional().nullable(),
});

export async function getReservations(
  businessType: string,
  tenantId: string,
  startDate?: Date,
  endDate?: Date,
  status?: string[],
  resourceIds?: string[],
  search?: string
) {
  try {
    // Build filter conditions
    const where: any = { tenantId };

    // Date range filter
    if (startDate && endDate) {
      where.reservationTime = {
        gte: startDate,
        lte: endDate,
      };
    }

    // Status filter
    if (status && status.length > 0) {
      where.status = {
        in: status.map((s) => s as ReservationStatus),
      };
    }

    // Resource filter
    if (resourceIds && resourceIds.length > 0) {
      if (resourceIds.includes("unassigned")) {
        where.OR = [
          { tableId: { in: resourceIds.filter((id) => id !== "unassigned") } },
          { tableId: null },
        ];
      } else {
        where.tableId = { in: resourceIds };
      }
    }

    // Search filter
    if (search) {
      where.OR = [
        ...(where.OR || []),
        { customerName: { contains: search, mode: "insensitive" } },
        { customerEmail: { contains: search, mode: "insensitive" } },
        { customerPhone: { contains: search, mode: "insensitive" } },
      ];
    }

    const reservations = await prisma.reservation.findMany({
      where,
      orderBy: { reservationTime: "asc" },
      include: {
        table: true,
      },
    });

    // Transform the data to match the expected format in the frontend
    const transformedReservations = reservations.map((reservation) => ({
      id: reservation.id,
      customerName: reservation.customerName,
      customerEmail: reservation.customerEmail,
      customerPhone: reservation.customerPhone,
      startTime: reservation.reservationTime,
      endTime: reservation.endTime,
      size: reservation.partySize,
      notes: reservation.specialRequests,
      status: reservation.status,
      resourceId: reservation.tableId,
      resourceName: reservation.table
        ? `Table ${reservation.table.number}`
        : null,
      resourceType: "TABLE",
    }));

    return { success: true, data: transformedReservations };
  } catch (error) {
    console.error("Error fetching reservations:", error);
    return { success: false, error: "Failed to fetch reservations" };
  }
}

export async function getResources(businessType: string, tenantId: string) {
  try {
    // For restaurant business type, get tables as resources
    if (businessType === "RESTAURANT") {
      const tables = await prisma.table.findMany({
        where: { tenantId },
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
      const rooms = await prisma.room.findMany({
        where: { tenantId },
        select: {
          id: true,
          number: true,
          capacity: true,
          type: true,
          status: true,
        },
      });

      return {
        success: true,
        data: rooms.map((room) => ({
          id: room.id,
          name: `Room ${room.number} (${room.type})`,
          capacity: room.capacity,
          type: "ROOM",
          status: room.status,
        })),
      };
    }

    // For service businesses, get staff as resources
    if (businessType === "SERVICE" || businessType === "SALON") {
      const staff = await prisma.staff.findMany({
        where: { tenantId },
        select: {
          id: true,
          name: true,
          specialization: true,
        },
      });

      return {
        success: true,
        data: staff.map((person) => ({
          id: person.id,
          name: person.name,
          type: "STAFF",
          specialization: person.specialization,
        })),
      };
    }

    // Default empty resources for other business types
    return { success: true, data: [] };
  } catch (error) {
    console.error("Error fetching resources:", error);
    return { success: false, error: "Failed to fetch resources" };
  }
}

export async function createReservation(
  businessType: string,
  data: z.infer<typeof reservationSchema>,
  tenantId: string
) {
  try {
    const validatedData = reservationSchema.parse(data);

    // Map the frontend data structure to the Prisma schema
    const reservationData = {
      tenantId,
      customerName: validatedData.customerName,
      customerEmail: validatedData.customerEmail,
      customerPhone: validatedData.customerPhone,
      reservationTime: validatedData.startTime,
      endTime: validatedData.endTime,
      partySize: validatedData.size,
      specialRequests: validatedData.specialRequests,
      status: validatedData.status as ReservationStatus,
      tableId: validatedData.resourceId || validatedData.tableId,
    };

    // Create the reservation
    const reservation = await prisma.reservation.create({
      data: reservationData,
    });

    revalidatePath("/dashboard/reservations");
    return { success: true, data: reservation };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    console.error("Error creating reservation:", error);
    return { success: false, error: "Failed to create reservation" };
  }
}

export async function updateReservation(
  businessType: string,
  data: z.infer<typeof reservationSchema>,
  tenantId: string
) {
  try {
    const validatedData = reservationSchema.parse(data);
    const id = validatedData.id;

    if (!id) {
      return { success: false, error: "Reservation ID is required" };
    }

    // Check if reservation exists and belongs to tenant
    const existingReservation = await prisma.reservation.findFirst({
      where: { id, tenantId },
    });

    if (!existingReservation) {
      return { success: false, error: "Reservation not found" };
    }

    // Map the frontend data structure to the Prisma schema
    const reservationData = {
      customerName: validatedData.customerName,
      customerEmail: validatedData.customerEmail,
      customerPhone: validatedData.customerPhone,
      reservationTime: validatedData.startTime,
      endTime: validatedData.endTime,
      partySize: validatedData.size,
      specialRequests: validatedData.specialRequests,
      status: validatedData.status as ReservationStatus,
      tableId: validatedData.resourceId || validatedData.tableId,
    };

    // Update the reservation
    const reservation = await prisma.reservation.update({
      where: { id },
      data: reservationData,
    });

    revalidatePath("/dashboard/reservations");
    return { success: true, data: reservation };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    console.error("Error updating reservation:", error);
    return { success: false, error: "Failed to update reservation" };
  }
}

export async function deleteReservation(
  businessType: string,
  id: string,
  tenantId: string
) {
  try {
    // Check if reservation exists and belongs to tenant
    const existingReservation = await prisma.reservation.findFirst({
      where: { id, tenantId },
    });

    if (!existingReservation) {
      return { success: false, error: "Reservation not found" };
    }

    // Delete the reservation
    await prisma.reservation.delete({
      where: { id },
    });

    revalidatePath("/dashboard/reservations");
    return { success: true };
  } catch (error) {
    console.error("Error deleting reservation:", error);
    return { success: false, error: "Failed to delete reservation" };
  }
}

export async function updateReservationStatus(
  businessType: string,
  id: string,
  status: string,
  tenantId: string
) {
  try {
    // Check if reservation exists and belongs to tenant
    const existingReservation = await prisma.reservation.findFirst({
      where: { id, tenantId },
    });

    if (!existingReservation) {
      return { success: false, error: "Reservation not found" };
    }

    // Update the reservation status
    const reservation = await prisma.reservation.update({
      where: { id },
      data: { status: status as ReservationStatus },
    });

    revalidatePath("/dashboard/reservations");
    return { success: true, data: reservation };
  } catch (error) {
    console.error("Error updating reservation status:", error);
    return { success: false, error: "Failed to update reservation status" };
  }
}

export async function updateReservationResource(
  businessType: string,
  id: string,
  resourceId: string,
  tenantId: string
) {
  try {
    // Check if reservation exists and belongs to tenant
    const existingReservation = await prisma.reservation.findFirst({
      where: { id, tenantId },
    });

    if (!existingReservation) {
      return { success: false, error: "Reservation not found" };
    }

    // If resourceId is provided, verify that the table exists
    if (resourceId && resourceId !== "") {
      const tableExists = await prisma.table.findUnique({
        where: { id: resourceId },
      });

      if (!tableExists) {
        return { success: false, error: "Table not found" };
      }
    }

    // Update the reservation resource (tableId in the database)
    const reservation = await prisma.reservation.update({
      where: { id },
      data: { tableId: resourceId || null },
    });

    // Make sure to revalidate the path to refresh the data
    revalidatePath(`/reservations`);
    return { success: true, data: reservation };
  } catch (error) {
    console.error("Error updating reservation resource:", error);
    return { success: false, error: "Failed to update reservation resource" };
  }
}
