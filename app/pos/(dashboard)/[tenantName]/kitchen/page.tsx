"use client";

import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { KitchenDisplay } from "./_components/kitchen-display";

function KitchenPageSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <Skeleton className="h-8 w-64" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="border rounded-lg p-4 space-y-3">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-24" />
            <div className="space-y-2">
              {[...Array(4)].map((_, j) => (
                <div key={j} className="flex justify-between">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-10" />
                </div>
              ))}
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function KitchenPage() {
  return (
    <Suspense fallback={<KitchenPageSkeleton />}>
      <KitchenDisplay />
    </Suspense>
  );
}
