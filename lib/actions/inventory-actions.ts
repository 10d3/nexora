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
 * Fetch inventory items with optional filtering
 */
export async function getInventory(
  businessType: string | undefined,
  tenantId: string,
  category?: string,
  status?: string,
  supplier?: string,
  search?: string
): Promise<ApiResponse<any[]>> {
  try {
    if (!tenantId) {
      return { success: false, error: "Tenant ID is required" };
    }

    // Base query to get products with inventory data
    const query: any = {
      where: {
        tenantId,
        deletedAt: null,
      },
      include: {
        category: true,
        inventory: true,
        supplierProducts: {
          include: {
            supplier: true,
          },
        },
      },
    };

    // Apply category filter
    if (category) {
      query.where.categoryId = {
        category: {
          name: category,
        },
      };
    }

    // Apply supplier filter
    if (supplier) {
      query.where.supplierProducts = {
        some: {
          supplier: {
            name: supplier,
          },
        },
      };
    }

    // Apply search filter
    if (search) {
      query.where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Fetch products
    const products = await prisma.product.findMany(query);

    // Process products to include status
    const inventoryItems = products
      .map((product: any) => {
        const quantity = product.stockQty || 0;
        const minQuantity = 5; // Default min quantity

        // Determine status based on quantity and filter if needed
        let itemStatus:
          | "in-stock"
          | "low-stock"
          | "out-of-stock"
          | "discontinued" = "in-stock";
        if (quantity === 0) {
          itemStatus = "out-of-stock";
        } else if (quantity < minQuantity) {
          itemStatus = "low-stock";
        } else if (product.deletedAt) {
          itemStatus = "discontinued";
        }

        // If status filter is applied, skip items that don't match
        if (status && status !== itemStatus) {
          return null;
        }

        // Find the inventory record for this product
        const inventoryRecord = product.inventory && product.inventory.length > 0 
          ? product.inventory[0] 
          : null;

        // Find the supplier for this product
        const supplierRecord = product.supplierProducts && product.supplierProducts.length > 0 
          ? product.supplierProducts[0].supplier 
          : null;

        return {
          id: product.id,
          name: product.name,
          sku: product.sku || "N/A",
          category: product.category?.name || "Uncategorized",
          quantity: quantity,
          minQuantity: minQuantity,
          price: product.price || 0,
          cost: inventoryRecord?.costPrice || 0,
          supplier: supplierRecord?.name || "N/A",
          location: inventoryRecord?.location || "Main Warehouse",
          lastUpdated: product.updatedAt,
          status: itemStatus,
          image: product.image,
        };
      })
      .filter(Boolean); // Remove null items (filtered out by status)

    return { success: true, data: inventoryItems };
  } catch (error) {
    console.error("Error fetching inventory:", error);
    return { success: false, error: "Failed to fetch inventory data" };
  }
}

/**
 * Fetch categories for the tenant
 */
export async function getCategories(
  businessType: string | undefined,
  tenantId: string
): Promise<ApiResponse<any[]>> {
  try {
    if (!tenantId) {
      return { success: false, error: "Tenant ID is required" };
    }

    // Fetch categories
    const categories = await prisma.category.findMany({
      where: {
        tenantId,
      },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    // Process categories with product counts
    const processedCategories = categories.map((category, index) => {
      // Define a set of colors to cycle through
      const colors = [
        "bg-blue-500",
        "bg-amber-500",
        "bg-green-500",
        "bg-purple-500",
        "bg-rose-500",
        "bg-indigo-500",
        "bg-teal-500",
        "bg-orange-500",
      ];

      return {
        id: category.id,
        name: category.name,
        description: category.description,
        count: category._count.products,
        color: colors[index % colors.length],
      };
    });

    return { success: true, data: processedCategories };
  } catch (error) {
    console.error("Error fetching categories:", error);
    return { success: false, error: "Failed to fetch categories" };
  }
}

/**
 * Fetch suppliers for the tenant
 */
export async function getSuppliers(
  businessType: string | undefined,
  tenantId: string
): Promise<ApiResponse<any[]>> {
  try {
    if (!tenantId) {
      return { success: false, error: "Tenant ID is required" };
    }

    // Fetch suppliers
    const suppliers = await prisma.supplier.findMany({
      where: {
        tenantId,
      },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    // Process suppliers with product counts
    const processedSuppliers = suppliers.map((supplier) => {
      return {
        id: supplier.id,
        name: supplier.name,
        contactName: supplier.contactName,
        email: supplier.email,
        phone: supplier.phone,
        address: supplier.address,
        count: supplier._count.products,
      };
    });

    return { success: true, data: processedSuppliers };
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    return { success: false, error: "Failed to fetch suppliers" };
  }
}

/**
 * Create a new inventory item
 */
export async function createInventoryItem(
  tenantId: string,
  data: {
    name: string;
    sku?: string;
    categoryName?: string;
    stockQty: number;
    minQuantity?: number;
    price: number;
    costPrice?: number;
    supplierName?: string;
    location?: string;
    image?: string;
  }
): Promise<ApiResponse<any>> {
  try {
    if (!tenantId) {
      return { success: false, error: "Tenant ID is required" };
    }

    // Start a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Find or create category if provided
      let categoryId = null;
      if (data.categoryName) {
        const category = await tx.category.findFirst({
          where: {
            name: data.categoryName,
            tenantId,
          },
        });

        if (category) {
          categoryId = category.id;
        } else {
          const newCategory = await tx.category.create({
            data: {
              name: data.categoryName,
              tenantId,
            },
          });
          categoryId = newCategory.id;
        }
      }

      // Create the product
      const product = await tx.product.create({
        data: {
          name: data.name,
          sku: data.sku,
          price: data.price,
          stockQty: data.stockQty,
          image: data.image,
          categoryId,
          tenantId,
        },
      });

      // Create inventory record
      await tx.inventory.create({
        data: {
          productId: product.id,
          costPrice: data.costPrice,
          location: data.location,
          tenantId,
        },
      });

      // Find or create supplier and link to product if provided
      if (data.supplierName) {
        const supplier = await tx.supplier.findFirst({
          where: {
            name: data.supplierName,
            tenantId,
          },
        });

        let supplierId;
        if (supplier) {
          supplierId = supplier.id;
        } else {
          const newSupplier = await tx.supplier.create({
            data: {
              name: data.supplierName,
              tenantId,
            },
          });
          supplierId = newSupplier.id;
        }

        // Link supplier to product
        await tx.supplierProduct.create({
          data: {
            supplierId,
            productId: product.id,
            costPrice: data.costPrice || 0,
            tenantId,
          },
        });
      }

      // Return the created product with related data
      return await tx.product.findUnique({
        where: { id: product.id },
        include: {
          category: true,
          inventory: true,
          supplierProducts: {
            include: {
              supplier: true,
            },
          },
        },
      });
    });

    revalidatePath(`/pos/(dashboard)/[tenantName]/inventory`);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error creating inventory item:", error);
    return { success: false, error: "Failed to create inventory item" };
  }
}

/**
 * Update an existing inventory item
 */
export async function updateInventoryItem(
  tenantId: string,
  itemId: string,
  data: {
    name?: string;
    sku?: string;
    categoryName?: string;
    stockQty?: number;
    minQuantity?: number;
    price?: number;
    costPrice?: number;
    supplierName?: string;
    location?: string;
    image?: string;
  }
): Promise<ApiResponse<any>> {
  try {
    if (!tenantId || !itemId) {
      return { success: false, error: "Tenant ID and Item ID are required" };
    }

    // Start a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Find or create category if provided
      let categoryId = undefined;
      if (data.categoryName) {
        const category = await tx.category.findFirst({
          where: {
            name: data.categoryName,
            tenantId,
          },
        });

        if (category) {
          categoryId = category.id;
        } else {
          const newCategory = await tx.category.create({
            data: {
              name: data.categoryName,
              tenantId,
            },
          });
          categoryId = newCategory.id;
        }
      }

      // Update the product
      const productUpdateData: any = {};
      if (data.name) productUpdateData.name = data.name;
      if (data.sku) productUpdateData.sku = data.sku;
      if (data.price !== undefined) productUpdateData.price = data.price;
      if (data.stockQty !== undefined)
        productUpdateData.stockQty = data.stockQty;
      if (data.image) productUpdateData.image = data.image;
      if (categoryId) productUpdateData.categoryId = categoryId;

      const product = await tx.product.update({
        where: { id: itemId },
        data: productUpdateData,
      });

      // Update inventory record
      if (data.costPrice !== undefined || data.location) {
        const inventory = await tx.inventory.findFirst({
          where: { productId: itemId, tenantId },
        });

        if (inventory) {
          await tx.inventory.update({
            where: { id: inventory.id },
            data: {
              costPrice: data.costPrice,
              location: data.location,
            },
          });
        } else {
          await tx.inventory.create({
            data: {
              productId: itemId,
              costPrice: data.costPrice,
              location: data.location,
              tenantId,
            },
          });
        }
      }

      // Update supplier link if provided
      if (data.supplierName) {
        const supplier = await tx.supplier.findFirst({
          where: {
            name: data.supplierName,
            tenantId,
          },
        });

        let supplierId;
        if (supplier) {
          supplierId = supplier.id;
        } else {
          const newSupplier = await tx.supplier.create({
            data: {
              name: data.supplierName,
              tenantId,
            },
          });
          supplierId = newSupplier.id;
        }

        // Check if supplier is already linked
        const existingLink = await tx.supplierProduct.findFirst({
          where: {
            productId: itemId,
            tenantId,
          },
        });

        if (existingLink) {
          await tx.supplierProduct.update({
            where: { id: existingLink.id },
            data: {
              supplierId,
              costPrice: data.costPrice || existingLink.costPrice,
            },
          });
        } else {
          await tx.supplierProduct.create({
            data: {
              supplierId,
              productId: itemId,
              costPrice: data.costPrice || 0,
              tenantId,
            },
          });
        }
      }

      // Return the updated product with related data
      return await tx.product.findUnique({
        where: { id: product.id },
        include: {
          category: true,
          inventory: true,
          supplierProducts: {
            include: {
              supplier: true,
            },
          },
        },
      });
    });

    revalidatePath(`/pos/(dashboard)/[tenantName]/inventory`);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error updating inventory item:", error);
    return { success: false, error: "Failed to update inventory item" };
  }
}

/**
 * Delete an inventory item
 */
export async function deleteInventoryItem(
  tenantId: string,
  itemId: string
): Promise<ApiResponse<boolean>> {
  try {
    if (!tenantId || !itemId) {
      return { success: false, error: "Tenant ID and Item ID are required" };
    }

    // Soft delete the product
    await prisma.product.update({
      where: {
        id: itemId,
        tenantId,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    revalidatePath(`/pos/(dashboard)/[tenantName]/inventory`);
    return { success: true, data: true };
  } catch (error) {
    console.error("Error deleting inventory item:", error);
    return { success: false, error: "Failed to delete inventory item" };
  }
}