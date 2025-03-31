import { StaffProvider } from "@/context/staff-provider";
import { Suspense } from "react";
import { StaffPageSkeleton } from "./_components/staff-skeleton";
import StaffDashboard from "./_components/staff-dashboard";
// import { StaffProvider } from "@/providers/staff-provider";
// import StaffDashboard from "@/components/staff/staff-dashboard";
// import { StaffPageSkeleton } from "@/components/staff/staff-skeletons";

export default function StaffPage() {
  return (
    <StaffProvider>
      <Suspense fallback={<StaffPageSkeleton />}>
        <StaffDashboard />
      </Suspense>
    </StaffProvider>
  );
}
