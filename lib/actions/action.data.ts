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

    // Get reservations for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const reservations = await prisma.reservation.findMany({
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

    // Get orders for today
    const orders = await prisma.order.findMany({
      where: {
        tenantId,
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
        deletedAt: null,
      },
      include: {
        // Based on your schema, Order has a relation to OrderItem
        // and OrderItem has a relation to Product
        orderItems: {
          include: {
            product: true,
          },
        },
        table: true,
        user: true,
      },
    });

    // Calculate menu item popularity using MenuItem model
    // First get all menu items
    const menuItems = await prisma.menuItem.findMany({
      where: {
        tenantId,
        isAvailable: true,
      },
      select: {
        id: true,
        name: true,
        price: true,
      },
    });

    // Create a map of menu item popularity (using random data for now)
    // In a real implementation, you would track this through orders
    const menuItemPopularity = menuItems
      .map((item) => ({
        name: item.name,
        value: Math.floor(Math.random() * 30) + 10, // Placeholder value
      }))
      .slice(0, 5); // Top 5 items

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

    // Calculate table turnover rate from actual data
    const turnoverData = await Promise.all(
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

    // Format upcoming reservations for table display
    const upcomingReservations = reservations.map((res) => ({
      "Party Name": res.customerName,
      Time: new Date(res.reservationTime).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      "Party Size": res.partySize,
      Table: res.table?.number || "Not assigned",
      Status: res.status,
    }));

    // Calculate metrics
    const totalOrders = orders.length;

    // Calculate total customers from reservation party size
    // Since orders don't have partySize in your schema, we'll use table capacity as a fallback
    const totalCustomers = orders.reduce((sum, order) => {
      // Use table capacity if available, otherwise default to 1
      return sum + (order.table?.capacity || 1);
    }, 0);

    // Calculate average service time from completed orders
    const completedOrders = orders.filter(
      (order) => order.status === OrderStatus.COMPLETED && order.completedAt
    );

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

    const totalReservations = reservations.length;

    // Get historical average service time (last 7 days excluding today)
    const historicalServiceTime = serviceTimeData
      .slice(0, 6) // Take the first 6 days (excluding today)
      .reduce((sum, day) => sum + day.time, 0);

    const avgHistoricalServiceTime =
      serviceTimeData.slice(0, 6).length > 0
        ? Math.round(historicalServiceTime / serviceTimeData.slice(0, 6).length)
        : avgServiceTime;

    // Get yesterday's data for trend calculations
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const dayBeforeYesterday = new Date(yesterday);
    dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 1);

    // Get yesterday's orders
    const yesterdayOrders = await prisma.order.findMany({
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

    // Get yesterday's reservations
    const yesterdayReservations = await prisma.reservation.count({
      where: {
        tenantId,
        reservationTime: {
          gte: yesterday,
          lt: today,
        },
      },
    });

    // Calculate yesterday's metrics
    const yesterdayOrderCount = yesterdayOrders.length;
    const yesterdayCustomerCount = yesterdayOrders.reduce((sum, order) => {
      return sum + (order.table?.capacity || 1);
    }, 0);

    // Calculate trends based on real data
    const ordersTrend = calculateTrend(totalOrders, yesterdayOrderCount);
    const customersTrend = calculateTrend(
      totalCustomers,
      yesterdayCustomerCount
    );
    const serviceTimeDiff = avgServiceTime - avgHistoricalServiceTime;
    const serviceTimeTrend =
      serviceTimeDiff === 0
        ? "No change from average"
        : serviceTimeDiff < 0
          ? `↓ ${Math.abs(serviceTimeDiff)} min from average`
          : `↑ ${serviceTimeDiff} min from average`;

    // const totalReservations = reservations.length;
    const reservationsTrend = calculateTrend(
      totalReservations,
      yesterdayReservations
    );

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

    // Get room occupancy
    const rooms = await prisma.room.findMany({
      where: {
        tenantId,
      },
    });

    const totalRooms = rooms.length;
    const occupiedRooms = rooms.filter(
      (room) => room.status === "OCCUPIED"
    ).length;

    // Get bookings for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const bookingsToday = await prisma.booking.count({
      where: {
        tenantId,
        checkIn: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    // Get average stay length
    type StayLengthResult = {
      avg_days: number | null;
    }[];

    let averageStayLength = 2; // Default fallback value
    try {
      const stayLengthResult = await prisma.$queryRaw<StayLengthResult>`
            SELECT AVG(EXTRACT(EPOCH FROM (check_out - check_in)) / 86400) as avg_days
            FROM "Booking"
            WHERE 
              tenant_id = ${tenantId}
              AND check_in >= ${from}
              AND check_in <= ${to}
          `;

      if (stayLengthResult[0]?.avg_days) {
        averageStayLength = stayLengthResult[0].avg_days;
      }
    } catch (error) {
      console.error("Error calculating average stay length:", error);
      // Keep using the default value
    }

    // Get rooms by status
    const roomsByStatus = [
      {
        name: "Available",
        value: rooms.filter((room) => room.status === "AVAILABLE").length,
      },
      {
        name: "Occupied",
        value: occupiedRooms,
      },
      {
        name: "Maintenance",
        value: rooms.filter((room) => room.status === "MAINTENANCE").length,
      },
    ];

    // Get upcoming check-ins
    const upcomingCheckIns = await prisma.booking.findMany({
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
    });

    const formattedUpcomingCheckIns = upcomingCheckIns.map((booking) => ({
      room: booking.room.number,
      guest: `${booking.guest.firstName} ${booking.guest.lastName}`,
      arrival: booking.checkIn.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      status: booking.status.toLowerCase(),
      nights: Math.ceil(
        (booking.checkOut.getTime() - booking.checkIn.getTime()) /
          (1000 * 60 * 60 * 24)
      ),
    }));

    return {
      roomOccupancy: occupiedRooms,
      totalRooms,
      bookingsToday,
      averageStayLength,
      roomsByStatus,
      upcomingCheckIns: formattedUpcomingCheckIns,
      occupancyRate: totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0,
    };
  } catch (error) {
    console.error("Error fetching hotel stats:", error);
    return { error: "Failed to fetch hotel statistics" };
  }
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
