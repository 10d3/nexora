/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { BusinessType } from "@prisma/client";
import type React from "react";

import { createContext, useContext, useState } from "react";

// export type BusinessType =
//   | "restaurant"
//   | "hotel"
//   | "salon"
//   | "pharmacy"
//   | "supermarket"
//   | "cybercafe"
//   | "construction"
//   | "education";

export type DashboardTab =
  | "overview"
  | "products"
  | "orders"
  | "customers"
  | "inventory"
  | "reports"
  | "settings";

type DashboardContextType = {
  businessType: BusinessType;
  setBusinessType: (type: BusinessType) => void;
  dateRange: { from: Date | undefined; to: Date | undefined };
  setDateRange: (range: {
    from: Date | undefined;
    to: Date | undefined;
  }) => void;
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
  tenantId: string | undefined;
  setTenantId: (id: string | undefined) => void;
};

const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined
);

export function DashboardProvider({ children, tenant }: { children: React.ReactNode, tenant: any }) {
  const [tenantId, setTenantId] = useState<string | undefined>(tenant.id);
  const [businessType, setBusinessType] = useState<BusinessType>(tenant.businessType);
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });

  return (
    <DashboardContext.Provider
      value={{
        businessType,
        setBusinessType,
        dateRange,
        setDateRange,
        activeTab,
        setActiveTab,
        tenantId,
        setTenantId,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}
