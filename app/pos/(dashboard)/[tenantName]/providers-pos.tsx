/* eslint-disable @typescript-eslint/no-explicit-any */
import { DashboardProvider } from "@/context/dashboard-provider";
import { InventoryProvider } from "@/context/inventory-provider";
import { OrderProvider } from "@/context/order-provider";
import { ReservationProvider } from "@/context/reservation-provider";
import { CustomerProvider } from "@/context/customer-provider";
import { StaffProvider } from "@/context/staff-provider";
import React from "react";
import { ResourceProvider } from "@/context/resource-provider";
import { MenuProvider } from "@/context/menu-provider";

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
        <CustomerProvider>
          <StaffProvider>
            <InventoryProvider>
              <OrderProvider>
                <ResourceProvider>
                  <MenuProvider>{children}</MenuProvider>
                </ResourceProvider>
              </OrderProvider>
            </InventoryProvider>
          </StaffProvider>
        </CustomerProvider>
      </ReservationProvider>
    </DashboardProvider>
  );
}
