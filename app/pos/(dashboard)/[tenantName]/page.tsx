import { DashboardHeader } from "@/components/dashboard/shared/dashboard-header";
import { DashboardContent } from "@/components/dashboard/shared/data-content";
// import { PieChartComp } from "@/components/ui/pie-chart";
import React from "react";

export default function page() {
  return (
    <div>
      <DashboardHeader />
      <DashboardContent />
    </div>
  );
}
