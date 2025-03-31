import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function StaffPageSkeleton() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-36" />
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <Skeleton className="h-10 w-full max-w-md" />
        <Skeleton className="h-10 w-24" />
      </div>

      <div className="space-y-4">
        <Skeleton className="h-10 w-full max-w-md" />
        <StaffTableSkeleton />
      </div>
    </div>
  );
}

export function StaffTableSkeleton() {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Skeleton className="h-5 w-20" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-5 w-24" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-5 w-16" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-5 w-20" />
              </TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-24" />
                </TableCell>
                <TableCell>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-8 w-8 rounded-md ml-auto" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export function StaffGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <Card key={index} className="overflow-hidden">
          <CardHeader className="p-0">
            <Skeleton className="h-32 w-full" />
          </CardHeader>
          <CardContent className="pt-0 relative -mt-12 space-y-4">
            <div className="flex flex-col items-center">
              <Skeleton className="h-24 w-24 rounded-full" />
              <Skeleton className="h-6 w-32 mt-2" />
              <Skeleton className="h-5 w-24 mt-1" />
            </div>

            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function StaffCalendarSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="md:col-span-1">
        <CardContent className="p-3">
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
