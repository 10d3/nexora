/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Edit,
  Loader2,
  Trash,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  Clock,
  Award,
  Tag,
  FileText,
} from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import { useCustomerMutation } from "@/hooks/use-customer-mutations";
import { useDashboard } from "@/context/dashboard-provider";
import { toast } from "sonner";
import { getCustomerById } from "@/lib/actions/customer.actions";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { tenantId } = useDashboard();
  const { deleteCustomer } = useCustomerMutation(tenantId as string);

  const [customer, setCustomer] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const customerId = params.customerId as string;

  useEffect(() => {
    async function loadCustomer() {
      try {
        setLoading(true);
        const result = await getCustomerById(tenantId as string, customerId);
        if (result.success) {
          setCustomer(result.data);
        } else {
          setError(result.error || "Failed to load customer");
          toast.error("Error loading customer", {
            description: result.error || "Failed to load customer details",
          });
        }
      } catch (err) {
        console.error("Error loading customer:", err);
        setError("An unexpected error occurred");
        toast.error("Error", {
          description:
            "An unexpected error occurred while loading customer data",
        });
      } finally {
        setLoading(false);
      }
    }

    if (tenantId && customerId) {
      loadCustomer();
    }
  }, [tenantId, customerId]);

  const handleDelete = () => {
    toast.promise(
      async () => {
        await deleteCustomer(customerId);
        router.push(`/pos/${tenantId}/customers`);
      },
      {
        loading: "Deleting customer...",
        success: "Customer successfully deleted",
        error: "Failed to delete customer",
      }
    );
    setIsDeleteDialogOpen(false);
  };

  const handleBack = () => {
    router.push(`/pos/${tenantId}/customers`);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-6">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading customer details...</p>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="p-6 space-y-4">
        <Button
          variant="outline"
          onClick={handleBack}
          className="group transition-all"
        >
          <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Customers
        </Button>
        <Card className="border-destructive/50">
          <CardContent className="p-6 text-center">
            <div className="flex flex-col items-center justify-center py-8">
              <div className="rounded-full bg-destructive/10 p-3 mb-4">
                <Loader2 className="h-8 w-8 text-destructive" />
              </div>
              <h3 className="text-lg font-medium text-destructive mb-2">
                Customer Data Error
              </h3>
              <p className="text-muted-foreground max-w-md">
                {error ||
                  "Customer not found. The customer may have been deleted or you don't have permission to view it."}
              </p>
              <Button variant="outline" onClick={handleBack} className="mt-6">
                Return to Customers List
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Button
          variant="outline"
          onClick={handleBack}
          className="group transition-all"
        >
          <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Customers
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsEditDialogOpen(true)}
            className="hover:bg-secondary"
          >
            <Edit className="mr-2 h-4 w-4" /> Edit
          </Button>
          <Button
            variant="destructive"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash className="mr-2 h-4 w-4" /> Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                  {getInitials(customer.firstName, customer.lastName)}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-2xl">
                {customer.firstName} {customer.lastName}
              </CardTitle>
              {customer.email && (
                <CardDescription className="flex items-center justify-center mt-2">
                  <Mail className="h-4 w-4 mr-1" />
                  {customer.email}
                </CardDescription>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                {customer.phone && (
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-3 text-muted-foreground" />
                    <span>{customer.phone}</span>
                  </div>
                )}
                {customer.address && (
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-3 text-muted-foreground" />
                    <span>{customer.address}</span>
                  </div>
                )}
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-3 text-muted-foreground" />
                  <span>
                    Customer since{" "}
                    {formatDate(new Date(customer.customerSince))}
                  </span>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Customer Metrics
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-muted/50">
                    <CardContent className="p-3">
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">
                          Total Spent
                        </span>
                        <div className="flex items-center">
                          <CreditCard className="h-3 w-3 mr-1 text-primary" />
                          <span className="font-medium">
                            {formatCurrency(customer.totalSpent || 0)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-muted/50">
                    <CardContent className="p-3">
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">
                          Loyalty
                        </span>
                        <div className="flex items-center">
                          <Award className="h-3 w-3 mr-1 text-primary" />
                          <span className="font-medium">
                            {customer.loyaltyPoints || 0} pts
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                {customer.lastVisit && (
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>
                      Last visit: {formatDate(new Date(customer.lastVisit))}
                    </span>
                  </div>
                )}
              </div>

              {customer.tags && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
                      <h3 className="text-sm font-medium">Tags</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {customer.tags
                        .split(",")
                        .map((tag: string, index: number) => (
                          <Badge key={index} variant="secondary">
                            {tag.trim()}
                          </Badge>
                        ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Customer Details</CardTitle>
            <CardDescription>
              View and manage customer information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="notes">Notes & History</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">
                        Contact Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <dl className="space-y-2">
                        <div className="flex justify-between">
                          <dt className="text-sm text-muted-foreground">
                            Email:
                          </dt>
                          <dd className="text-sm font-medium">
                            {customer.email || "Not provided"}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-muted-foreground">
                            Phone:
                          </dt>
                          <dd className="text-sm font-medium">
                            {customer.phone || "Not provided"}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-muted-foreground">
                            Address:
                          </dt>
                          <dd className="text-sm font-medium">
                            {customer.address || "Not provided"}
                          </dd>
                        </div>
                      </dl>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">
                        Purchase History
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <dl className="space-y-2">
                        <div className="flex justify-between">
                          <dt className="text-sm text-muted-foreground">
                            Total Spent:
                          </dt>
                          <dd className="text-sm font-medium">
                            {formatCurrency(customer.totalSpent || 0)}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-muted-foreground">
                            Last Visit:
                          </dt>
                          <dd className="text-sm font-medium">
                            {customer.lastVisit
                              ? formatDate(new Date(customer.lastVisit))
                              : "Never"}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-muted-foreground">
                            Loyalty Points:
                          </dt>
                          <dd className="text-sm font-medium">
                            {customer.loyaltyPoints || 0} points
                          </dd>
                        </div>
                      </dl>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      Recent Transactions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border">
                      <div className="p-4 text-center text-muted-foreground">
                        No recent transactions found
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notes" className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-base">
                        Customer Notes
                      </CardTitle>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4 mr-2" /> Add Note
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[200px] rounded-md border p-4">
                      {customer.notes ? (
                        <div className="space-y-4">
                          <div className="rounded-lg bg-muted p-3">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="text-sm font-medium">
                                Staff Note
                              </h4>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(new Date(customer.customerSince))}
                              </span>
                            </div>
                            <p className="text-sm">{customer.notes}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                          <FileText className="h-4 w-4 mr-2" />
                          <span>No notes available</span>
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      Activity History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Calendar className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm">Customer created</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(new Date(customer.customerSince))}
                          </p>
                        </div>
                      </div>

                      {customer.lastVisit && (
                        <div className="flex items-center gap-4">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <CreditCard className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm">Last purchase</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(new Date(customer.lastVisit))}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              customer{" "}
              <span className="font-medium">
                {customer.firstName} {customer.lastName}
              </span>{" "}
              and all associated data from your database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Customer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Dialog - Placeholder for future implementation */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
            <DialogDescription>
              Update customer information and preferences
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <div className="flex items-center justify-center h-32 rounded-md border border-dashed">
              <p className="text-muted-foreground text-center">
                Edit functionality will be implemented in a future update.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
