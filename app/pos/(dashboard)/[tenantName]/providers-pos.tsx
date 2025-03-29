/* eslint-disable @typescript-eslint/no-explicit-any */
import { DashboardProvider } from "@/context/dashboard-provider";
import { ReservationProvider } from "@/context/reservation-provider";
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
      <ReservationProvider>{children}</ReservationProvider>
    </DashboardProvider>
  );
}
