/* eslint-disable @typescript-eslint/no-explicit-any */
import { DashboardProvider } from "@/context/dashboard-provider";
import { InventoryProvider } from "@/context/inventory-provider";
import { OrderProvider } from "@/context/order-provider";
import { ReservationProvider } from "@/context/reservation-provider";
import { StaffProvider } from "@/context/staff-provider";
import React from "react";

export default function ProviderPos({
  tenant,
  children,
}: {
  tenant: any;
  children: React.ReactNode;
}) {
  return (
    <DashboardProvider tenant={tenant}>
      <ReservationProvider>
        <StaffProvider>
          <InventoryProvider>
            <OrderProvider>{children}</OrderProvider>
          </InventoryProvider>
        </StaffProvider>
      </ReservationProvider>
    </DashboardProvider>
  );
}
