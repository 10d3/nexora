/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { checkPermission } from "../permissions/server-permissions";
import { Permission } from "../permissions/role-permissions";
import { OrderStatus, OrderType, PaymentType } from "@prisma/client";
import { auth } from "../auth";

// Business type enum
const BusinessType = {
  RESTAURANT: 'RESTAURANT',
  HOTEL: 'HOTEL',
  SALON: 'SALON',
} as const;

type BusinessType = typeof BusinessType[keyof typeof BusinessType];

// Validation schema for creating/updating orders
const orderItemSchema = z.object({
  id: z.string().optional(),
  productId: z.string(),
  name: z.string(),
  sku: z.string().optional(),
  quantity: z.number().int().positive(),
  price: z.number().positive(),
  total: z.number().positive(),
  notes: z.string().optional(),
});

const addressSchema = z.object({
  line1: z.string().min(1, "Address line 1 is required"),
  line2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
});

const orderSchema = z.object({
  id: z.string().optional(),
  orderNumber: z.string().optional(),
  customerId: z.string().min(1, "Customer is required"),
  businessType: z.enum([BusinessType.RESTAURANT, BusinessType.HOTEL, BusinessType.SALON]),
  items: z.array(orderItemSchema).min(1, "At least one item is required"),
  subtotal: z.number().positive(),
  tax: z.number().min(0),
  shipping: z.number().min(0).optional().default(0),
  discount: z.number().min(0),
  total: z.number().positive(),
  status: z.nativeEnum(OrderStatus),
  paymentType: z.nativeEnum(PaymentType),
  orderType: z.nativeEnum(OrderType).optional().default(OrderType.STANDARD),

  // Restaurant specific fields
  tableId: z.string().optional(),
  reservationId: z.string().optional(),

  // Hotel specific fields
  roomId: z.string().optional(),
  bookingId: z.string().optional(),

  // Salon/Spa specific fields
  appointmentId: z.string().optional(),

  // Address fields
  shippingAddress: addressSchema.optional(),
  billingAddress: addressSchema.optional(),

  // Additional fields
  notes: z.string().optional().default(""),
  trackingNumber: z.string().optional(),

  // Timestamps (these will be handled by the server)
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  completedAt: z.date().optional(),
  completedBy: z.string().optional(),
  completedReason: z.string().optional(),
  deletedBy: z.string().optional(),
  deletedAt: z.date().optional(),
}).refine(
  (data) => {
    if (data.businessType === BusinessType.RESTAURANT && !data.tableId) {
      return false;
    }
    if (data.businessType === BusinessType.HOTEL && !data.roomId) {
      return false;
    }
    if (data.businessType === BusinessType.SALON && !data.appointmentId) {
      return false;
    }
    return true;
  },
  {
    message: "Required fields missing for the selected business type",
    path: ["businessType"],
  }
);

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

    // Prepare base order data
    const orderData: any = {
      orderNumber,
      status: validatedData.status,
      paymentType: validatedData.paymentType,
      tax: validatedData.tax,
      discount: validatedData.discount,
      total: validatedData.total,
      orderType: validatedData.orderType,
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
          notes: item.notes,
          product: {
            connect: { id: item.productId },
          },
        })),
      },
    };

    // Add business-specific data
    switch (validatedData.businessType) {
      case BusinessType.RESTAURANT:
        if (validatedData.tableId) {
          orderData.table = { connect: { id: validatedData.tableId } };
        }
        if (validatedData.reservationId) {
          orderData.reservation = { connect: { id: validatedData.reservationId } };
        }
        break;
      case BusinessType.HOTEL:
        if (validatedData.roomId) {
          orderData.room = { connect: { id: validatedData.roomId } };
        }
        if (validatedData.bookingId) {
          orderData.booking = { connect: { id: validatedData.bookingId } };
        }
        break;
      case BusinessType.SALON:
        if (validatedData.appointmentId) {
          orderData.appointment = { connect: { id: validatedData.appointmentId } };
        }
        break;
    }

    // Create order
    const order = await prisma.order.create({
      data: orderData,
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

    // Get the current order with related data
    const currentOrder = await prisma.order.findFirst({
      where: {
        id: orderId,
        tenantId,
      },
      include: {
        table: true,
        room: true,
        appointment: true,
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

    // Handle business-specific status updates
    if (status === OrderStatus.COMPLETED) {
      if (currentOrder.table) {
        // Update table status for restaurant
        await prisma.table.update({
          where: { id: currentOrder.table.id },
          data: { status: 'AVAILABLE' },
        });
      }
      if (currentOrder.room) {
        // Update room status for hotel
        await prisma.room.update({
          where: { id: currentOrder.room.id },
          data: { status: 'AVAILABLE' },
        });
      }
      if (currentOrder.appointment) {
        // Update appointment status for salon
        await prisma.appointment.update({
          where: { id: currentOrder.appointment.id },
          data: { status: 'COMPLETED' },
        });
      }
    }

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
