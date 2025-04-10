/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

// Type for API response
type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

/**
 * Fetch menu items with optional filtering
 */
export async function getMenuItems(
  tenantId: string,
  category?: string,
  isAvailable?: boolean,
  search?: string
): Promise<ApiResponse<any[]>> {
  try {
    if (!tenantId) {
      return { success: false, error: "Tenant ID is required" };
    }

    // Base query to get menu items
    const query: any = {
      where: {
        tenantId,
      },
      include: {
        category: true,
      },
      orderBy: {
        name: 'asc',
      },
    };

    // Apply category filter
    if (category) {
      query.where.categoryId = category;
    }

    // Apply availability filter
    if (isAvailable !== undefined) {
      query.where.isAvailable = isAvailable;
    }

    // Apply search filter
    if (search) {
      query.where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { ingredients: { contains: search, mode: "insensitive" } },
      ];
    }

    // Fetch menu items
    const menuItems = await prisma.menuItem.findMany(query);

    return { success: true, data: menuItems };
  } catch (error: any) {
    console.error("Error fetching menu items:", error);
    return { success: false, error: error.message || "Failed to fetch menu items" };
  }
}

/**
 * Get a single menu item by ID
 */
export async function getMenuItemById(
  tenantId: string,
  itemId: string
): Promise<ApiResponse<any>> {
  try {
    if (!tenantId || !itemId) {
      return { success: false, error: "Tenant ID and Item ID are required" };
    }

    const menuItem = await prisma.menuItem.findFirst({
      where: {
        id: itemId,
        tenantId,
      },
      include: {
        category: true,
      },
    });

    if (!menuItem) {
      return { success: false, error: "Menu item not found" };
    }

    return { success: true, data: menuItem };
  } catch (error: any) {
    console.error("Error fetching menu item:", error);
    return { success: false, error: error.message || "Failed to fetch menu item" };
  }
}

/**
 * Create a new menu item
 */
export async function createMenuItem(
  tenantId: string,
  data: any
): Promise<ApiResponse<any>> {
  try {
    if (!tenantId) {
      return { success: false, error: "Tenant ID is required" };
    }

    // Validate required fields
    if (!data.name || data.price === undefined) {
      return { success: false, error: "Name and price are required" };
    }

    // Create the menu item
    const menuItem = await prisma.menuItem.create({
      data: {
        name: data.name,
        description: data.description,
        price: parseFloat(data.price),
        image: data.image,
        ingredients: data.ingredients,
        preparationTime: data.preparationTime ? parseInt(data.preparationTime) : null,
        isAvailable: data.isAvailable !== undefined ? data.isAvailable : true,
        categoryId: data.categoryId || null,
        tenantId,
      },
    });

    // Revalidate the menu items path
    revalidatePath(`/pos/menu`);

    return { success: true, data: menuItem };
  } catch (error: any) {
    console.error("Error creating menu item:", error);
    return { success: false, error: error.message || "Failed to create menu item" };
  }
}

/**
 * Update an existing menu item
 */
export async function updateMenuItem(
  tenantId: string,
  itemId: string,
  data: any
): Promise<ApiResponse<any>> {
  try {
    if (!tenantId || !itemId) {
      return { success: false, error: "Tenant ID and Item ID are required" };
    }

    // Check if the menu item exists and belongs to the tenant
    const existingItem = await prisma.menuItem.findFirst({
      where: {
        id: itemId,
        tenantId,
      },
    });

    if (!existingItem) {
      return { success: false, error: "Menu item not found" };
    }

    // Update the menu item
    const updatedItem = await prisma.menuItem.update({
      where: {
        id: itemId,
      },
      data: {
        name: data.name !== undefined ? data.name : undefined,
        description: data.description !== undefined ? data.description : undefined,
        price: data.price !== undefined ? parseFloat(data.price) : undefined,
        image: data.image !== undefined ? data.image : undefined,
        ingredients: data.ingredients !== undefined ? data.ingredients : undefined,
        preparationTime: data.preparationTime !== undefined 
          ? parseInt(data.preparationTime) 
          : undefined,
        isAvailable: data.isAvailable !== undefined ? data.isAvailable : undefined,
        categoryId: data.categoryId !== undefined ? data.categoryId : undefined,
      },
    });

    // Revalidate the menu items path
    revalidatePath(`/pos/menu`);

    return { success: true, data: updatedItem };
  } catch (error: any) {
    console.error("Error updating menu item:", error);
    return { success: false, error: error.message || "Failed to update menu item" };
  }
}

/**
 * Delete a menu item
 */
export async function deleteMenuItem(
  tenantId: string,
  itemId: string
): Promise<ApiResponse<any>> {
  try {
    if (!tenantId || !itemId) {
      return { success: false, error: "Tenant ID and Item ID are required" };
    }

    // Check if the menu item exists and belongs to the tenant
    const existingItem = await prisma.menuItem.findFirst({
      where: {
        id: itemId,
        tenantId,
      },
    });

    if (!existingItem) {
      return { success: false, error: "Menu item not found" };
    }

    // Delete the menu item
    await prisma.menuItem.delete({
      where: {
        id: itemId,
      },
    });

    // Revalidate the menu items path
    revalidatePath(`/pos/menu`);

    return { success: true, data: { id: itemId } };
  } catch (error: any) {
    console.error("Error deleting menu item:", error);
    return { success: false, error: error.message || "Failed to delete menu item" };
  }
}

/**
 * Get categories for menu items
 */
export async function getMenuCategories(
  tenantId: string
): Promise<ApiResponse<any[]>> {
  try {
    if (!tenantId) {
      return { success: false, error: "Tenant ID is required" };
    }

    // Get categories that have menu items
    const categories = await prisma.category.findMany({
      where: {
        tenantId,
        menuItems: {
          some: {},
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return { success: true, data: categories };
  } catch (error: any) {
    console.error("Error fetching menu categories:", error);
    return { success: false, error: error.message || "Failed to fetch menu categories" };
  }
}

/**
 * Toggle menu item availability
 */
export async function toggleMenuItemAvailability(
  tenantId: string,
  itemId: string
): Promise<ApiResponse<any>> {
  try {
    if (!tenantId || !itemId) {
      return { success: false, error: "Tenant ID and Item ID are required" };
    }

    // Get the current item
    const item = await prisma.menuItem.findFirst({
      where: {
        id: itemId,
        tenantId,
      },
    });

    if (!item) {
      return { success: false, error: "Menu item not found" };
    }

    // Toggle the availability
    const updatedItem = await prisma.menuItem.update({
      where: {
        id: itemId,
      },
      data: {
        isAvailable: !item.isAvailable,
      },
    });

    // Revalidate the menu items path
    revalidatePath(`/pos/menu`);

    return { success: true, data: updatedItem };
  } catch (error: any) {
    console.error("Error toggling menu item availability:", error);
    return { success: false, error: error.message || "Failed to toggle menu item availability" };
  }
}