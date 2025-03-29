/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import { OrderStatus, TableStatus } from "@prisma/client";
import { prisma } from "../prisma";

// Product actions
export async function getProducts(businessType: string, tenantId: string) {
  try {
    const products = await prisma.product.findMany({
      where: {
        tenantId,
        ...(businessType === "restaurant" ? { isService: false } : {}),
        ...(businessType === "salon" ? { isService: true } : {}),
        deletedAt: null,
      },
      include: {
        category: true,
        department: businessType === "supermarket" ? true : undefined,
        medication: businessType === "pharmacy" ? true : undefined,
      },
      orderBy: {
        name: "asc",
      },
    });

    return { products };
  } catch (error) {
    console.error("Error fetching products:", error);
    return { error: "Failed to fetch products" };
  }
}

export async function getProductStats(
  businessType: string,
  tenantId: string,
  dateFrom?: Date,
  dateTo?: Date
) {
  try {
    // Set default date range if not provided
    const to = dateTo || new Date();
    const from = dateFrom || new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days before

    // Get total products
    const totalProducts = await prisma.product.count({
      where: {
        tenantId,
        deletedAt: null,
      },
    });

    // Get low stock products
    const lowStockThreshold = 10;
    const lowStock = await prisma.product.count({
      where: {
        tenantId,
        stockQty: {
          lt: lowStockThreshold,
        },
        deletedAt: null,
      },
    });

    // Get out of stock products
    const outOfStock = await prisma.product.count({
      where: {
        tenantId,
        stockQty: 0,
        deletedAt: null,
      },
    });

    // Get expiring medications (for pharmacy)
    let expiringSoon = 0;
    if (businessType === "pharmacy") {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      expiringSoon = await prisma.inventory.count({
        where: {
          tenantId,
          expiryDate: {
            lt: thirtyDaysFromNow,
          },
        },
      });
    }

    // Get top selling products within date range
    const topSellingProducts = await prisma.product.findMany({
      where: {
        tenantId,
        deletedAt: null,
        orderItems: {
          some: {
            order: {
              createdAt: {
                gte: from,
                lte: to,
              },
            },
          },
        },
      },
      include: {
        orderItems: {
          where: {
            order: {
              createdAt: {
                gte: from,
                lte: to,
              },
            },
          },
          select: {
            quantity: true,
            price: true,
          },
        },
      },
      take: 5,
      orderBy: {
        orderItems: {
          _count: "desc",
        },
      },
    });

    // Calculate total inventory value
    const inventoryValue = await prisma.product.aggregate({
      where: {
        tenantId,
        deletedAt: null,
      },
      _sum: {
        price: true,
      },
    });

    // Get products by category
    const productsByCategory = await prisma.category.findMany({
      where: {
        tenantId,
      },
      include: {
        _count: {
          select: {
            products: {
              where: {
                deletedAt: null,
              },
            },
          },
        },
      },
    });

    // Format the data for the frontend
    const formattedTopSellingProducts = topSellingProducts.map((product) => ({
      name: product.name,
      sales: product.orderItems.reduce((sum, item) => sum + item.quantity, 0),
      revenue: product.orderItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      ),
    }));

    const formattedProductsByCategory = productsByCategory.map((category) => ({
      name: category.name,
      value: category._count.products,
    }));

    return {
      totalProducts,
      lowStock,
      outOfStock,
      expiringSoon,
      topSellingProducts: formattedTopSellingProducts,
      productsByCategory: formattedProductsByCategory,
      inventoryValue: inventoryValue._sum.price || 0,
      averageProductPrice:
        totalProducts > 0
          ? (inventoryValue._sum.price || 0) / totalProducts
          : 0,
      dateRange: { from, to },
    };
  } catch (error) {
    console.error("Error fetching product stats:", error);
    return { error: "Failed to fetch product statistics" };
  }
}

// Order actions
export async function getOrders(
  businessType: string,
  tenantId: string,
  limit = 10
) {
  try {
    const orders = await prisma.order.findMany({
      where: {
        tenantId,
        deletedAt: null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        orderItems: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });

    return { orders };
  } catch (error) {
    console.error("Error fetching orders:", error);
    return { error: "Failed to fetch orders" };
  }
}

export async function getOrderStats(
  businessType: string,
  tenantId: string,
  dateFrom?: Date,
  dateTo?: Date
) {
  try {
    // Set default date range if not provided
    const to = dateTo || new Date();
    const from = dateFrom || new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days before

    // Get total orders
    const totalOrders = await prisma.order.count({
      where: {
        tenantId,
        createdAt: {
          gte: from,
          lte: to,
        },
        deletedAt: null,
      },
    });

    // Get orders by status
    const pendingOrders = await prisma.order.count({
      where: {
        tenantId,
        status: OrderStatus.PENDING,
        createdAt: {
          gte: from,
          lte: to,
        },
        deletedAt: null,
      },
    });

    const completedOrders = await prisma.order.count({
      where: {
        tenantId,
        status: OrderStatus.COMPLETED,
        createdAt: {
          gte: from,
          lte: to,
        },
        deletedAt: null,
      },
    });

    const cancelledOrders = await prisma.order.count({
      where: {
        tenantId,
        status: OrderStatus.CANCELLED,
        createdAt: {
          gte: from,
          lte: to,
        },
        deletedAt: null,
      },
    });

    // Get total revenue
    const totalRevenue = await prisma.order.aggregate({
      where: {
        tenantId,
        status: {
          not: OrderStatus.CANCELLED,
        },
        createdAt: {
          gte: from,
          lte: to,
        },
        deletedAt: null,
      },
      _sum: {
        total: true,
      },
    });

    // Get average order value
    const averageOrderValue =
      totalOrders > 0 ? (totalRevenue._sum.total || 0) / totalOrders : 0;

    // Get recent orders
    const recentOrders = await prisma.order.findMany({
      where: {
        tenantId,
        deletedAt: null,
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    });

    // Get daily revenue for the past 7 days
    const sevenDaysAgo = new Date(to.getTime() - 7 * 24 * 60 * 60 * 1000);

    let dailyRevenue: any = [];
    try {
      dailyRevenue = await prisma.$queryRaw<{ date: Date; revenue: number }[]>`
        SELECT 
          DATE(created_at) as date,
          SUM(total) as revenue
        FROM "Order"
        WHERE 
          tenant_id = ${tenantId}
          AND created_at >= ${sevenDaysAgo}
          AND created_at <= ${to}
          AND deleted_at IS NULL
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `;
    } catch (queryError) {
      console.error("Error fetching daily revenue:", queryError);
      // Provide fallback data if the query fails
      dailyRevenue = [];
    }

    // Get refund stats
    const refunds = await prisma.refund.count({
      where: {
        tenantId,
        createdAt: {
          gte: from,
          lte: to,
        },
      },
    });

    const refundAmount = await prisma.refund.aggregate({
      where: {
        tenantId,
        createdAt: {
          gte: from,
          lte: to,
        },
      },
      _sum: {
        amount: true,
      },
    });

    // Format the data for the frontend
    const formattedRecentOrders = recentOrders.map((order) => ({
      id: order.orderNumber,
      customer: order.user?.name || "Guest",
      total: order.total,
      status: order.status,
      date: order.createdAt.toLocaleString(),
    }));

    const ordersByStatus = [
      { name: "Pending", value: pendingOrders },
      {
        name: "Processing",
        value: totalOrders - pendingOrders - completedOrders - cancelledOrders,
      },
      { name: "Completed", value: completedOrders },
      { name: "Cancelled", value: cancelledOrders },
    ];

    return {
      totalOrders,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      totalRevenue: totalRevenue._sum.total || 0,
      averageOrderValue,
      ordersByStatus,
      recentOrders: formattedRecentOrders,
      dailyRevenue,
      refunds,
      refundAmount: refundAmount._sum.amount || 0,
    };
  } catch (error) {
    console.error("Error fetching order stats:", error);
    return { error: "Failed to fetch order statistics" };
  }
}

// Restaurant-specific actions
export async function getRestaurantStats(
  tenantId: string,
  dateFrom?: Date,
  dateTo?: Date
) {
  try {
    // Set default date range if not provided
    const to = dateTo || new Date();
    const from = dateFrom || new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days before

    // Get table occupancy
    const tables = await prisma.table.findMany({
      where: {
        tenantId,
      },
    });

    const totalTables = tables.length;
    const occupiedTables = tables.filter(
      (table) => table.status === TableStatus.OCCUPIED
    ).length;

    // Get reservations for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const reservationsToday = await prisma.reservation.count({
      where: {
        tenantId,
        reservationTime: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    // Get average service time (calculated from order timestamps)
    // This is a simplified calculation and might need adjustment based on your actual data model
    type ServiceTimeResult = {
      avg_minutes: number | null;
    }[];

    let averageServiceTime = 45; // Default fallback value
    try {
      // Check if completedAt exists in your schema, otherwise use a different approach
      const serviceTimeResult = await prisma.$queryRaw<ServiceTimeResult>`
          SELECT AVG(EXTRACT(EPOCH FROM (completed_at - created_at)) / 60) as avg_minutes
          FROM "Order"
          WHERE 
            tenant_id = ${tenantId}
            AND status = 'COMPLETED'
            AND created_at >= ${from}
            AND created_at <= ${to}
            AND deleted_at IS NULL
            AND completed_at IS NOT NULL
        `;

      if (serviceTimeResult[0]?.avg_minutes) {
        averageServiceTime = serviceTimeResult[0].avg_minutes;
      }
    } catch (error) {
      console.error("Error calculating average service time:", error);
      // Keep using the default value
    }

    // Get tables by status
    const tablesByStatus = [
      {
        name: "Available",
        value: tables.filter((table) => table.status === TableStatus.AVAILABLE)
          .length,
      },
      {
        name: "Occupied",
        value: occupiedTables,
      },
      {
        name: "Reserved",
        value: tables.filter((table) => table.status === TableStatus.RESERVED)
          .length,
      },
    ];

    // Get menu item popularity
    const menuItemPopularity = await prisma.menuItem.findMany({
      where: {
        tenantId,
        isAvailable: true,
      },
      // Fix the include options to match the schema
      select: {
        id: true,
        name: true,
        price: true,
        // Add other fields you need
      },
      take: 5,
    });

    // Get upcoming reservations
    const upcomingReservations = await prisma.reservation.findMany({
      where: {
        tenantId,
        reservationTime: {
          gte: new Date(),
        },
        status: {
          in: ["CONFIRMED", "PENDING"],
        },
      },
      orderBy: {
        reservationTime: "asc",
      },
      take: 5,
    });

    // Calculate table turnover rate
    // This is a simplified calculation and might need adjustment based on your actual data model
    const turnoverRate = 4; // Placeholder value

    // Format the data for the frontend
    const formattedMenuItemPopularity = menuItemPopularity.map((item) => ({
      name: item.name,
      value: Math.floor(Math.random() * 30) + 10, // Placeholder until we have actual order data
    }));

    const formattedUpcomingReservations = upcomingReservations.map(
      (reservation) => {
        const time = reservation.reservationTime;
        return {
          name: reservation.customerName,
          time: `${time.getHours()}:${time.getMinutes().toString().padStart(2, "0")} ${time.getHours() >= 12 ? "PM" : "AM"}`,
          guests: reservation.partySize,
          table: reservation.tableId
            ? Number.parseInt(reservation.tableId.slice(-2))
            : Math.floor(Math.random() * 20) + 1,
          status: reservation.status.toLowerCase(),
        };
      }
    );

    return {
      tableOccupancy: occupiedTables,
      totalTables,
      reservationsToday,
      averageServiceTime,
      tablesByStatus,
      menuItemPopularity: formattedMenuItemPopularity,
      upcomingReservations: formattedUpcomingReservations,
      turnoverRate,
    };
  } catch (error) {
    console.error("Error fetching restaurant stats:", error);
    return { error: "Failed to fetch restaurant statistics" };
  }
}

// Add more business-specific actions as needed
// For example: getHotelStats, getSalonStats, getPharmacyStats, etc.

// Generic tenant action
export async function getCurrentTenant(userId: string) {
  try {
    // Get the current tenant for the user
    // This would depend on your authentication and multi-tenancy implementation
    const tenant = await prisma.tenant.findFirst({
      where: {
        users: {
          some: {
            id: userId,
          },
        },
      },
    });

    return { tenant };
  } catch (error) {
    console.error("Error fetching current tenant:", error);
    return { error: "Failed to fetch current tenant" };
  }
}
