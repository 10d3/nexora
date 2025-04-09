/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useResource } from "@/context/resource-provider";
import { useDashboard } from "@/context/dashboard-provider";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { MoreHorizontal, Edit, Trash, Users, Bed, Utensils, User } from "lucide-react";
import { useState } from "react";
import { useResourceMutation } from "@/hooks/use-resource-mutations";
import { ResourceDialog } from "@/components/resources-forms/resource-dialog";


export function ResourceGrid() {
  const { resources, loading, setSelectedResource } = useResource();
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

  // Get resource icon based on business type and resource type
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getResourceIcon = (resource: any) => {
    switch (businessType) {
      case "RESTAURANT":
        return <Utensils className="h-6 w-6" />;
      case "HOTEL":
        return <Bed className="h-6 w-6" />;
      case "SALON":
      case "SERVICE":
        return <User className="h-6 w-6" />;
      default:
        return <Users className="h-6 w-6" />;
    }
  };

  // Get resource details based on business type
  const getResourceDetails = (resource: any) => {
    switch (businessType) {
      case "RESTAURANT":
        return [
          { label: "Capacity", value: resource.capacity },
        ];
      case "HOTEL":
        return [
          { label: "Type", value: resource.roomType },
          { label: "Capacity", value: resource.capacity },
          { label: "Rate", value: `$${resource.rate.toFixed(2)}` },
        ];
      case "SALON":
      case "SERVICE":
        return [
          { label: "Specialization", value: resource.specialization },
          { label: "Email", value: resource.email },
          { label: "Phone", value: resource.phone },
        ];
      default:
        return [];
    }
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {resources.map((resource) => (
        <Card key={resource.id} className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {resource.name}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge
                variant="outline"
                className={`${getStatusColor(resource.status)}`}
              >
                {resource.status}
              </Badge>
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
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 pt-4">
              <div className="p-2 bg-primary/10 rounded-full">
                {getResourceIcon(resource)}
              </div>
              <div className="space-y-1">
                {getResourceDetails(resource).map((detail, index) => (
                  <div key={index} className="text-sm">
                    <span className="font-medium">{detail.label}:</span>{" "}
                    <span className="text-muted-foreground">{detail.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => setSelectedResource(resource)}
            >
              View Details
            </Button>
          </CardFooter>
        </Card>
      ))}

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