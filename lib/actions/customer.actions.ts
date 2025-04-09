/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { checkPermission } from "../permissions/server-permissions";
import { Permission } from "../permissions/role-permissions";

// Validation schema for creating/updating customers
const customerSchema = z.object({
  id: z.string().optional(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address").optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  dateOfBirth: z.coerce.date().optional().nullable(),
  gender: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  loyaltyPoints: z.coerce.number().int().optional().nullable(),
  tags: z.string().optional().nullable(),
});

/**
 * Get customers for a tenant with optional filtering
 */
export async function getCustomers(
  tenantId: string,
  search?: string,
  sortBy?: string,
  sortOrder?: "asc" | "desc",
  limit?: number,
  offset?: number
) {
  try {
    // Check if user has permission to view customers
    const hasPermission = await checkPermission(Permission.VIEW_CUSTOMERS);
    if (!hasPermission) {
      return { success: false, error: "You don't have permission to view customers" };
    }

    // Build filter conditions
    const where: any = { tenantId };

    // Search filter
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ];
    }

    // Determine sorting
    const orderBy: any = {};
    if (sortBy) {
      orderBy[sortBy] = sortOrder || "asc";
    } else {
      // Default sorting by last name
      orderBy.lastName = "asc";
    }

    // Get total count for pagination
    const totalCount = await prisma.customerProfile.count({ where });

    // Get customers with pagination
    const customers = await prisma.customerProfile.findMany({
      where,
      orderBy,
      take: limit,
      skip: offset,
    });

    return { 
      success: true, 
      data: customers,
      meta: {
        total: totalCount,
        limit,
        offset,
      }
    };
  } catch (error) {
    console.error("Error fetching customers:", error);
    return { success: false, error: "Failed to fetch customers" };
  }
}

/**
 * Get a single customer by ID
 */
export async function getCustomerById(tenantId: string, customerId: string) {
  try {
    // Check if user has permission to view customers
    const hasPermission = await checkPermission(Permission.VIEW_CUSTOMERS);
    if (!hasPermission) {
      return { success: false, error: "You don't have permission to view customers" };
    }

    const customer = await prisma.customerProfile.findFirst({
      where: {
        id: customerId,
        tenantId,
      },
    });

    if (!customer) {
      return { success: false, error: "Customer not found" };
    }

    return { success: true, data: customer };
  } catch (error) {
    console.error("Error fetching customer:", error);
    return { success: false, error: "Failed to fetch customer" };
  }
}

/**
 * Create a new customer
 */
export async function createCustomer(data: z.infer<typeof customerSchema>, tenantId: string) {
  try {
    // Check if user has permission to manage customers
    const hasPermission = await checkPermission(Permission.MANAGE_CUSTOMERS);
    if (!hasPermission) {
      return { success: false, error: "You don't have permission to create customers" };
    }

    // Validate input data
    const validatedData = customerSchema.parse(data);

    // Create the customer
    const customer = await prisma.customerProfile.create({
      data: {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email,
        phone: validatedData.phone,
        address: validatedData.address,
        dateOfBirth: validatedData.dateOfBirth,
        gender: validatedData.gender,
        notes: validatedData.notes,
        loyaltyPoints: validatedData.loyaltyPoints || 0,
        tags: validatedData.tags,
        tenantId,
        customerSince: new Date(),
      },
    });

    revalidatePath(`/pos/${tenantId}/customers`);
    return { success: true, data: customer };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    console.error("Error creating customer:", error);
    return { success: false, error: "Failed to create customer" };
  }
}

/**
 * Update an existing customer
 */
export async function updateCustomer(
  data: z.infer<typeof customerSchema>,
  tenantId: string
) {
  try {
    // Check if user has permission to manage customers
    const hasPermission = await checkPermission(Permission.MANAGE_CUSTOMERS);
    if (!hasPermission) {
      return { success: false, error: "You don't have permission to update customers" };
    }

    // Validate input data
    const validatedData = customerSchema.parse(data);

    // Ensure customer ID is provided
    if (!validatedData.id) {
      return { success: false, error: "Customer ID is required" };
    }

    // Check if customer exists and belongs to the tenant
    const existingCustomer = await prisma.customerProfile.findFirst({
      where: {
        id: validatedData.id,
        tenantId,
      },
    });

    if (!existingCustomer) {
      return { success: false, error: "Customer not found" };
    }

    // Update the customer
    const customer = await prisma.customerProfile.update({
      where: { id: validatedData.id },
      data: {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email,
        phone: validatedData.phone,
        address: validatedData.address,
        dateOfBirth: validatedData.dateOfBirth,
        gender: validatedData.gender,
        notes: validatedData.notes,
        loyaltyPoints: validatedData.loyaltyPoints,
        tags: validatedData.tags,
      },
    });

    revalidatePath(`/pos/${tenantId}/customers`);
    return { success: true, data: customer };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    console.error("Error updating customer:", error);
    return { success: false, error: "Failed to update customer" };
  }
}

/**
 * Delete a customer
 */
export async function deleteCustomer(customerId: string, tenantId: string) {
  try {
    // Check if user has permission to manage customers
    const hasPermission = await checkPermission(Permission.MANAGE_CUSTOMERS);
    if (!hasPermission) {
      return { success: false, error: "You don't have permission to delete customers" };
    }

    // Check if customer exists and belongs to the tenant
    const existingCustomer = await prisma.customerProfile.findFirst({
      where: {
        id: customerId,
        tenantId,
      },
    });

    if (!existingCustomer) {
      return { success: false, error: "Customer not found" };
    }

    // Delete the customer
    await prisma.customerProfile.delete({
      where: { id: customerId },
    });

    revalidatePath(`/pos/${tenantId}/customers`);
    return { success: true };
  } catch (error) {
    console.error("Error deleting customer:", error);
    return { success: false, error: "Failed to delete customer" };
  }
}