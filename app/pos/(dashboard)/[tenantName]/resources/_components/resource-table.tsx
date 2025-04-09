/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useResource } from "@/context/resource-provider";
import { useDashboard } from "@/context/dashboard-provider";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MoreHorizontal,
  Edit,
  Trash,
  Eye,
  Search,
  X,
  Filter,
  SlidersHorizontal,
  ArrowUpDown,
  Users,
  Bed,
  Utensils,
  Plus,
} from "lucide-react";
import { useState } from "react";
import { useResourceMutation } from "@/hooks/use-resource-mutations";
import { ResourceDialog } from "@/components/resources-forms/resource-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

export function ResourceTable() {
  const { resources, loading, setSelectedResource } = useResource();
  const { tenantId, businessType } = useDashboard();
  const { deleteResource } = useResourceMutation();

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [resourceToEdit, setResourceToEdit] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [sortField, setSortField] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Handle edit resource
  const handleEdit = (resource: any) => {
    setResourceToEdit(resource);
    setEditDialogOpen(true);
  };

  // Handle delete resource
  const handleDelete = (resource: any) => {
    setResourceToDelete(resource);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (resourceToDelete) {
      toast.promise(
        async () => {
          await deleteResource(resourceToDelete.id);
          setDeleteDialogOpen(false);
          setResourceToDelete(null);
        },
        {
          loading: "Deleting resource...",
          success: `${resourceToDelete.name} has been deleted`,
          error: "Failed to delete resource",
        }
      );
    }
  };

  // Handle sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Get status badge color based on status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "bg-green-500/20 text-green-700 border-green-600";
      case "OCCUPIED":
      case "BUSY":
        return "bg-red-500/20 text-red-700 border-red-600";
      case "RESERVED":
        return "bg-blue-500/20 text-blue-700 border-blue-600";
      case "MAINTENANCE":
      case "CLEANING":
        return "bg-yellow-500/20 text-yellow-700 border-yellow-600";
      case "ON_LEAVE":
      case "INACTIVE":
        return "bg-gray-500/20 text-gray-700 border-gray-600";
      default:
        return "bg-gray-500/20 text-gray-700 border-gray-600";
    }
  };

  // Get business type label
  const getBusinessTypeLabel = () => {
    switch (businessType) {
      case "RESTAURANT":
        return "Tables";
      case "HOTEL":
        return "Rooms";
      case "SALON":
        return "Staff";
      case "SERVICE":
        return "Service Providers";
      default:
        return "Resources";
    }
  };

  // Get business type icon
  const getBusinessTypeIcon = () => {
    switch (businessType) {
      case "RESTAURANT":
        return <Utensils className="h-8 w-8 text-primary" />;
      case "HOTEL":
        return <Bed className="h-8 w-8 text-primary" />;
      case "SALON":
      case "SERVICE":
        return <Users className="h-8 w-8 text-primary" />;
      default:
        return <Users className="h-8 w-8 text-primary" />;
    }
  };

  // Get table columns based on business type
  const getColumns = () => {
    const baseColumns = [
      { header: "Name", accessor: "name", sortable: true },
      { header: "Status", accessor: "status", sortable: true },
    ];

    switch (businessType) {
      case "RESTAURANT":
        return [
          ...baseColumns,
          { header: "Capacity", accessor: "capacity", sortable: true },
        ];
      case "HOTEL":
        return [
          ...baseColumns,
          { header: "Type", accessor: "roomType", sortable: true },
          { header: "Capacity", accessor: "capacity", sortable: true },
          { header: "Rate", accessor: "rate", sortable: true },
        ];
      case "SALON":
      case "SERVICE":
        return [
          ...baseColumns,
          {
            header: "Specialization",
            accessor: "specialization",
            sortable: true,
          },
          { header: "Email", accessor: "email", sortable: false },
          { header: "Phone", accessor: "phone", sortable: false },
        ];
      default:
        return baseColumns;
    }
  };

  // Format cell value based on column and business type
  const formatCellValue = (resource: any, column: { accessor: string }) => {
    const value = resource[column.accessor];

    if (column.accessor === "status") {
      return (
        <Badge variant="outline" className={`${getStatusColor(value)}`}>
          {value}
        </Badge>
      );
    }

    if (column.accessor === "rate" && value !== undefined) {
      return `$${value.toFixed(2)}`;
    }

    return value || "-";
  };

  // Filter and sort resources
  const filteredAndSortedResources = resources
    .filter((resource) => {
      const matchesSearch = resource.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter
        ? resource.status === statusFilter
        : true;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Handle undefined or null values for sorting
      if (aValue === undefined || aValue === null) aValue = "";
      if (bValue === undefined || bValue === null) bValue = "";

      // Convert to strings for comparison if not numbers
      if (typeof aValue !== "number") aValue = String(aValue).toLowerCase();
      if (typeof bValue !== "number") bValue = String(bValue).toLowerCase();

      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Get unique statuses for filter dropdown
  const uniqueStatuses = Array.from(
    new Set(resources.map((resource) => resource.status))
  );

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-[200px]" />
          <Skeleton className="h-10 w-[120px]" />
        </div>
        <div className="rounded-md border">
          <div className="p-1">
            <div className="flex h-10 items-center px-2 border-b">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-4 w-[100px] mx-4" />
              ))}
            </div>
            {[1, 2, 3, 4, 5].map((row) => (
              <div
                key={row}
                className="flex h-16 items-center px-2 border-b last:border-0"
              >
                {[1, 2, 3, 4].map((cell) => (
                  <Skeleton key={cell} className="h-4 w-[100px] mx-4" />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (resources.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg bg-muted/10">
        <div className="p-3 rounded-full bg-primary/10 mb-4">
          {getBusinessTypeIcon()}
        </div>
        <h3 className="text-lg font-medium mb-2">
          No {getBusinessTypeLabel().toLowerCase()} found
        </h3>
        <p className="text-muted-foreground max-w-md mb-6">
          Get started by adding your first{" "}
          {getBusinessTypeLabel().toLowerCase()} to manage your business
          efficiently.
        </p>
        <Button>
          <Plus className="h-4 w-4 mr-2" /> Add{" "}
          {getBusinessTypeLabel().slice(0, -1)}
        </Button>
      </div>
    );
  }

  const columns = getColumns();

  return (
    <div className="space-y-4">
      {/* Header with search and filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={`Search ${getBusinessTypeLabel().toLowerCase()}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-9 w-9"
              onClick={() => setSearchTerm("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <Select
          value={statusFilter || "all"}
          onValueChange={(value) =>
            setStatusFilter(value === "all" ? null : value)
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {uniqueStatuses.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Results count and filter indicator */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {filteredAndSortedResources.length === 0
            ? "No resources match your search"
            : `Showing ${filteredAndSortedResources.length} of ${resources.length} ${getBusinessTypeLabel().toLowerCase()}`}
          {(statusFilter || searchTerm) && (
            <Button
              variant="link"
              size="sm"
              className="px-1 h-auto"
              onClick={() => {
                setStatusFilter(null);
                setSearchTerm("");
              }}
            >
              Clear all filters
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Sorted by{" "}
            {columns.find((col) => col.accessor === sortField)?.header ||
              "Name"}
          </span>
        </div>
      </div>

      {filteredAndSortedResources.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg bg-muted/10">
          <Filter className="h-8 w-8 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No matching resources</h3>
          <p className="text-muted-foreground max-w-md mb-4">
            Try adjusting your search or filter to find what you&apos;re looking for.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setSearchTerm("")}>
              Clear Search
            </Button>
            <Button variant="outline" onClick={() => setStatusFilter(null)}>
              Clear Filters
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead
                    key={column.accessor}
                    className={
                      column.sortable
                        ? "cursor-pointer hover:bg-muted/50 transition-colors"
                        : ""
                    }
                    onClick={() =>
                      column.sortable && handleSort(column.accessor)
                    }
                  >
                    <div className="flex items-center">
                      {column.header}
                      {column.sortable && sortField === column.accessor && (
                        <ArrowUpDown
                          className={`ml-2 h-4 w-4 ${sortDirection === "desc" ? "rotate-180" : ""} transition-transform`}
                        />
                      )}
                    </div>
                  </TableHead>
                ))}
                <TableHead className="w-[120px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedResources.map((resource) => (
                <TableRow key={resource.id} className="group">
                  {columns.map((column) => (
                    <TableCell key={`${resource.id}-${column.accessor}`}>
                      {formatCellValue(resource, column)}
                    </TableCell>
                  ))}
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => setSelectedResource(resource)}
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View details</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleEdit(resource)}
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setSelectedResource(resource)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEdit(resource)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(resource)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Edit Dialog */}
      {resourceToEdit && (
        <ResourceDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          businessType={businessType}
          tenantId={tenantId || ""}
          mode="edit"
          resource={resourceToEdit}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{" "}
              <span className="font-medium">{resourceToDelete?.name}</span> and
              remove it from your system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
