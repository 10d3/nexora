/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useResource } from "@/context/resource-provider"
import { useDashboard } from "@/context/dashboard-provider"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  MoreHorizontal,
  Edit,
  Trash,
  Users,
  Bed,
  Utensils,
  User,
  DollarSign,
  Mail,
  Phone,
  Star,
  Plus,
  Filter,
  Search,
  Eye,
} from "lucide-react"
import { useState } from "react"
import { useResourceMutation } from "@/hooks/use-resource-mutations"
import { ResourceDialog } from "@/components/resources-forms/resource-dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"

export function ResourceGrid() {
  const { resources, loading, setSelectedResource } = useResource()
  const { tenantId, businessType } = useDashboard()
  const { deleteResource } = useResourceMutation()

  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [resourceToEdit, setResourceToEdit] = useState<any>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [resourceToDelete, setResourceToDelete] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState("grid")

  // Handle edit resource
  const handleEdit = (resource: any) => {
    setResourceToEdit(resource)
    setEditDialogOpen(true)
  }

  // Handle delete resource
  const handleDelete = (resource: any) => {
    setResourceToDelete(resource)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (resourceToDelete) {
      toast.promise(
        async () => {
          await deleteResource(resourceToDelete.id)
          setDeleteDialogOpen(false)
          setResourceToDelete(null)
        },
        {
          loading: "Deleting resource...",
          success: `${resourceToDelete.name} has been deleted`,
          error: "Failed to delete resource",
        },
      )
    }
  }

  // Get status badge color based on status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "bg-green-500/20 text-green-700 border-green-600"
      case "OCCUPIED":
      case "BUSY":
        return "bg-red-500/20 text-red-700 border-red-600"
      case "RESERVED":
        return "bg-blue-500/20 text-blue-700 border-blue-600"
      case "MAINTENANCE":
      case "CLEANING":
        return "bg-yellow-500/20 text-yellow-700 border-yellow-600"
      case "ON_LEAVE":
      case "INACTIVE":
        return "bg-gray-500/20 text-gray-700 border-gray-600"
      default:
        return "bg-gray-500/20 text-gray-700 border-gray-600"
    }
  }

  // Get resource icon based on business type and resource type
  const getResourceIcon = (resource: any) => {
    switch (businessType) {
      case "RESTAURANT":
        return <Utensils className="h-6 w-6 text-primary" />
      case "HOTEL":
        return <Bed className="h-6 w-6 text-primary" />
      case "SALON":
      case "SERVICE":
        return <User className="h-6 w-6 text-primary" />
      default:
        return <Users className="h-6 w-6 text-primary" />
    }
  }

  // Get resource details based on business type
  const getResourceDetails = (resource: any) => {
    switch (businessType) {
      case "RESTAURANT":
        return [
          { label: "Capacity", value: resource.capacity, icon: <Users className="h-4 w-4 text-muted-foreground" /> },
          { label: "Type", value: resource.type || "Table", icon: <Star className="h-4 w-4 text-muted-foreground" /> },
        ]
      case "HOTEL":
        return [
          { label: "Type", value: resource.roomType, icon: <Bed className="h-4 w-4 text-muted-foreground" /> },
          { label: "Capacity", value: resource.capacity, icon: <Users className="h-4 w-4 text-muted-foreground" /> },
          {
            label: "Rate",
            value: `$${resource.rate?.toFixed(2)}`,
            icon: <DollarSign className="h-4 w-4 text-muted-foreground" />,
          },
        ]
      case "SALON":
      case "SERVICE":
        return [
          {
            label: "Specialization",
            value: resource.specialization,
            icon: <Star className="h-4 w-4 text-muted-foreground" />,
          },
          { label: "Email", value: resource.email, icon: <Mail className="h-4 w-4 text-muted-foreground" /> },
          { label: "Phone", value: resource.phone, icon: <Phone className="h-4 w-4 text-muted-foreground" /> },
        ]
      default:
        return [
          {
            label: "Type",
            value: resource.type || "Resource",
            icon: <Star className="h-4 w-4 text-muted-foreground" />,
          },
        ]
    }
  }

  // Get business type label
  const getBusinessTypeLabel = () => {
    switch (businessType) {
      case "RESTAURANT":
        return "Tables"
      case "HOTEL":
        return "Rooms"
      case "SALON":
        return "Staff"
      case "SERVICE":
        return "Service Providers"
      default:
        return "Resources"
    }
  }

  // Filter resources based on search term and status filter
  const filteredResources = resources.filter((resource) => {
    const matchesSearch = resource.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter ? resource.status === statusFilter : true
    return matchesSearch && matchesStatus
  })

  // Get unique statuses for filter dropdown
  const uniqueStatuses = Array.from(new Set(resources.map((resource) => resource.status)))

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-[200px]" />
          <Skeleton className="h-10 w-[120px]" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-[140px]" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 pt-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 w-full">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // Empty state
  if (resources.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg bg-muted/10">
        <div className="p-3 rounded-full bg-primary/10 mb-4">
          {businessType === "RESTAURANT" ? (
            <Utensils className="h-8 w-8 text-primary" />
          ) : businessType === "HOTEL" ? (
            <Bed className="h-8 w-8 text-primary" />
          ) : (
            <Users className="h-8 w-8 text-primary" />
          )}
        </div>
        <h3 className="text-lg font-medium mb-2">No {getBusinessTypeLabel().toLowerCase()} found</h3>
        <p className="text-muted-foreground max-w-md mb-6">
          Get started by adding your first {getBusinessTypeLabel().toLowerCase()} to manage your business efficiently.
        </p>
        <Button>
          <Plus className="h-4 w-4 mr-2" /> Add {getBusinessTypeLabel().slice(0, -1)}
        </Button>
      </div>
    )
  }

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
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter || "all"} onValueChange={(value) => setStatusFilter(value)}>
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
          <Tabs value={viewMode} onValueChange={setViewMode} className="w-[110px]">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="grid" className="px-3">
                <div className="grid grid-cols-2 gap-0.5">
                  <div className="h-1.5 w-1.5 rounded-sm bg-current"></div>
                  <div className="h-1.5 w-1.5 rounded-sm bg-current"></div>
                  <div className="h-1.5 w-1.5 rounded-sm bg-current"></div>
                  <div className="h-1.5 w-1.5 rounded-sm bg-current"></div>
                </div>
              </TabsTrigger>
              <TabsTrigger value="list" className="px-3">
                <div className="flex flex-col gap-0.5">
                  <div className="h-1 w-4 rounded-sm bg-current"></div>
                  <div className="h-1 w-4 rounded-sm bg-current"></div>
                  <div className="h-1 w-4 rounded-sm bg-current"></div>
                </div>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        {filteredResources.length === 0
          ? "No resources match your search"
          : `Showing ${filteredResources.length} of ${resources.length} ${getBusinessTypeLabel().toLowerCase()}`}
        {statusFilter && (
          <Button variant="link" size="sm" className="px-1 h-auto" onClick={() => setStatusFilter(null)}>
            Clear filter
          </Button>
        )}
      </div>

      {/* Grid View */}
      <TabsContent value="grid" className="mt-0">
        {filteredResources.length === 0 ? (
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredResources.map((resource) => (
              <Card key={resource.id} className="overflow-hidden transition-all hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium line-clamp-1">{resource.name}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className={`${getStatusColor(resource.status)}`}>
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
                        <DropdownMenuItem onClick={() => setSelectedResource(resource)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(resource)}>
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
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4 pt-4">
                    <div className="p-2 bg-primary/10 rounded-full">{getResourceIcon(resource)}</div>
                    <div className="space-y-1">
                      {getResourceDetails(resource).map((detail, index) => (
                        <div key={index} className="text-sm flex items-center gap-1.5">
                          {detail.icon}
                          <span className="font-medium">{detail.label}:</span>{" "}
                          <span className="text-muted-foreground">{detail.value || "N/A"}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" onClick={() => setSelectedResource(resource)}>
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>

      {/* List View */}
      <TabsContent value="list" className="mt-0">
        {filteredResources.length === 0 ? (
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
          <div className="border rounded-md overflow-hidden">
            {filteredResources.map((resource, index) => (
              <div
                key={resource.id}
                className={`flex items-center justify-between p-4 hover:bg-muted/50 transition-colors ${
                  index !== filteredResources.length - 1 ? "border-b" : ""
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded-full">{getResourceIcon(resource)}</div>
                  <div>
                    <h3 className="font-medium">{resource.name}</h3>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                      {getResourceDetails(resource)
                        .slice(0, 2)
                        .map((detail, idx) => (
                          <div key={idx} className="flex items-center gap-1">
                            {detail.icon}
                            <span>{detail.value || "N/A"}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className={`${getStatusColor(resource.status)}`}>
                    {resource.status}
                  </Badge>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedResource(resource)}
                      className="h-8 w-8"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(resource)} className="h-8 w-8">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(resource)}
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </TabsContent>

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
              <span className="font-medium">{resourceToDelete?.name}</span> and remove it from your system.
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
  )
}
