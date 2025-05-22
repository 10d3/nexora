/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { checkPermission } from "../permissions/server-permissions";
import { Permission } from "../permissions/role-permissions";
import { OrderStatus, OrderType, PaymentType } from "@prisma/client";
import { auth } from "../auth";

// Validation schema for creating/updating orders
const orderItemSchema = z.object({
  id: z.string().optional(),
  productId: z.string(),
  name: z.string(),
  sku: z.string().optional(),
  quantity: z.number().positive(),
  price: z.number().positive(),
  total: z.number().positive(),
  options: z.array(z.string()).optional(),
});

const addressSchema = z.object({
  line1: z.string(),
  line2: z.string().optional(),
  city: z.string(),
  state: z.string(),
  postalCode: z.string(),
  country: z.string(),
});

const orderSchema = z.object({
  id: z.string().optional(),
  orderNumber: z.string().optional(),
  customerId: z.string(),
  items: z.array(orderItemSchema),
  subtotal: z.number().positive(),
  tax: z.number().min(0),
  shipping: z.number().min(0).optional().default(0),
  discount: z.number().min(0),
  total: z.number().positive(),
  status: z.nativeEnum(OrderStatus),
  paymentType: z.nativeEnum(PaymentType),
  orderType: z.nativeEnum(OrderType).optional(),
  reservationId: z.string().optional(),
  shippingAddress: addressSchema.optional(),
  billingAddress: addressSchema.optional(),
  notes: z.string().optional().default(""),
  trackingNumber: z.string().optional(),
});

export async function getOrders(
  tenantId: string,
  search?: string,
  status?: OrderStatus,
  paymentType?: PaymentType,
  startDate?: Date,
  endDate?: Date,
  limit?: number,
  offset?: number
) {
  try {
    // Check if user has permission to view orders
    const hasPermission = await checkPermission(Permission.VIEW_ORDERS);
    if (!hasPermission) {
      return { error: "You don't have permission to view orders" };
    }

    // Build filter conditions
    const where: any = { tenantId };

    // Search filter
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: "insensitive" } },
        {
          customerProfile: {
            OR: [
              { firstName: { contains: search, mode: "insensitive" } },
              { lastName: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
              { phone: { contains: search, mode: "insensitive" } },
            ],
          },
        },
      ];
    }

    // Status filter
    if (status) {
      where.status = status;
    }

    // Payment type filter
    if (paymentType) {
      where.paymentType = paymentType;
    }

    // Date range filter
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = startDate;
      }
      if (endDate) {
        where.createdAt.lte = endDate;
      }
    }

    // Count total orders for pagination
    const totalOrders = await prisma.order.count({ where });

    // Get orders with pagination
    const orders = await prisma.order.findMany({
      where,
      include: {
        customerProfile: true,
        orderItems: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });

    return {
      orders,
      totalOrders,
    };
  } catch (error) {
    console.error("Error fetching orders:", error);
    return { error: "Failed to fetch orders" };
  }
}

export async function getOrderById(orderId: string, tenantId: string) {
  try {
    // Check if user has permission to view orders
    const hasPermission = await checkPermission(Permission.VIEW_ORDERS);
    if (!hasPermission) {
      return { error: "You don't have permission to view orders" };
    }

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        tenantId,
      },
      include: {
        customerProfile: true,
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return { error: "Order not found" };
    }

    return { order };
  } catch (error) {
    console.error("Error fetching order:", error);
    return { error: "Failed to fetch order" };
  }
}

export async function createOrder(
  data: z.infer<typeof orderSchema>,
  tenantId: string
) {
  const session = await auth();
  const userId = session?.user.id;
  try {
    // Check if user has permission to create orders
    const hasPermission = await checkPermission(Permission.CREATE_ORDERS);
    if (!hasPermission) {
      return { error: "You don't have permission to create orders" };
    }

    // Validate order data
    const validatedData = orderSchema.parse(data);

    // Generate order number if not provided
    const orderNumber = validatedData.orderNumber || generateOrderNumber();

    // Create order with items
    const order = await prisma.order.create({
      data: {
        orderNumber,
        status: validatedData.status,
        paymentType: validatedData.paymentType,
        tax: validatedData.tax,
        discount: validatedData.discount,
        total: validatedData.total,
        orderType: validatedData.orderType,
        ...(validatedData.reservationId && {
          reservation: {
            connect: { id: validatedData.reservationId }
          }
        }),
        tenant: {
          connect: { id: tenantId },
        },
        user: {
          connect: { id: userId },
        },
        customerProfile: {
          connect: { id: validatedData.customerId },
        },
        orderItems: {
          create: validatedData.items.map((item) => ({
            quantity: item.quantity,
            price: item.price,
            notes: item.options?.join(", "),
            product: {
              connect: { id: item.productId },
            },
          })),
        },
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: "CREATE",
        modelName: "Order",
        recordId: order.id,
        newData: order,
        tenantId,
      },
    });

    revalidatePath(`/pos/(dashboard)/[tenantName]/orders`);
    return { order };
  } catch (error) {
    console.error("Error creating order:", error);
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message };
    }
    return { error: "Failed to create order" };
  }
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  tenantId: string
) {
  try {
    // Check if user has permission to update orders
    const hasPermission = await checkPermission(Permission.UPDATE_ORDERS);
    if (!hasPermission) {
      return { error: "You don't have permission to update orders" };
    }

    // Get the current order
    const currentOrder = await prisma.order.findFirst({
      where: {
        id: orderId,
        tenantId,
      },
    });

    if (!currentOrder) {
      return { error: "Order not found" };
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: "UPDATE",
        modelName: "Order",
        recordId: orderId,
        oldData: currentOrder,
        newData: updatedOrder,
        tenantId,
      },
    });

    revalidatePath(`/pos/(dashboard)/[tenantName]/orders`);
    return { order: updatedOrder };
  } catch (error) {
    console.error("Error updating order status:", error);
    return { error: "Failed to update order status" };
  }
}

export async function updatePaymentType(
  orderId: string,
  paymentType: PaymentType,
  tenantId: string
) {
  try {
    // Check if user has permission to update orders
    const hasPermission = await checkPermission(Permission.UPDATE_ORDERS);
    if (!hasPermission) {
      return { error: "You don't have permission to update orders" };
    }

    // Get the current order
    const currentOrder = await prisma.order.findFirst({
      where: {
        id: orderId,
        tenantId,
      },
    });

    if (!currentOrder) {
      return { error: "Order not found" };
    }

    // Update payment type
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { paymentType },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: "UPDATE",
        modelName: "Order",
        recordId: orderId,
        oldData: currentOrder,
        newData: updatedOrder,
        tenantId,
      },
    });

    revalidatePath(`/pos/(dashboard)/[tenantName]/orders`);
    return { order: updatedOrder };
  } catch (error) {
    console.error("Error updating payment type:", error);
    return { error: "Failed to update payment type" };
  }
}

export async function deleteOrder(orderId: string, tenantId: string) {
  try {
    // Check if user has permission to delete orders
    const hasPermission = await checkPermission(Permission.DELETE_ORDERS);
    if (!hasPermission) {
      return { error: "You don't have permission to delete orders" };
    }

    // Get the current order
    const currentOrder = await prisma.order.findFirst({
      where: {
        id: orderId,
        tenantId,
      },
    });

    if (!currentOrder) {
      return { error: "Order not found" };
    }

    // Delete order
    await prisma.order.delete({
      where: { id: orderId },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: "DELETE",
        modelName: "Order",
        recordId: orderId,
        oldData: currentOrder,
        tenantId,
      },
    });

    revalidatePath(`/pos/(dashboard)/[tenantName]/orders`);
    return { success: true };
  } catch (error) {
    console.error("Error deleting order:", error);
    return { error: "Failed to delete order" };
  }
}

// Helper function to generate order number
function generateOrderNumber() {
  const timestamp = new Date().getTime().toString().slice(-6);
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `ORD-${timestamp}${random}`;
}

// Get order statistics
export async function getOrderStatistics(
  tenantId: string,
  period: "day" | "week" | "month" | "year" = "month"
) {
  try {
    // Check if user has permission to view orders
    const hasPermission = await checkPermission(Permission.VIEW_ORDERS);
    if (!hasPermission) {
      return { error: "You don't have permission to view order statistics" };
    }

    // Calculate date range based on period
    const now = new Date();
    const startDate = new Date();

    switch (period) {
      case "day":
        startDate.setHours(0, 0, 0, 0);
        break;
      case "week":
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "year":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    // Get total orders
    const totalOrders = await prisma.order.count({
      where: {
        tenantId,
        createdAt: {
          gte: startDate,
        },
      },
    });

    // Get total revenue
    const revenueResult = await prisma.order.aggregate({
      where: {
        tenantId,
        createdAt: {
          gte: startDate,
        },
      },
      _sum: {
        total: true,
      },
    });
    const totalRevenue = revenueResult._sum.total || 0;

    // Get orders by status
    const ordersByStatus = await prisma.order.groupBy({
      by: ["status"],
      where: {
        tenantId,
        createdAt: {
          gte: startDate,
        },
      },
      _count: {
        status: true,
      },
    });

    // Get orders by payment type
    const ordersByPaymentType = await prisma.order.groupBy({
      by: ["paymentType"],
      where: {
        tenantId,
        createdAt: {
          gte: startDate,
        },
      },
      _count: {
        paymentType: true,
      },
    });

    return {
      totalOrders,
      totalRevenue,
      ordersByStatus,
      ordersByPaymentType,
      period,
    };
  } catch (error) {
    console.error("Error fetching order statistics:", error);
    return { error: "Failed to fetch order statistics" };
  }
}
