"use server";

import { prisma } from "@/lib/prisma";
// import { revalidatePath } from "next/cache";
import { checkPermission } from "../permissions/server-permissions";
import { Permission } from "../permissions/role-permissions";

// Types for construction dashboard data
export type ConstructionProject = {
  id: string;
  name: string;
  progress: number;
  deadline: string;
  status: "on-track" | "delayed" | "at-risk";
};

export type ConstructionEquipment = {
  id: string;
  name: string;
  utilization: number;
  maintenance: string;
  status: "operational" | "maintenance";
};

export type ConstructionMaterial = {
  id: string;
  name: string;
  quantity: string;
  reorder: string;
  status: "adequate" | "low";
};

export type LaborData = {
  date: string;
  carpenters: number;
  masons: number;
  electricians: number;
  plumbers: number;
};

export type WeatherData = {
  impact: string;
  forecast: {
    day: string;
    condition: string;
    temperature: string;
    precipitation: string;
    wind: string;
  }[];
};

export type ProjectPhase = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: "completed" | "in-progress" | "pending";
};

export type ConstructionStats = {
  projects: ConstructionProject[];
  equipment: ConstructionEquipment[];
  materials: ConstructionMaterial[];
  laborData: LaborData[];
  weatherData: WeatherData;
  timeline: ProjectPhase[];
  error?: string;
};

export async function getConstructionStats(
  tenantId: string,
  startDate?: Date,
  endDate?: Date
): Promise<ConstructionStats> {
  try {
    // Check permission
    const hasPermission = await checkPermission(Permission.VIEW_DASHBOARD);
    if (!hasPermission) {
      return {
        projects: [],
        equipment: [],
        materials: [],
        laborData: [],
        weatherData: { impact: "", forecast: [] },
        timeline: [],
        error: "You don't have permission to view construction data",
      };
    }

    // Get projects from orders table
    const orders = await prisma.order.findMany({
      where: {
        tenantId,
        orderType: "STANDARD", // Adjust based on your data model
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    });

    // Transform orders to construction projects
    const projects: ConstructionProject[] = orders.map((order) => {
      // Calculate progress based on order status
      let progress = 0;
      let status: "on-track" | "delayed" | "at-risk" = "on-track";

      switch (order.status) {
        case "COMPLETED":
          progress = 100;
          status = "on-track";
          break;
        case "IN_PROGRESS":
          progress = 60;
          status = "on-track";
          break;
        case "PENDING":
          progress = 20;
          status = "delayed";
          break;
        case "CANCELLED":
          progress = 0;
          status = "at-risk";
          break;
        default:
          progress = 40;
          status = "on-track";
      }

      return {
        id: order.id,
        name: `Project #${order.orderNumber}`,
        progress,
        deadline: order.updatedAt.toLocaleDateString(),
        status,
      };
    });

    // Get equipment data from products table
    const products = await prisma.product.findMany({
      where: {
        tenantId,
        // You might want to add a filter for construction equipment
        // For example, categoryId for equipment category
      },
      take: 4,
    });

    // Transform products to equipment
    const equipment: ConstructionEquipment[] = products.map((product) => {
      // Generate random utilization for demo
      const utilization = Math.floor(Math.random() * 40) + 60; // 60-100%

      // Generate maintenance date (random future date)
      const maintenanceDate = new Date();
      maintenanceDate.setDate(
        maintenanceDate.getDate() + Math.floor(Math.random() * 30)
      );

      return {
        id: product.id,
        name: product.name,
        utilization,
        maintenance: maintenanceDate.toLocaleDateString(),
        status: utilization > 70 ? "operational" : "maintenance",
      };
    });

    // Get material inventory
    const inventory = await prisma.inventory.findMany({
      where: {
        tenantId,
      },
      include: {
        product: true,
      },
      take: 4,
    });

    // Transform inventory to materials
    const materials: ConstructionMaterial[] = inventory.map((item) => {
      return {
        id: item.id,
        name: item.product.name,
        quantity: `${item.product.stockQty} units`,
        reorder: "10 units", // Example reorder point
        status: item.product.stockQty > 10 ? "adequate" : "low",
      };
    });

    // Generate labor data (this would typically come from a staff/labor tracking system)
    const laborData: LaborData[] = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      laborData.push({
        date: date.toISOString().split("T")[0],
        carpenters: Math.floor(Math.random() * 10) + 5,
        masons: Math.floor(Math.random() * 8) + 3,
        electricians: Math.floor(Math.random() * 6) + 2,
        plumbers: Math.floor(Math.random() * 5) + 1,
      });
    }

    // Generate weather data (this would typically come from a weather API)
    const weatherData: WeatherData = {
      impact: "Medium",
      forecast: [
        {
          day: "Today",
          condition: "Sunny",
          temperature: "75°F",
          precipitation: "0%",
          wind: "5 mph",
        },
        {
          day: "Tomorrow",
          condition: "Partly Cloudy",
          temperature: "72°F",
          precipitation: "20%",
          wind: "8 mph",
        },
        {
          day: "Wednesday",
          condition: "Rainy",
          temperature: "68°F",
          precipitation: "80%",
          wind: "12 mph",
        },
        {
          day: "Thursday",
          condition: "Cloudy",
          temperature: "70°F",
          precipitation: "30%",
          wind: "7 mph",
        },
      ],
    };

    // Generate project timeline
    const timeline: ProjectPhase[] = [
      {
        id: "1",
        name: "Foundation",
        startDate: new Date(
          today.getTime() - 30 * 24 * 60 * 60 * 1000
        ).toLocaleDateString(),
        endDate: new Date(
          today.getTime() - 15 * 24 * 60 * 60 * 1000
        ).toLocaleDateString(),
        status: "completed",
      },
      {
        id: "2",
        name: "Framing",
        startDate: new Date(
          today.getTime() - 14 * 24 * 60 * 60 * 1000
        ).toLocaleDateString(),
        endDate: new Date(
          today.getTime() + 7 * 24 * 60 * 60 * 1000
        ).toLocaleDateString(),
        status: "in-progress",
      },
      {
        id: "3",
        name: "Electrical",
        startDate: new Date(
          today.getTime() + 8 * 24 * 60 * 60 * 1000
        ).toLocaleDateString(),
        endDate: new Date(
          today.getTime() + 22 * 24 * 60 * 60 * 1000
        ).toLocaleDateString(),
        status: "pending",
      },
      {
        id: "4",
        name: "Finishing",
        startDate: new Date(
          today.getTime() + 23 * 24 * 60 * 60 * 1000
        ).toLocaleDateString(),
        endDate: new Date(
          today.getTime() + 45 * 24 * 60 * 60 * 1000
        ).toLocaleDateString(),
        status: "pending",
      },
    ];

    return {
      projects,
      equipment,
      materials,
      laborData,
      weatherData,
      timeline,
    };
  } catch (error) {
    console.error("Error fetching construction stats:", error);
    return {
      projects: [],
      equipment: [],
      materials: [],
      laborData: [],
      weatherData: { impact: "", forecast: [] },
      timeline: [],
      error: "Failed to fetch construction data",
    };
  }
}
