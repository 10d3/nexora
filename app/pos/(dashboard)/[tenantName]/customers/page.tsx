/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  // DialogTrigger,
  DialogFooter,
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
} from "@/components/ui/alert-dialog";
import {
  MoreHorizontal,
  Search,
  Edit,
  Trash,
  UserPlus,
  Loader2,
  ArrowUpDown,
} from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import { useCustomer } from "@/context/customer-provider";
import { useCustomerMutation } from "@/hooks/use-customer-mutations";
import { useDashboard } from "@/context/dashboard-provider";
// import { toast } from "sonner";
import { Pagination } from "@/components/ui/pagination";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
// import { format } from "date-fns";

// Define form schema for customer form
const customerFormSchema = z.object({
  id: z.string().optional(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address").optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

type CustomerFormValues = z.infer<typeof customerFormSchema>;

export default function CustomersPage() {
  const router = useRouter();
  const { tenantId } = useDashboard();
  const {
    customers,
    loading,
    error,
    search,
    setSearch,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    totalCustomers,
    limit,
    // setLimit,
    offset,
    setOffset,
    // setSelectedCustomer,
  } = useCustomer();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<string | null>(null);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any | null>(null);

  const { createCustomer, updateCustomer, deleteCustomer, isPending } =
    useCustomerMutation(tenantId as string);

  // Calculate pagination values
  const totalPages = Math.ceil(totalCustomers / limit);
  const currentPage = Math.floor(offset / limit) + 1;

  // Handle page change
  const handlePageChange = (page: number) => {
    setOffset((page - 1) * limit);
  };

  // Handle sort change
  const handleSortChange = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  // Handle delete customer
  const handleDeleteClick = (customerId: string) => {
    setCustomerToDelete(customerId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (customerToDelete) {
      deleteCustomer(customerToDelete);
      setIsDeleteDialogOpen(false);
      setCustomerToDelete(null);
    }
  };

  // Handle edit customer
  const handleEditClick = (customer: any) => {
    setEditingCustomer(customer);
    setIsFormDialogOpen(true);
  };

  // Handle view customer details
  const handleViewDetails = (customerId: string) => {
    router.push(`customers/${customerId}`);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Customers</h1>
        <Button
          className="flex items-center gap-2"
          onClick={() => {
            setEditingCustomer(null);
            setIsFormDialogOpen(true);
          }}
        >
          <UserPlus size={16} />
          <span>Add Customer</span>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Management</CardTitle>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-destructive">
              Error loading customers: {error}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      onClick={() => handleSortChange("lastName")}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center">
                        Name
                        {sortBy === "lastName" && (
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead
                      onClick={() => handleSortChange("totalSpent")}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center">
                        Total Spent
                        {sortBy === "totalSpent" && (
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead
                      onClick={() => handleSortChange("lastVisit")}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center">
                        Last Visit
                        {sortBy === "lastVisit" && (
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead>Loyalty Points</TableHead>
                    <TableHead
                      onClick={() => handleSortChange("customerSince")}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center">
                        Customer Since
                        {sortBy === "customerSince" && (
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        No customers found
                      </TableCell>
                    </TableRow>
                  ) : (
                    customers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell>
                          <div className="font-medium">
                            {customer.firstName} {customer.lastName}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>{customer.email}</div>
                          <div className="text-sm text-muted-foreground">
                            {customer.phone}
                          </div>
                        </TableCell>
                        <TableCell>
                          {formatCurrency(customer.totalSpent || 0)}
                        </TableCell>
                        <TableCell>
                          {customer.lastVisit
                            ? formatDate(new Date(customer.lastVisit))
                            : "N/A"}
                        </TableCell>
                        <TableCell>{customer.loyaltyPoints || 0}</TableCell>
                        <TableCell>
                          {formatDate(new Date(customer.customerSince))}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleViewDetails(customer.id)}
                              >
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleEditClick(customer)}
                              >
                                <Edit className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDeleteClick(customer.id)}
                              >
                                <Trash className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="flex justify-center mt-4">
                  <Pagination>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(1)}
                      disabled={currentPage === 1}
                    >
                      First
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="mx-2 flex items-center">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(totalPages)}
                      disabled={currentPage === totalPages}
                    >
                      Last
                    </Button>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Customer Form Dialog */}
      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCustomer ? "Edit Customer" : "Add New Customer"}
            </DialogTitle>
          </DialogHeader>
          <CustomerForm
            customer={editingCustomer}
            onSubmit={(data) => {
              if (editingCustomer) {
                updateCustomer({ ...data, id: editingCustomer.id });
              } else {
                createCustomer(data);
              }
              setIsFormDialogOpen(false);
            }}
            onCancel={() => setIsFormDialogOpen(false)}
            isPending={isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              customer and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Customer form component for adding/editing customers
function CustomerForm({
  customer = null,
  onSubmit,
  onCancel,
  isPending = false,
}: {
  customer: any | null;
  onSubmit: (data: CustomerFormValues) => void;
  onCancel: () => void;
  isPending?: boolean;
}) {
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      notes: "",
    },
  });

  // Update form values when customer changes
  useEffect(() => {
    if (customer) {
      form.reset({
        firstName: customer.firstName || "",
        lastName: customer.lastName || "",
        email: customer.email || "",
        phone: customer.phone || "",
        address: customer.address || "",
        notes: customer.notes || "",
      });
    } else {
      form.reset({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        notes: "",
      });
    }
  }, [customer, form]);

  const handleSubmit = (data: CustomerFormValues) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Customer"
            )}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
