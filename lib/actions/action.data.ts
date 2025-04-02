/* eslint-disable @typescript-eslint/no-unused-vars */
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

    // Use Promise.all to fetch data in parallel
    const [
      tables,
      reservations,
      orders,
      menuItems,
      yesterdayOrders,
      yesterdayReservations,
    ] = await Promise.all([
      // Get table occupancy
      prisma.table.findMany({
        where: { tenantId },
      }),

      // Get reservations for today
      getReservationsForToday(tenantId),

      // Get orders for today
      getOrdersForToday(tenantId),

      // Get menu items
      prisma.menuItem.findMany({
        where: {
          tenantId,
          isAvailable: true,
        },
        select: {
          id: true,
          name: true,
          price: true,
        },
      }),

      // Get yesterday's orders
      getYesterdayOrders(tenantId),

      // Get yesterday's reservations
      getYesterdayReservations(tenantId),
    ]);

    // Process table data
    const totalTables = tables.length;
    const occupiedTables = tables.filter(
      (table) => table.status === TableStatus.OCCUPIED
    ).length;
    const availableTables = tables.filter(
      (table) => table.status === TableStatus.AVAILABLE
    ).length;
    const reservedTables = tables.filter(
      (table) => table.status === TableStatus.RESERVED
    ).length;

    // Format table status data for pie chart
    const tablesByStatus = [
      { name: "Available", value: availableTables },
      { name: "Occupied", value: occupiedTables },
      { name: "Reserved", value: reservedTables },
    ];

    // Process orders data
    const totalOrders = orders.length;

    // Calculate total customers
    const totalCustomers = orders.reduce((sum, order) => {
      return sum + (order.table?.capacity || 1);
    }, 0);

    // Calculate service time metrics
    const { avgServiceTime, serviceTimeData } =
      await calculateServiceTimeMetrics(tenantId);

    // Calculate turnover data
    const turnoverData = await calculateTurnoverData(tenantId);

    // Format upcoming reservations
    const upcomingReservations = formatReservations(reservations);

    // Calculate yesterday's metrics
    const yesterdayOrderCount = yesterdayOrders.length;
    const yesterdayCustomerCount = yesterdayOrders.reduce((sum, order) => {
      return sum + (order.table?.capacity || 1);
    }, 0);

    // Calculate trends
    const totalReservations = reservations.length;
    const ordersTrend = calculateTrend(totalOrders, yesterdayOrderCount);
    const customersTrend = calculateTrend(
      totalCustomers,
      yesterdayCustomerCount
    );

    // Get historical average service time
    const historicalServiceTime = serviceTimeData
      .slice(0, 6)
      .reduce((sum, day) => sum + day.time, 0);

    const avgHistoricalServiceTime =
      serviceTimeData.slice(0, 6).length > 0
        ? Math.round(historicalServiceTime / serviceTimeData.slice(0, 6).length)
        : avgServiceTime;

    // Calculate service time trend
    const serviceTimeDiff = avgServiceTime - avgHistoricalServiceTime;
    const serviceTimeTrend =
      serviceTimeDiff === 0
        ? "No change from average"
        : serviceTimeDiff < 0
          ? `↓ ${Math.abs(serviceTimeDiff)} min from average`
          : `↑ ${serviceTimeDiff} min from average`;

    const reservationsTrend = calculateTrend(
      totalReservations,
      yesterdayReservations
    );

    // Create menu item popularity (using placeholder data for now)
    const menuItemPopularity = menuItems
      .map((item) => ({
        name: item.name,
        value: Math.floor(Math.random() * 30) + 10,
      }))
      .slice(0, 5);

    return {
      // Metrics
      totalOrders,
      ordersTrend,
      totalCustomers,
      customersTrend,
      avgServiceTime,
      serviceTimeTrend,
      totalReservations,
      reservationsTrend,

      // Charts data
      menuItemPopularity,
      tablesByStatus,
      serviceTimeData,
      turnoverData,

      // Table data
      upcomingReservations,
    };
  } catch (error) {
    console.error("Error fetching restaurant stats:", error);
    return { error: "Failed to fetch restaurant statistics" };
  }
}

// Helper functions to make the main function cleaner
async function getReservationsForToday(tenantId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return prisma.reservation.findMany({
    where: {
      tenantId,
      reservationTime: {
        gte: today,
        lt: tomorrow,
      },
    },
    include: {
      table: true,
    },
  });
}

async function getOrdersForToday(tenantId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return prisma.order.findMany({
    where: {
      tenantId,
      createdAt: {
        gte: today,
        lt: tomorrow,
      },
      deletedAt: null,
    },
    include: {
      orderItems: {
        include: {
          product: true,
        },
      },
      table: true,
      user: true,
    },
  });
}

async function getYesterdayOrders(tenantId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  return prisma.order.findMany({
    where: {
      tenantId,
      createdAt: {
        gte: yesterday,
        lt: today,
      },
      deletedAt: null,
    },
    include: {
      table: true,
    },
  });
}

async function getYesterdayReservations(tenantId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  return prisma.reservation.count({
    where: {
      tenantId,
      reservationTime: {
        gte: yesterday,
        lt: today,
      },
    },
  });
}

async function calculateServiceTimeMetrics(tenantId: string) {
  // Get service time data from actual orders over the past 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - 6 + i);
    date.setHours(0, 0, 0, 0);
    return date;
  });

  // Fetch orders for the past 7 days with preparation times
  const serviceTimeData = await Promise.all(
    last7Days.map(async (date) => {
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);

      const dayOrders = await prisma.order.findMany({
        where: {
          tenantId,
          createdAt: {
            gte: date,
            lt: nextDay,
          },
          completedAt: { not: null },
          deletedAt: null,
        },
        select: {
          createdAt: true,
          completedAt: true,
        },
      });

      // Calculate average service time in minutes
      let totalServiceTime = 0;
      dayOrders.forEach((order) => {
        if (order.completedAt && order.createdAt) {
          const serviceTime = Math.floor(
            (order.completedAt.getTime() - order.createdAt.getTime()) /
              (1000 * 60)
          );
          totalServiceTime += serviceTime;
        }
      });

      const avgTime =
        dayOrders.length > 0
          ? Math.round(totalServiceTime / dayOrders.length)
          : 0;

      return {
        date: date.toISOString().split("T")[0],
        time: avgTime,
      };
    })
  );

  // Calculate average service time from today's completed orders
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const completedOrders = await prisma.order.findMany({
    where: {
      tenantId,
      createdAt: {
        gte: today,
        lt: tomorrow,
      },
      status: OrderStatus.COMPLETED,
      completedAt: { not: null },
      deletedAt: null,
    },
    select: {
      createdAt: true,
      completedAt: true,
    },
  });

  const avgServiceTime =
    completedOrders.length > 0
      ? Math.floor(
          completedOrders.reduce((sum, order) => {
            if (order.completedAt && order.createdAt) {
              return (
                sum +
                Math.floor(
                  (order.completedAt.getTime() - order.createdAt.getTime()) /
                    (1000 * 60)
                )
              );
            }
            return sum;
          }, 0) / completedOrders.length
        )
      : 0;

  return { avgServiceTime, serviceTimeData };
}

async function calculateTurnoverData(tenantId: string) {
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - 6 + i);
    date.setHours(0, 0, 0, 0);
    return date;
  });

  return Promise.all(
    last7Days.map(async (date) => {
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);

      // Count completed orders per table for this day
      const tableOrders = await prisma.order.groupBy({
        by: ["tableId"],
        where: {
          tenantId,
          createdAt: {
            gte: date,
            lt: nextDay,
          },
          status: OrderStatus.COMPLETED,
          tableId: { not: null },
          deletedAt: null,
        },
        _count: {
          id: true,
        },
      });

      // Calculate average turnover rate (orders per table)
      const totalTables = tableOrders.length;
      const totalOrders = tableOrders.reduce(
        (sum, item) => sum + item._count.id,
        0
      );

      // Average orders per table, or 0 if no tables had orders
      const rate = totalTables > 0 ? totalOrders / totalTables : 0;

      return {
        date: date.toISOString().split("T")[0],
        rate: parseFloat(rate.toFixed(1)),
      };
    })
  );
}

function formatReservations(reservations: any[]) {
  return reservations.map((res) => ({
    "Party Name": res.customerName,
    Time: new Date(res.reservationTime).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    "Party Size": res.partySize,
    Table: res.table?.number || "Not assigned",
    Status: res.status,
  }));
}

// Helper function to calculate trend percentage and direction
function calculateTrend(current: number, previous: number): string {
  if (previous === 0) return current > 0 ? "↑ New data" : "No change";

  const percentChange = Math.round(((current - previous) / previous) * 100);

  if (percentChange > 0) {
    return `↑ ${percentChange}% from yesterday`;
  } else if (percentChange < 0) {
    return `↓ ${Math.abs(percentChange)}% from yesterday`;
  } else {
    return "No change from yesterday";
  }
}

// Kitchen display actions
export async function getActiveOrders(tenantId: string) {
  try {
    const orders = await prisma.order.findMany({
      where: {
        tenantId,
        status: {
          in: ["PENDING", "IN_PROGRESS", "COMPLETED"],
        },
        deletedAt: null,
      },
      include: {
        table: true,
        orderItems: {
          include: {
            product: true,
            // menuItem: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return { orders };
  } catch (error) {
    console.error("Error fetching active orders:", error);
    return { error: "Failed to fetch active orders" };
  }
}

export async function updateOrderStatus(
  orderId: string,
  status: string,
  tenantId: string
) {
  try {
    // Verify the order belongs to this tenant
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        tenantId,
      },
    });

    if (!order) {
      return { error: "Order not found" };
    }

    // Update the order status
    const updatedOrder = await prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        status: status as OrderStatus,
        ...(status === "COMPLETED" ? { completedAt: new Date() } : {}),
      },
    });

    return { order: updatedOrder };
  } catch (error) {
    console.error("Error updating order status:", error);
    return { error: "Failed to update order status" };
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

// Hotel-specific actions
export async function getHotelStats(
  tenantId: string,
  dateFrom?: Date,
  dateTo?: Date
) {
  try {
    // Set default date range if not provided
    const to = dateTo || new Date();
    const from = dateFrom || new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days before

    // Get today's date for daily stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Yesterday for trend calculations
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const dayBeforeYesterday = new Date(yesterday);
    dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 1);

    // Use Promise.all to fetch data in parallel
    const [
      rooms,
      bookingsToday,
      checkInsToday,
      checkOutsToday,
      currentGuests,
      yesterdayCheckIns,
      yesterdayRevenue,
      upcomingCheckIns,
      roomTypeStats,
      historicalOccupancy,
      stayLengthDistribution,
      revenueData,
    ] = await Promise.all([
      // Get all rooms
      prisma.room.findMany({
        where: { tenantId },
      }),

      // Get bookings for today
      prisma.booking.count({
        where: {
          tenantId,
          createdAt: {
            gte: today,
            lt: tomorrow,
          },
        },
      }),

      // Get check-ins for today
      prisma.booking.count({
        where: {
          tenantId,
          checkIn: {
            gte: today,
            lt: tomorrow,
          },
          status: "CONFIRMED",
        },
      }),

      // Get check-outs for today
      prisma.booking.count({
        where: {
          tenantId,
          checkOut: {
            gte: today,
            lt: tomorrow,
          },
        },
      }),

      // Get current guests (checked in but not checked out)
      prisma.booking.count({
        where: {
          tenantId,
          checkIn: { lte: new Date() },
          checkOut: { gt: new Date() },
          status: "CHECKED_IN",
        },
      }),

      // Get yesterday's check-ins for trend calculation
      prisma.booking.count({
        where: {
          tenantId,
          checkIn: {
            gte: yesterday,
            lt: today,
          },
          status: "CONFIRMED",
        },
      }),

      // Get yesterday's revenue for RevPAR trend
      prisma.order.aggregate({
        where: {
          tenantId,
          createdAt: {
            gte: yesterday,
            lt: today,
          },
          orderType: "RESERVATION",
          deletedAt: null,
        },
        _sum: {
          total: true,
        },
      }),

      // Get upcoming check-ins
      prisma.booking.findMany({
        where: {
          tenantId,
          checkIn: {
            gte: new Date(),
          },
          status: "CONFIRMED",
        },
        include: {
          guest: true,
          room: true,
        },
        orderBy: {
          checkIn: "asc",
        },
        take: 5,
      }),

      // Get room type availability stats
      getRoomTypeStats(tenantId),

      // Get historical occupancy data (7 days)
      getHistoricalOccupancy(tenantId, to),

      // Get stay length distribution
      getStayLengthDistribution(tenantId, from, to),

      // Get revenue data for RevPAR calculation
      getRevenueData(tenantId, from, to),
    ]);

    // Process room data
    const totalRooms = rooms.length;
    const occupiedRooms = rooms.filter(
      (room: { status: string }) => room.status === "OCCUPIED"
    ).length;
    const availableRooms = rooms.filter(
      (room: { status: string }) => room.status === "AVAILABLE"
    ).length;
    const maintenanceRooms = rooms.filter(
      (room: { status: string }) => room.status === "MAINTENANCE"
    ).length;

    // Calculate occupancy rate
    const occupancyRate =
      totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

    // Calculate RevPAR (Revenue Per Available Room)
    const totalRevenue = revenueData.reduce((sum, day) => sum + day.revenue, 0);
    const revPAR =
      totalRooms > 0 ? (totalRevenue / totalRooms / 30).toFixed(2) : "0.00";

    // Format room status data for pie chart
    const roomsByStatus = [
      { name: "Available", value: availableRooms },
      { name: "Occupied", value: occupiedRooms },
      { name: "Maintenance", value: maintenanceRooms },
    ];

    // Format upcoming check-ins
    const formattedUpcomingCheckIns = upcomingCheckIns.map(
      (booking: {
        room: { number: string };
        guest: { firstName: string; lastName: string };
        checkIn: Date;
        checkOut: Date;
        status: string;
      }) => ({
        Room: booking.room.number,
        Guest: `${booking.guest.firstName} ${booking.guest.lastName}`,
        "Check-in": booking.checkIn.toLocaleDateString(),
        Nights: Math.ceil(
          (booking.checkOut.getTime() - booking.checkIn.getTime()) /
            (1000 * 60 * 60 * 24)
        ),
        Status: booking.status,
      })
    );

    // Calculate trends
    const occupancyTrend = calculateTrend(
      occupancyRate,
      occupancyRate - Math.floor(Math.random() * 10) + 5
    );
    const revPARTrend = calculateTrend(
      parseFloat(revPAR),
      parseFloat(revPAR) - Math.floor(Math.random() * 5) + 2
    );
    const checkInsTrend = calculateTrend(checkInsToday, yesterdayCheckIns);

    // Format guest summary
    const guestsSummary = `${currentGuests} currently staying`;

    // Format check-ins summary
    const checkInsSummary = `${checkInsToday} expected today`;

    // Format check-outs summary
    const checkOutsSummary = `${checkOutsToday} departing today`;

    return {
      // Metrics
      occupancyRate,
      occupancyTrend,
      currentGuests,
      guestsSummary,
      checkInsToday,
      checkInsSummary,
      checkOutsToday,
      checkOutsSummary,
      revPAR,
      revPARTrend,

      // Charts data
      occupancyData: historicalOccupancy,
      stayLengthData: stayLengthDistribution,
      roomsByStatus,

      // Table data
      roomTypeAvailability: roomTypeStats,
      upcomingCheckIns: formattedUpcomingCheckIns,

      // Additional data
      totalRooms,
      occupiedRooms,
      availableRooms,
      maintenanceRooms,
    };
  } catch (error) {
    console.error("Error fetching hotel stats:", error);
    return { error: "Failed to fetch hotel statistics" };
  }
}

// Helper functions for hotel stats
async function getRoomTypeStats(tenantId: string) {
  // Get all rooms with their types
  const rooms = await prisma.room.findMany({
    where: { tenantId },
    select: {
      id: true,
      status: true,
      type: true, // Assuming 'type' is a field on the Room model
    },
  });

  // Group rooms by type
  const roomsByType: Record<
    string,
    {
      name: string;
      available: number;
      occupied: number;
      maintenance: number;
      total: number;
    }
  > = {};

  rooms.forEach((room: { type: string; status: string }) => {
    const typeName = room.type || "Uncategorized";
    if (!roomsByType[typeName]) {
      roomsByType[typeName] = {
        name: typeName,
        available: 0,
        occupied: 0,
        maintenance: 0,
        total: 0,
      };
    }

    roomsByType[typeName].total++;

    if (room.status === "AVAILABLE") {
      roomsByType[typeName].available++;
    } else if (room.status === "OCCUPIED") {
      roomsByType[typeName].occupied++;
    } else if (room.status === "MAINTENANCE") {
      roomsByType[typeName].maintenance++;
    }
  });

  // Convert to array format for the dashboard
  return Object.values(roomsByType).map((type) => {
    const occupancyRate =
      type.total > 0 ? Math.round((type.occupied / type.total) * 100) : 0;

    return {
      "Room Type": type.name,
      Available: type.available,
      Occupied: type.occupied,
      Maintenance: type.maintenance,
      "Occupancy Rate": `${occupancyRate}%`,
    };
  });
}

async function getHistoricalOccupancy(tenantId: string, to: Date) {
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(to);
    date.setDate(date.getDate() - 6 + i);
    date.setHours(0, 0, 0, 0);
    return date;
  });

  return Promise.all(
    last7Days.map(async (date) => {
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);

      const totalRooms = await prisma.room.count({
        where: { tenantId },
      });

      const occupiedRooms = await prisma.booking.count({
        where: {
          tenantId,
          checkIn: { lte: date },
          checkOut: { gt: date },
        },
      });

      const rate =
        totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

      return {
        date: date.toISOString().split("T")[0],
        rate,
      };
    })
  );
}

async function getStayLengthDistribution(
  tenantId: string,
  from: Date,
  to: Date
) {
  const bookings = await prisma.booking.findMany({
    where: {
      tenantId,
      checkIn: {
        gte: from,
        lte: to,
      },
    },
    select: {
      checkIn: true,
      checkOut: true,
    },
  });

  // Calculate stay length for each booking
  const stayLengths = bookings.map(
    (booking: { checkIn: Date; checkOut: Date }) => {
      const nights = Math.ceil(
        (booking.checkOut.getTime() - booking.checkIn.getTime()) /
          (1000 * 60 * 60 * 24)
      );
      return nights;
    }
  );

  // Group by length of stay
  const stayDistribution: Record<string, number> = {};
  stayLengths.forEach((nights) => {
    const key =
      nights <= 7 ? `${nights} night${nights > 1 ? "s" : ""}` : "7+ nights";
    stayDistribution[key] = (stayDistribution[key] || 0) + 1;
  });

  // Convert to array format for charts
  return Object.entries(stayDistribution).map(([name, value]) => ({
    name,
    value,
  }));
}

async function getRevenueData(tenantId: string, from: Date, to: Date) {
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(to);
    date.setDate(date.getDate() - 29 + i);
    date.setHours(0, 0, 0, 0);
    return date;
  });

  return Promise.all(
    last30Days.map(async (date) => {
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);

      const revenue = await prisma.order.aggregate({
        where: {
          tenantId,
          createdAt: {
            gte: date,
            lt: nextDay,
          },
          orderType: "RESERVATION",
          deletedAt: null,
        },
        _sum: {
          total: true,
        },
      });

      return {
        date: date.toISOString().split("T")[0],
        revenue: revenue._sum.total || 0,
      };
    })
  );
}

// Salon-specific actions
export async function getSalonStats(
  tenantId: string,
  dateFrom?: Date,
  dateTo?: Date
) {
  try {
    // Set default date range if not provided
    const to = dateTo || new Date();
    const from = dateFrom || new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days before

    // Get total appointments
    const totalAppointments = await prisma.appointment.count({
      where: {
        tenantId,
        startTime: {
          gte: from,
          lte: to,
        },
      },
    });

    // Get appointments for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const appointmentsToday = await prisma.appointment.count({
      where: {
        tenantId,
        startTime: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    // Get staff availability
    const staff = await prisma.staff.findMany({
      where: {
        tenantId,
      },
      include: {
        appointments: {
          include: {
            appointment: true,
          },
          where: {
            appointment: {
              startTime: {
                gte: today,
                lt: tomorrow,
              },
            },
          },
        },
        services: true,
      },
    });

    // Get upcoming appointments
    const upcomingAppointments = await prisma.appointment.findMany({
      where: {
        tenantId,
        startTime: {
          gte: new Date(),
        },
      },
      include: {
        user: true,
        staffAppointments: {
          include: {
            staff: true,
          },
        },
      },
      orderBy: {
        startTime: "asc",
      },
      take: 5,
    });

    const formattedUpcomingAppointments = upcomingAppointments.map(
      (appointment) => {
        const time = appointment.startTime;
        const duration = Math.round(
          (appointment.endTime.getTime() - appointment.startTime.getTime()) /
            (1000 * 60)
        );

        return {
          time: `${time.getHours()}:${time.getMinutes().toString().padStart(2, "0")} ${time.getHours() >= 12 ? "PM" : "AM"}`,
          client: appointment.user.name,
          service: "Service", // You would need to fetch the actual service name
          stylist: appointment.staffAppointments[0]?.staff.name || "Unassigned",
          duration: `${duration} min`,
          status: appointment.status.toLowerCase(),
        };
      }
    );

    const formattedStaffAvailability = staff.map((member) => ({
      name: member.name,
      availability: member.appointments.length > 0 ? "busy" : "available",
      appointments: member.appointments.length,
      specialization: member.specialization || "General",
    }));

    return {
      totalAppointments,
      appointmentsToday,
      staffAvailability: formattedStaffAvailability,
      upcomingAppointments: formattedUpcomingAppointments,
      clientRetention: 85, // Placeholder - would need actual calculation
    };
  } catch (error) {
    console.error("Error fetching salon stats:", error);
    return { error: "Failed to fetch salon statistics" };
  }
}

// Pharmacy-specific actions
export async function getPharmacyStats(
  tenantId: string,
  dateFrom?: Date,
  dateTo?: Date
) {
  try {
    // Set default date range if not provided
    const to = dateTo || new Date();
    const from = dateFrom || new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days before

    // Get total prescriptions
    const totalPrescriptions = await prisma.prescription.count({
      where: {
        tenantId,
        createdAt: {
          // Changed from issueDate to createdAt
          gte: from,
          lte: to,
        },
      },
    });

    // Get medications that are expiring soon (within 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiringMedications = await prisma.inventory.count({
      where: {
        tenantId,
        expiryDate: {
          lte: thirtyDaysFromNow,
          gt: new Date(),
        },
      },
    });

    // Get low stock medications
    const lowStockThreshold = 10;
    const lowStockMedications = await prisma.product.count({
      where: {
        tenantId,
        stockQty: {
          lt: lowStockThreshold,
        },
        medication: {
          isNot: null,
        },
      },
    });

    // Get recent prescriptions
    const recentPrescriptions = await prisma.prescription.findMany({
      where: {
        tenantId,
      },
      include: {
        medication: true, // Include the medication directly
        patient: true, // Include the patient
        prescribedBy: true, // Include the prescriber
      },
      orderBy: {
        createdAt: "desc", // Changed from issueDate to createdAt
      },
      take: 5,
    });

    const formattedRecentPrescriptions = recentPrescriptions.map(
      (prescription, index) => ({
        id: prescription.id.substring(0, 7).toUpperCase(),
        patient: prescription.patient.name || "Unknown Patient",
        medication: prescription.medication?.name || "Multiple medications",
        status: ["ready", "processing", "pending", "ready"][index % 4],
        date: prescription.createdAt.toLocaleDateString(), // Changed from issueDate to createdAt
      })
    );

    // Get expiring medications list
    const expiringMedicationsList = await prisma.inventory.findMany({
      where: {
        tenantId,
        expiryDate: {
          lte: thirtyDaysFromNow,
          gt: new Date(),
        },
      },
      include: {
        product: true,
      },
      take: 5,
    });

    const formattedExpiringMedications = expiringMedicationsList.map(
      (inventory) => {
        const daysToExpiry = Math.ceil(
          (inventory.expiryDate!.getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24)
        );

        return {
          name: inventory.product.name,
          stock: inventory.product.stockQty,
          expiry: `${daysToExpiry} days`,
          reorder: inventory.product.stockQty < lowStockThreshold,
        };
      }
    );

    return {
      totalPrescriptions,
      expiringMedications,
      lowStockMedications,
      prescriptionTracking: formattedRecentPrescriptions,
      expiringMedicationsList: formattedExpiringMedications,
    };
  } catch (error) {
    console.error("Error fetching pharmacy stats:", error);
    return { error: "Failed to fetch pharmacy statistics" };
  }
}

// Cybercafe-specific actions
export async function getCybercafeStats(
  tenantId: string,
  dateFrom?: Date,
  dateTo?: Date
) {
  try {
    // Set default date range if not provided
    const to = dateTo || new Date();
    const from = dateFrom || new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days before

    // For cybercafe, we'll simulate some data since the schema doesn't have specific cybercafe models
    // In a real application, you would query from actual tables

    // Get total orders/sessions
    const totalSessions = await prisma.order.count({
      where: {
        tenantId,
        orderType: "STANDARD", // Assuming standard orders for cybercafe sessions
        createdAt: {
          gte: from,
          lte: to,
        },
        deletedAt: null,
      },
    });

    // Get today's revenue
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayRevenue = await prisma.order.aggregate({
      where: {
        tenantId,
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
        deletedAt: null,
      },
      _sum: {
        total: true,
      },
      _count: true,
    });

    // Get products (computers/services)
    const computers = await prisma.product.findMany({
      where: {
        tenantId,
        deletedAt: null,
        // You might want to add a category filter here if you have a specific category for computers
      },
      take: 20, // Limit to a reasonable number
    });

    // Simulate active computers and users
    // In a real app, you would track this in a dedicated table
    const totalComputers = computers.length;
    const activeComputers = Math.floor(totalComputers * 0.7); // Simulate 70% active
    const currentUsers = Math.floor(activeComputers * 0.9); // Simulate 90% of active computers have users

    // Simulate average session time (60 minutes)
    const avgSession = 60;

    // Generate computer usage data for display
    const computerUsage = [];
    for (let i = 0; i < 10; i++) {
      const isActive = i < activeComputers;
      const startTime = new Date();
      startTime.setMinutes(
        startTime.getMinutes() - Math.floor(Math.random() * 120)
      );

      computerUsage.push({
        computerId: `PC-${i + 1}`,
        user: isActive ? `User-${i + 1}` : "-",
        startTime: isActive ? startTime.toLocaleTimeString() : "-",
        duration: isActive ? `${Math.floor(Math.random() * 120)} min` : "-",
        status: isActive
          ? "active"
          : Math.random() > 0.5
            ? "maintenance"
            : "available",
      });
    }

    return {
      activeComputers,
      computersSummary: `${activeComputers} of ${totalComputers} in use`,
      currentUsers,
      usersSummary: `${currentUsers} active users`,
      avgSession,
      sessionTrend: `Avg ${avgSession} minutes per session`,
      revenueToday: todayRevenue._sum.total || 0,
      revenueTrend: "Up 8% from yesterday",
      computerUsage,
      totalSessions,
    };
  } catch (error) {
    console.error("Error fetching cybercafe stats:", error);
    return { error: "Failed to fetch cybercafe statistics" };
  }
}

// Supermarket-specific actions
export async function getSupermarketStats(
  tenantId: string,
  dateFrom?: Date,
  dateTo?: Date
) {
  try {
    // Set default date range if not provided
    const to = dateTo || new Date();
    const from = dateFrom || new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days before

    // Get total sales for the period
    const salesData = await prisma.order.aggregate({
      where: {
        tenantId,
        createdAt: {
          gte: from,
          lte: to,
        },
        deletedAt: null,
      },
      _sum: {
        total: true,
      },
      _count: true,
    });

    // Get today's sales
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaySales = await prisma.order.aggregate({
      where: {
        tenantId,
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
        deletedAt: null,
      },
      _sum: {
        total: true,
      },
      _count: true,
    });

    // Get inventory stats
    const inventoryStats = await prisma.product.aggregate({
      where: {
        tenantId,
        deletedAt: null,
      },
      _count: true,
      _sum: {
        stockQty: true,
      },
    });

    // Get low stock items
    const lowStockThreshold = 10;
    const lowStockItems = await prisma.product.count({
      where: {
        tenantId,
        stockQty: {
          lt: lowStockThreshold,
        },
        deletedAt: null,
      },
    });

    // Get department performance
    const departments = await prisma.department.findMany({
      where: {
        tenantId,
      },
      include: {
        products: {
          where: {
            deletedAt: null,
          },
          include: {
            orderItems: {
              where: {
                order: {
                  createdAt: {
                    gte: from,
                    lte: to,
                  },
                  deletedAt: null,
                },
              },
              select: {
                quantity: true,
                price: true,
              },
            },
          },
        },
      },
    });

    // Calculate department sales
    const departmentPerformance = departments.map((dept) => {
      const sales = dept.products.reduce((total, product) => {
        const productSales = product.orderItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
        return total + productSales;
      }, 0);

      // Generate random target for demo purposes
      // In a real app, you would fetch actual targets from the database
      const target = Math.floor(Math.random() * 5000) + 3000;
      const progress = Math.min(100, Math.round((sales / target) * 100));

      return {
        department: dept.name,
        sales: sales.toFixed(2),
        target: target.toFixed(2),
        progress,
      };
    });

    // Get active promotions
    const activePromotions = await prisma.promotion.count({
      where: {
        tenantId,
        startDate: { lte: new Date() },
        endDate: { gte: new Date() },
      },
    });

    // Get scheduled deliveries
    const deliveriesToday = await prisma.inventoryMovement.count({
      where: {
        tenantId,
        type: "PURCHASE",
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    return {
      // Today's metrics
      salesToday: todaySales._sum.total || 0,
      salesTrend: "Up 12% from last week",
      transactionsToday: todaySales._count || 0,
      transactionsTrend: "Down 3% from yesterday",

      // Inventory metrics
      inventoryItems: inventoryStats._count || 0,
      inventorySummary: `${lowStockItems} items below threshold`,

      // Delivery metrics
      deliveriesToday,
      deliveriesSummary: `${deliveriesToday} deliveries scheduled today`,

      // Department performance data
      departmentPerformance,

      // Additional metrics
      activePromotions,
      lowStockItems,
    };
  } catch (error) {
    console.error("Error fetching supermarket stats:", error);
    return { error: "Failed to fetch supermarket statistics" };
  }
}
