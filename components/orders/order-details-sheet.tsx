/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import {
//   User,
  CreditCard,
  MapPin,
//   FileText,
  CheckCircle2,
  XCircle,
  TruckIcon,
  Package,
  Clock,
  Printer,
  Send,
  AlertTriangle,
  CircleCheck,
  CircleX,
  CircleDashed,
  CircleEllipsis,
  CircleAlert,
//   Receipt,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { OrderStatus } from "@prisma/client";
import { useOrders } from "@/context/order-provider";

interface OrderDetailsSheetProps {
  order: any;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
  getStatusBadge: (status: string) => React.ReactNode;
  getPaymentStatusBadge: (status: string) => React.ReactNode;
  formatDate: (date: Date) => string;
  formatCurrency: (amount: number) => string;
  getInitials: (name: string) => string;
}

export function OrderDetailsSheet({
  order,
  isOpen,
  onOpenChange,
  onUpdateStatus,
  getStatusBadge,
  getPaymentStatusBadge,
  formatDate,
  formatCurrency,
  getInitials,
}: OrderDetailsSheetProps) {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [isUpdatingTracking, setIsUpdatingTracking] = useState(false);
  const { updateStatus, updateTrackingNumber } = useOrders();

  if (!order) return null;

  const handleUpdateTracking = async () => {
    if (!trackingNumber.trim()) {
      toast.error("Please enter a tracking number");
      return;
    }

    setIsUpdatingTracking(true);
    try {
      const result = await updateTrackingNumber(order.id, trackingNumber);
      if (result.success) {
        toast.success("Tracking number updated successfully");
      } else {
        toast.error("Failed to update tracking number");
      }
    } catch (error) {
      toast.error("An error occurred while updating tracking number");
      console.error(error);
    } finally {
      setIsUpdatingTracking(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <CircleDashed className="h-5 w-5 text-amber-500" />;
      case "processing":
        return <CircleEllipsis className="h-5 w-5 text-blue-500" />;
      case "shipped":
        return <TruckIcon className="h-5 w-5 text-purple-500" />;
      case "delivered":
        return <CircleCheck className="h-5 w-5 text-green-500" />;
      case "cancelled":
        return <CircleX className="h-5 w-5 text-red-500" />;
      case "refunded":
        return <CircleAlert className="h-5 w-5 text-gray-500" />;
      default:
        return <CircleDashed className="h-5 w-5 text-gray-500" />;
    }
  };

  const handleStatusUpdate = async (status: OrderStatus) => {
    try {
      await onUpdateStatus(order.id, status);
    } catch (error) {
      toast.error("An error occurred while updating order status");
      console.error(error);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl">
        <SheetHeader className="space-y-1">
          <SheetTitle className="text-xl flex items-center gap-2">
            Order {order.orderNumber}
            {getStatusBadge(order.status)}
          </SheetTitle>
          <SheetDescription>
            {formatDate(order.orderDate)}
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="details" className="mt-6">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="customer">Customer</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium">Order Items</h3>
              <Badge variant="outline">
                {order.items.length} {order.items.length === 1 ? "item" : "items"}
              </Badge>
            </div>

            <ScrollArea className="h-[200px] rounded-md border p-4">
              <div className="space-y-4">
                {order.items.map((item:any) => (
                  <div key={item.id} className="flex justify-between">
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.quantity} x {formatCurrency(item.price)}
                      </div>
                      {item.options && item.options.length > 0 && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Options: {item.options.join(", ")}
                        </div>
                      )}
                    </div>
                    <div className="font-medium">
                      {formatCurrency(item.total)}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax</span>
                <span>{formatCurrency(order.tax)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Shipping</span>
                <span>{formatCurrency(order.shipping)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Discount</span>
                  <span className="text-green-600">
                    -{formatCurrency(order.discount)}
                  </span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Payment Information</h3>
                <div className="flex items-center gap-2 text-sm">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span>{order.paymentMethod || order.paymentType}</span>
                  <div className="ml-auto">
                    {getPaymentStatusBadge(order.paymentStatus || order.paymentType)}
                  </div>
                </div>
              </div>

              {order.shippingAddress && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Shipping Address</h3>
                  <div className="text-sm space-y-1">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p>{order.shippingAddress.line1}</p>
                        {order.shippingAddress.line2 && (
                          <p>{order.shippingAddress.line2}</p>
                        )}
                        <p>
                          {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                          {order.shippingAddress.postalCode}
                        </p>
                        <p>{order.shippingAddress.country}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {order.status === "READY_FOR_PICKUP" && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Tracking Information</h3>
                  {order.trackingNumber ? (
                    <div className="flex items-center gap-2 text-sm">
                      <TruckIcon className="h-4 w-4 text-muted-foreground" />
                      <span>Tracking: {order.trackingNumber}</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="Enter tracking number"
                          value={trackingNumber}
                          onChange={(e) => setTrackingNumber(e.target.value)}
                        />
                        <Button
                          size="sm"
                          onClick={handleUpdateTracking}
                          disabled={isUpdatingTracking}
                        >
                          {isUpdatingTracking ? "Saving..." : "Save"}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {order.notes && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Notes</h3>
                  <div className="text-sm bg-muted p-3 rounded-md">
                    {order.notes}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="customer" className="space-y-4">
            {order.customer && (
              <>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    {order.customer.avatar ? (
                      <AvatarImage
                        src={order.customer.avatar}
                        alt={order.customer.name}
                      />
                    ) : null}
                    <AvatarFallback className="text-lg">
                      {getInitials(order.customer.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-medium">{order.customer.name}</h3>
                    <div className="text-sm text-muted-foreground">
                      Customer ID: {order.customer.id}
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm">Email</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="text-sm">{order.customer.email}</div>
                      <Button variant="ghost" size="icon" className="h-6 w-6 ml-auto">
                        <Send className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {order.customer.phone && (
                    <div>
                      <Label className="text-sm">Phone</Label>
                      <div className="text-sm mt-1">{order.customer.phone}</div>
                    </div>
                  )}

                  {order.billingAddress && (
                    <div>
                      <Label className="text-sm">Billing Address</Label>
                      <div className="text-sm mt-1 space-y-1">
                        <p>{order.billingAddress.line1}</p>
                        {order.billingAddress.line2 && (
                          <p>{order.billingAddress.line2}</p>
                        )}
                        <p>
                          {order.billingAddress.city}, {order.billingAddress.state}{" "}
                          {order.billingAddress.postalCode}
                        </p>
                        <p>{order.billingAddress.country}</p>
                      </div>
                    </div>
                  )}

                  <div>
                    <Label className="text-sm">Order History</Label>
                    <div className="text-sm mt-1">
                      <Button variant="link" className="h-auto p-0">
                        View all orders from this customer
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="timeline" className="space-y-4">
            <div className="space-y-4">
              {order.timeline && order.timeline.length > 0 ? (
                order.timeline.map((event:any, index: number) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      {getStatusIcon(event.status)}
                      {index < order.timeline.length - 1 && (
                        <div className="w-px h-full bg-border mt-1" />
                      )}
                    </div>
                    <div className="space-y-1 pb-4">
                      <div className="font-medium">{event.status.replace(/_/g, " ")}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(event.timestamp)}
                      </div>
                      {event.note && (
                        <div className="text-sm bg-muted p-2 rounded-md mt-1">
                          {event.note}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No timeline events available
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <SheetFooter className="flex-row justify-between gap-2 mt-6">
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Printer className="h-3.5 w-3.5 mr-1.5" />
              Print
            </Button>
            <Button variant="outline" size="sm">
              <Send className="h-3.5 w-3.5 mr-1.5" />
              Email
            </Button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>Update Status</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Change Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {order.status !== "PENDING" && (
                <DropdownMenuItem
                  onClick={() => handleStatusUpdate("PENDING")}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Mark as Pending
                </DropdownMenuItem>
              )}
              {order.status !== "IN_PROGRESS" && (
                <DropdownMenuItem
                  onClick={() => handleStatusUpdate("IN_PROGRESS")}
                >
                  <Package className="h-4 w-4 mr-2" />
                  Mark as Processing
                </DropdownMenuItem>
              )}
              {order.status !== "READY_FOR_PICKUP" && (
                <DropdownMenuItem
                  onClick={() => handleStatusUpdate("READY_FOR_PICKUP")}
                >
                  <TruckIcon className="h-4 w-4 mr-2" />
                  Mark as Ready for Pickup
                </DropdownMenuItem>
              )}
              {order.status !== "DELIVERED" && (
                <DropdownMenuItem
                  onClick={() => handleStatusUpdate("DELIVERED")}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Mark as Delivered
                </DropdownMenuItem>
              )}
              {order.status !== "CANCELLED" && (
                <DropdownMenuItem
                  onClick={() => handleStatusUpdate("CANCELLED")}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Mark as Cancelled
                </DropdownMenuItem>
              )}
              {order.status !== "REFUNDED" && (
                <DropdownMenuItem
                  onClick={() => handleStatusUpdate("REFUNDED")}
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Mark as Refunded
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}