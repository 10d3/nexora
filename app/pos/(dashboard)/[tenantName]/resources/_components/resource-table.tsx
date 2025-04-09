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
import { MoreHorizontal, Edit, Trash } from "lucide-react";
import { useState } from "react";
import { useResourceMutation } from "@/hooks/use-resource-mutations";
import { ResourceDialog } from "@/components/resources-forms/resource-dialog";

export function ResourceTable() {
  const { resources, loading } = useResource();
  const { tenantId, businessType } = useDashboard();
  const { deleteResource } = useResourceMutation(businessType, tenantId || "");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [resourceToEdit, setResourceToEdit] = useState<any>(null);

  // Handle edit resource
  const handleEdit = (resource: any) => {
    setResourceToEdit(resource);
    setEditDialogOpen(true);
  };

  // Handle delete resource
  const handleDelete = (resourceId: string) => {
    if (confirm("Are you sure you want to delete this resource?")) {
      deleteResource(resourceId);
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

  // Get table columns based on business type
  const getColumns = () => {
    const baseColumns = [
      { header: "Name", accessor: "name" },
      { header: "Status", accessor: "status" },
    ];

    switch (businessType) {
      case "RESTAURANT":
        return [...baseColumns, { header: "Capacity", accessor: "capacity" }];
      case "HOTEL":
        return [
          ...baseColumns,
          { header: "Type", accessor: "roomType" },
          { header: "Capacity", accessor: "capacity" },
          { header: "Rate", accessor: "rate" },
        ];
      case "SALON":
      case "SERVICE":
        return [
          ...baseColumns,
          { header: "Specialization", accessor: "specialization" },
          { header: "Email", accessor: "email" },
          { header: "Phone", accessor: "phone" },
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

    return value;
  };

  if (loading) {
    return <div>Loading resources...</div>;
  }

  if (resources.length === 0) {
    return (
      <div className="text-center p-4">
        <p className="text-muted-foreground">No resources found</p>
      </div>
    );
  }

  const columns = getColumns();

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.accessor}>{column.header}</TableHead>
            ))}
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {resources.map((resource) => (
            <TableRow key={resource.id}>
              {columns.map((column) => (
                <TableCell key={`${resource.id}-${column.accessor}`}>
                  {formatCellValue(resource, column)}
                </TableCell>
              ))}
              <TableCell>
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
                    <DropdownMenuItem onClick={() => handleEdit(resource)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(resource.id)}>
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

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
    </div>
  );
}
