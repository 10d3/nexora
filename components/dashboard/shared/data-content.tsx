"use client";

import { useDashboard } from "@/context/dashboard-provider";
import { OrdersOverview } from "./order-overview";
import { ProductsOverview } from "./products-overview";
import { RestaurantDashboard } from "../restaurant/restaurant-dashboard";
import { PharmacyDashboard } from "../pharmacy/pharmacy-dashboard";

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
      {/* {businessType === "hotel" && <HotelDashboard />} */}
      {/* {businessType === "salon" && <SalonDashboard />} */}
      {businessType === "PHARMACIE" && <PharmacyDashboard />}
      {/* {businessType === "supermarket" && <SupermarketDashboard />} */}
      {/* {businessType === "cybercafe" && <CybercafeDashboard />} */}
      {/* {businessType === "construction" && <ConstructionDashboard />} */}
      {/* {businessType === "education" && <EducationDashboard />} */}
    </main>
  );
}
