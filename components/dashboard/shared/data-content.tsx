"use client";

import { useDashboard } from "@/context/dashboard-provider";
import { OrdersOverview } from "./order-overview";
import { ProductsOverview } from "./products-overview";
import { RestaurantDashboard } from "../restaurant/restaurant-dashboard";
import { PharmacyDashboard } from "../pharmacy/pharmacy-dashboard";
import { HotelDashboard } from "../hotel/hotel-dashboard";
import { SalonDashboard } from "../salon/salon-dashboard";
import { SupermarketDashboard } from "../supermarket/supermarket-dashboard";
import { CybercafeDashboard } from "../cybercafe/cybercafe-dashboard";
import { ConstructionDashboard } from "../construction/construction-dashboard";

export function DashboardContent() {
  const { businessType, activeTab } = useDashboard();

  console.log(businessType, activeTab);

  // Common tabs that are available for all business types
  if (activeTab === "products") {
    return <ProductsOverview />;
  }

  if (activeTab === "orders") {
    return <OrdersOverview />;
  }

  // Business-specific dashboards
  return (
    <main className="flex-1 overflow-auto p-4 sm:p-6">
      {businessType === "RESTAURANT" && <RestaurantDashboard />}
      {businessType === "HOTEL" && <HotelDashboard />}
      {businessType === "SALON" && <SalonDashboard />}
      {businessType === "PHARMACIE" && <PharmacyDashboard />}
      {businessType === "SUPERMARKET" && <SupermarketDashboard />}
      {businessType === "CYBERCAFE" && <CybercafeDashboard />}
      {businessType === "CONSTRUCTION" && <ConstructionDashboard />}
      {/* {businessType === "education" && <EducationDashboard />} */}
    </main>
  );
}
