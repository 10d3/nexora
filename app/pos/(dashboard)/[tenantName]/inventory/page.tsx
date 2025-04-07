/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo } from "react";
// import { useParams } from "next/navigation";
import {
  ArrowUpDown,
  BarChart3,
  Boxes,
  CheckCircle2,
  Clock,
  Download,
  Edit,
  Filter,
  Info,
  PackagePlus,
  Package,
  PackageX,
  Plus,
  RefreshCcw,
  Search,
  Settings,
  Tag,
  Trash2,
  AlertTriangle,
  XCircle,
  FileText,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useDashboard } from "@/context/dashboard-provider";
import { useInventoryMutation } from "@/hooks/use-inventory-mutations";
import { useQuery } from "@tanstack/react-query";
import {
  getInventory,
  getCategories,
  getSuppliers,
} from "@/lib/actions/inventory-actions";

// Types
type InventoryItem = {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  minQuantity: number;
  price: number;
  cost: number;
  supplier: string;
  location: string;
  lastUpdated: Date;
  status: "in-stock" | "low-stock" | "out-of-stock" | "discontinued";
  image?: string;
  tenantId?: string;
  businessType?: string;
};

type Category = {
  id: string;
  name: string;
  count: number;
  color: string;
};

type Supplier = {
  id: string;
  name: string;
  count: number;
};

export default function InventoryPage() {
  //   const { tenantName } = useParams();
  const { businessType, tenantId } = useDashboard();
  const { createInventoryItem, updateInventoryItem, deleteInventoryItem } =
    useInventoryMutation(tenantId as string);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedSupplier, setSelectedSupplier] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof InventoryItem;
    direction: "asc" | "desc";
  } | null>(null);

  // Fetch inventory data using React Query
  const {
    data: inventoryData,
    isLoading,
    // isError,
  } = useQuery({
    queryKey: [
      "inventory",
      tenantId,
      selectedCategory,
      selectedStatus,
      selectedSupplier,
      searchQuery,
    ],
    queryFn: () =>
      getInventory(
        businessType,
        tenantId as string,
        selectedCategory !== "all" ? selectedCategory : undefined,
        selectedStatus !== "all" ? selectedStatus : undefined,
        selectedSupplier !== "all" ? selectedSupplier : undefined,
        searchQuery || undefined
      ),
    enabled: !!tenantId,
  });

  // Fetch categories using React Query
  const { data: categoriesData, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ["categories", tenantId],
    queryFn: () => getCategories(businessType, tenantId as string),
    enabled: !!tenantId,
  });

  // Fetch suppliers using React Query
  const { data: suppliersData, isLoading: isSuppliersLoading } = useQuery({
    queryKey: ["suppliers", tenantId],
    queryFn: () => getSuppliers(businessType, tenantId as string),
    enabled: !!tenantId,
  });

  // Extract data from query results
  const inventory: InventoryItem[] = inventoryData?.success
    ? inventoryData.data || []
    : [];
  const categories: Category[] = categoriesData?.success
    ? categoriesData.data || []
    : [];
  const suppliers: Supplier[] = suppliersData?.success
    ? suppliersData.data || []
    : [];

  // Determine if any data is loading
  const isDataLoading = isLoading || isCategoriesLoading || isSuppliersLoading;

  // Apply client-side sorting and filtering
  const filteredInventory = useMemo(() => {
    const filtered = [...inventory];

    // Apply sorting
    if (sortConfig) {
      filtered.sort((a, b) => {
        const key = sortConfig.key;
        const direction = sortConfig.direction;

        // Handle different types of values for proper comparison
        const aValue = a[key];
        const bValue = b[key];

        // For string comparison
        if (typeof aValue === "string" && typeof bValue === "string") {
          return direction === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        // For number and other types
        if (aValue !== undefined && bValue !== undefined && aValue < bValue) {
          return direction === "asc" ? -1 : 1;
        }
        if (aValue !== undefined && bValue !== undefined && aValue > bValue) {
          return direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [inventory, sortConfig]);

  // Handle sorting
  const handleSort = (key: keyof InventoryItem) => {
    let direction: "asc" | "desc" = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Handle adding a new item
  const handleAddItem = async (formData: FormData) => {
    try {
      const newItem = {
        name: formData.get("name") as string,
        sku: formData.get("sku") as string,
        category: formData.get("category") as string,
        quantity: Number.parseInt(formData.get("quantity") as string),
        minQuantity: Number.parseInt(formData.get("minQuantity") as string),
        price: Number.parseFloat(formData.get("price") as string),
        cost: Number.parseFloat(formData.get("cost") as string),
        supplier: formData.get("supplier") as string,
        location: formData.get("location") as string,
        tenantId: tenantId as string,
        businessType: businessType,
        status:
          Number.parseInt(formData.get("quantity") as string) === 0
            ? "out-of-stock"
            : Number.parseInt(formData.get("quantity") as string) <
                Number.parseInt(formData.get("minQuantity") as string)
              ? "low-stock"
              : "in-stock",
      };

      // Use the mutation hook to create the item
      createInventoryItem(newItem, {
        onSuccess: () => {
          setIsAddDialogOpen(false);
          toast.success("Item added successfully", {
            description: `${newItem.name} has been added to inventory.`,
          });
        },
        onError: (error: any) => {
          console.error("Failed to add item:", error);
          toast.error("Failed to add item");
        },
      });
    } catch (error) {
      console.error("Failed to add item:", error);
      toast.error("Failed to add item");
    }
  };

  // Handle editing an item
  const handleEditItem = async (formData: FormData) => {
    if (!selectedItem) return;

    try {
      const updatedItem = {
        id: selectedItem.id,
        name: formData.get("name") as string,
        sku: formData.get("sku") as string,
        category: formData.get("category") as string,
        quantity: Number.parseInt(formData.get("quantity") as string),
        minQuantity: Number.parseInt(formData.get("minQuantity") as string),
        price: Number.parseFloat(formData.get("price") as string),
        cost: Number.parseFloat(formData.get("cost") as string),
        supplier: formData.get("supplier") as string,
        location: formData.get("location") as string,
        tenantId: tenantId as string,
        businessType: businessType,
        status:
          Number.parseInt(formData.get("quantity") as string) === 0
            ? "out-of-stock"
            : Number.parseInt(formData.get("quantity") as string) <
                Number.parseInt(formData.get("minQuantity") as string)
              ? "low-stock"
              : "in-stock",
      };

      // Use the mutation hook to update the item
      updateInventoryItem(
        { itemId: updatedItem.id, data: updatedItem },
        {
          onSuccess: () => {
            setIsEditDialogOpen(false);
            setSelectedItem(null);
            toast.success("Item updated successfully", {
              description: `${updatedItem.name} has been updated.`,
            });
          },
          onError: (error: any) => {
            console.error("Failed to update item:", error);
            toast.error("Failed to update item");
          },
        }
      );
    } catch (error) {
      console.error("Failed to update item:", error);
      toast.error("Failed to update item");
    }
  };

  // Handle deleting an item
  const handleDeleteItem = async (id: string) => {
    const itemToDelete = inventory.find((item) => item.id === id);
    if (!itemToDelete) return;

    try {
      // Use the mutation hook to delete the item
      deleteInventoryItem(id, {
        onSuccess: () => {
          toast.success("Item deleted successfully", {
            description: `${itemToDelete.name} has been removed from inventory.`,
          });
        },
        onError: (error: any) => {
          console.error("Failed to delete item:", error);
          toast.error("Failed to delete item");
        },
      });
    } catch (error) {
      console.error("Failed to delete item:", error);
      toast.error("Failed to delete item");
    }
  };

  // Calculate inventory statistics
  const totalItems = inventory.length;
  const totalValue = inventory.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const lowStockItems = inventory.filter(
    (item) => item.status === "low-stock"
  ).length;
  const outOfStockItems = inventory.filter(
    (item) => item.status === "out-of-stock"
  ).length;

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "in-stock":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            <CheckCircle2 className="h-3 w-3 mr-1" />
            In Stock
          </Badge>
        );
      case "low-stock":
        return (
          <Badge
            variant="outline"
            className="bg-amber-50 text-amber-700 border-amber-200"
          >
            <AlertTriangle className="h-3 w-3 mr-1" />
            Low Stock
          </Badge>
        );
      case "out-of-stock":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200"
          >
            <XCircle className="h-3 w-3 mr-1" />
            Out of Stock
          </Badge>
        );
      case "discontinued":
        return (
          <Badge
            variant="outline"
            className="bg-gray-100 text-gray-700 border-gray-200"
          >
            <Info className="h-3 w-3 mr-1" />
            Discontinued
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Format date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Get category color
  const getCategoryColor = (categoryName: string) => {
    const category = categories.find((c) => c.name === categoryName);
    return category?.color || "bg-gray-500";
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          {/* <div className="p-2 bg-primary/10 rounded-lg">
            <Warehouse className="h-6 w-6 text-primary" />
          </div> */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Inventory Management
            </h1>
            <p className="text-muted-foreground">
              Manage your products, stock levels, and suppliers
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>Add New Inventory Item</DialogTitle>
                <DialogDescription>
                  Enter the details for the new inventory item.
                </DialogDescription>
              </DialogHeader>
              <form action={handleAddItem} className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Enter product name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU</Label>
                    <Input
                      id="sku"
                      name="sku"
                      placeholder="Enter SKU"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select name="category">
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supplier">Supplier</Label>
                    <Select name="supplier">
                      <SelectTrigger>
                        <SelectValue placeholder="Select supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.name}>
                            {supplier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      name="quantity"
                      type="number"
                      min="0"
                      defaultValue="10"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minQuantity">Min Quantity</Label>
                    <Input
                      id="minQuantity"
                      name="minQuantity"
                      type="number"
                      min="0"
                      defaultValue="5"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price ($)</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      min="0"
                      step="0.01"
                      defaultValue="29.99"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cost">Cost ($)</Label>
                    <Input
                      id="cost"
                      name="cost"
                      type="number"
                      min="0"
                      step="0.01"
                      defaultValue="19.99"
                      required
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="location">Storage Location</Label>
                    <Input
                      id="location"
                      name="location"
                      placeholder="Enter storage location"
                      defaultValue="Warehouse A"
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Add Item</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <FileText className="h-4 w-4 mr-2" />
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileText className="h-4 w-4 mr-2" />
                Export as Excel
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileText className="h-4 w-4 mr-2" />
                Export as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Boxes className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground">
              Across {categories.length} categories
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Inventory Value
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalValue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total value of all items
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Low Stock Items
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockItems}</div>
            <p className="text-xs text-muted-foreground">
              Items below minimum quantity
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <PackageX className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{outOfStockItems}</div>
            <p className="text-xs text-muted-foreground">
              Items with zero quantity
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs and Filters */}
      <Tabs defaultValue="all-items" className="space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <TabsList>
            <TabsTrigger value="all-items" className="flex items-center gap-1">
              <Package className="h-4 w-4" />
              <span>All Items</span>
            </TabsTrigger>
            <TabsTrigger value="low-stock" className="flex items-center gap-1">
              <AlertTriangle className="h-4 w-4" />
              <span>Low Stock</span>
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center gap-1">
              <Tag className="h-4 w-4" />
              <span>Categories</span>
            </TabsTrigger>
          </TabsList>

          <div className="flex flex-col sm:flex-row w-full md:w-auto gap-2">
            <div className="relative w-full md:w-[300px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search inventory..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="in-stock">In Stock</SelectItem>
                <SelectItem value="low-stock">Low Stock</SelectItem>
                <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                <SelectItem value="discontinued">Discontinued</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="all-items" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle>Inventory Items</CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("all");
                      setSelectedStatus("all");
                      setSelectedSupplier("all");
                      setSortConfig(null);
                    }}
                  >
                    <RefreshCcw className="h-3.5 w-3.5 mr-1.5" />
                    Reset Filters
                  </Button>
                </div>
              </div>
              <CardDescription>
                Showing {filteredInventory.length} of {inventory.length} items
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[300px]">
                        <Button
                          variant="ghost"
                          className="p-0 h-8 font-medium"
                          onClick={() => handleSort("name")}
                        >
                          Product
                          <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          className="p-0 h-8 font-medium"
                          onClick={() => handleSort("sku")}
                        >
                          SKU
                          <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          className="p-0 h-8 font-medium"
                          onClick={() => handleSort("category")}
                        >
                          Category
                          <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
                        </Button>
                      </TableHead>
                      <TableHead className="text-right">
                        <Button
                          variant="ghost"
                          className="p-0 h-8 font-medium"
                          onClick={() => handleSort("quantity")}
                        >
                          Quantity
                          <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
                        </Button>
                      </TableHead>
                      <TableHead className="text-right">
                        <Button
                          variant="ghost"
                          className="p-0 h-8 font-medium"
                          onClick={() => handleSort("price")}
                        >
                          Price
                          <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
                        </Button>
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isDataLoading ? (
                      Array.from({ length: 10 }).map((_, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            <div className="h-5 w-40 bg-muted animate-pulse rounded"></div>
                          </TableCell>
                          <TableCell>
                            <div className="h-5 w-20 bg-muted animate-pulse rounded"></div>
                          </TableCell>
                          <TableCell>
                            <div className="h-5 w-24 bg-muted animate-pulse rounded"></div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="h-5 w-12 bg-muted animate-pulse rounded ml-auto"></div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="h-5 w-16 bg-muted animate-pulse rounded ml-auto"></div>
                          </TableCell>
                          <TableCell>
                            <div className="h-5 w-20 bg-muted animate-pulse rounded"></div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="h-8 w-20 bg-muted animate-pulse rounded ml-auto"></div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : filteredInventory.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          <div className="flex flex-col items-center justify-center text-muted-foreground">
                            <PackageX className="h-8 w-8 mb-2" />
                            <p>No items found</p>
                            <p className="text-sm">
                              Try adjusting your search or filters
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredInventory.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">
                            {item.name}
                          </TableCell>
                          <TableCell>{item.sku}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <div
                                className={`w-2 h-2 rounded-full ${getCategoryColor(item.category)}`}
                              ></div>
                              {item.category}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex flex-col items-end">
                              <span>{item.quantity}</span>
                              {item.quantity <= item.minQuantity && (
                                <span className="text-xs text-muted-foreground">
                                  Min: {item.minQuantity}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(item.price)}
                          </TableCell>
                          <TableCell>{getStatusBadge(item.status)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setSelectedItem(item);
                                  setIsEditDialogOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Delete Item
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete{" "}
                                      {item.name}? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteItem(item.id)}
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
            <CardFooter className="flex justify-between py-4">
              <div className="text-sm text-muted-foreground">
                Showing{" "}
                <span className="font-medium">{filteredInventory.length}</span>{" "}
                of <span className="font-medium">{inventory.length}</span> items
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled>
                  Next
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="low-stock" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Low Stock Items</CardTitle>
              <CardDescription>
                Items that need to be restocked soon
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {inventory
                    .filter(
                      (item) =>
                        item.status === "low-stock" ||
                        item.status === "out-of-stock"
                    )
                    .map((item) => (
                      <Card key={item.id} className="overflow-hidden">
                        <CardHeader className="p-4 pb-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-base">
                                {item.name}
                              </CardTitle>
                              <CardDescription className="text-xs">
                                {item.sku}
                              </CardDescription>
                            </div>
                            {getStatusBadge(item.status)}
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-2 pb-3">
                          <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">
                                Current Stock:
                              </span>
                              <span className="font-medium">
                                {item.quantity}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">
                                Min Quantity:
                              </span>
                              <span className="font-medium">
                                {item.minQuantity}
                              </span>
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">
                                  Stock Level:
                                </span>
                                <span className="font-medium">
                                  {Math.round(
                                    (item.quantity / item.minQuantity) * 100
                                  )}
                                  %
                                </span>
                              </div>
                              <Progress
                                value={(item.quantity / item.minQuantity) * 100}
                                className={cn(
                                  item.status === "out-of-stock"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-amber-100 text-amber-700"
                                )}
                              />
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="p-4 pt-0 flex justify-between border-t">
                          <div className="text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 inline mr-1" />
                            Updated {formatDate(item.lastUpdated)}
                          </div>
                          <Button size="sm" className="h-8">
                            <PackagePlus className="h-3.5 w-3.5 mr-1.5" />
                            Restock
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Categories</CardTitle>
                <CardDescription>Inventory items by category</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px] pr-4">
                  <div className="space-y-4">
                    {categories.map((category) => (
                      <div
                        key={category.id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-3 h-3 rounded-full ${category.color}`}
                          ></div>
                          <span className="font-medium">{category.name}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-muted-foreground">
                            {category.count} items
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8"
                            onClick={() => setSelectedCategory(category.name)}
                          >
                            <Filter className="h-3.5 w-3.5 mr-1.5" />
                            Filter
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Suppliers</CardTitle>
                <CardDescription>Inventory items by supplier</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px] pr-4">
                  <div className="space-y-4">
                    {suppliers.map((supplier) => (
                      <div
                        key={supplier.id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{supplier.name}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-muted-foreground">
                            {supplier.count} items
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8"
                            onClick={() => setSelectedSupplier(supplier.name)}
                          >
                            <Filter className="h-3.5 w-3.5 mr-1.5" />
                            Filter
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Item Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Edit Inventory Item</DialogTitle>
            <DialogDescription>
              Update the details for {selectedItem?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <form action={handleEditItem} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Product Name</Label>
                  <Input
                    id="edit-name"
                    name="name"
                    defaultValue={selectedItem.name}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-sku">SKU</Label>
                  <Input
                    id="edit-sku"
                    name="sku"
                    defaultValue={selectedItem.sku}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-category">Category</Label>
                  <Select name="category" defaultValue={selectedItem.category}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-supplier">Supplier</Label>
                  <Select name="supplier" defaultValue={selectedItem.supplier}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.name}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-quantity">Quantity</Label>
                  <Input
                    id="edit-quantity"
                    name="quantity"
                    type="number"
                    min="0"
                    defaultValue={selectedItem.quantity}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-minQuantity">Min Quantity</Label>
                  <Input
                    id="edit-minQuantity"
                    name="minQuantity"
                    type="number"
                    min="0"
                    defaultValue={selectedItem.minQuantity}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-price">Price ($)</Label>
                  <Input
                    id="edit-price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    defaultValue={selectedItem.price}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-cost">Cost ($)</Label>
                  <Input
                    id="edit-cost"
                    name="cost"
                    type="number"
                    min="0"
                    step="0.01"
                    defaultValue={selectedItem.cost}
                    required
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="edit-location">Storage Location</Label>
                  <Input
                    id="edit-location"
                    name="location"
                    defaultValue={selectedItem.location}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setSelectedItem(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
