"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { useOrders } from "@/context/order-provider";
import { useCustomer } from "@/context/customer-provider";
import { useMenu } from "@/context/menu-provider";
import { useReservation } from "@/context/reservation-provider";
import { OrderStatus, PaymentType, OrderType } from "@prisma/client";
import { useOrderMutation } from "@/hooks/use-order-mutations";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const BusinessType = {
  RESTAURANT: "RESTAURANT",
  HOTEL: "HOTEL",
  SALON: "SALON",
  RETAIL: "RETAIL",
  PHARMACY: "PHARMACY",
  SUPERMARKET: "SUPERMARKET",
} as const;

type BusinessType = (typeof BusinessType)[keyof typeof BusinessType];

// Form schema
const formSchema = z.object({
  id: z.string(),
  businessType: z.enum([
    BusinessType.RESTAURANT,
    BusinessType.HOTEL,
    BusinessType.SALON,
    BusinessType.RETAIL,
    BusinessType.PHARMACY,
    BusinessType.SUPERMARKET,
  ]),
  customerId: z.string().min(1, "Customer is required"),
  specialInstructions: z.string().optional(),
  status: z.nativeEnum(OrderStatus),
  paymentType: z.nativeEnum(PaymentType),
  orderType: z.nativeEnum(OrderType),
  // Add business-specific fields at root level for form handling
  reservationId: z.string().optional(),
  bookingId: z.string().optional(),
  appointmentId: z.string().optional(),
  items: z
    .array(
      z.object({
        id: z.string().optional(),
        productId: z.string().optional(),
        menuId: z.string().optional(),
        name: z.string(),
        sku: z.string().optional(),
        quantity: z.number().int().positive(),
        price: z.number().positive(),
        total: z.number().positive(),
        notes: z.string().optional(),
        // Add business-specific fields to items
        reservationId: z.string().optional(),
        bookingId: z.string().optional(),
        appointmentId: z.string().optional(),
      })
    )
    .min(1, "At least one item is required")
    .refine(
      (items) => {
        // For restaurants, at least one item must have menuId
        const hasRestaurantItems = items.some((item) => item.menuId);
        // For other business types, at least one item must have productId
        const hasProductItems = items.some((item) => item.productId);
        return hasRestaurantItems || hasProductItems;
      },
      {
        message:
          "Items must be either menu items or products based on business type",
      }
    ),
});

type FormData = z.infer<typeof formSchema>;

type Reservation = {
  id: string;
  customerName: string;
  reservationTime: Date;
  status: string;
  resourceId?: string;
  resourceType?: string;
};

type OrderDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  refreshData?: () => Promise<void>;
};

type Customer = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
};

// Extended Order type to include business-specific fields
interface ExtendedOrder {
  id: string;
  orderNumber: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
  items: {
    id: string;
    productId: string;
    menuId: string;
    name: string;
    sku: string;
    quantity: number;
    price: number;
    total: number;
    options?: string[];
    notes?: string;
  }[];
  total: number;
  tax: number;
  shipping: number;
  discount: number;
  orderDate: Date;
  status: OrderStatus;
  paymentType: PaymentType;
  notes?: string;
  reservationId?: string;
  bookingId?: string;
  appointmentId?: string;
  orderType?: OrderType;
}

export function OrderDialog({ open, onOpenChange, mode }: OrderDialogProps) {
  const { selectedOrder } = useOrders();
  const { createNewOrder, updateStatus, isPending } =
    useOrderMutation();
  const { customers } = useCustomer();
  const { menuItems } = useMenu();
  const { reservations } = useReservation();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: crypto.randomUUID(),
      businessType: BusinessType.RESTAURANT,
      customerId: "",
      specialInstructions: "",
      status: OrderStatus.PENDING,
      paymentType: PaymentType.CASH,
      orderType: OrderType.STANDARD,
      items: [],
    },
  });

  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);

  // Reset form when dialog opens/closes or mode changes
  useEffect(() => {
    if (open && mode === "edit" && selectedOrder) {
      const extendedOrder = selectedOrder as unknown as ExtendedOrder;

      // Determine business type based on the presence of business-specific fields
      let businessType: BusinessType = BusinessType.RESTAURANT;
      if (extendedOrder.bookingId) {
        businessType = BusinessType.HOTEL;
      } else if (extendedOrder.appointmentId) {
        businessType = BusinessType.SALON;
      }

      form.reset({
        id: extendedOrder.id,
        businessType,
        customerId: extendedOrder.customer.id,
        specialInstructions: extendedOrder.notes || "",
        status: extendedOrder.status,
        paymentType: extendedOrder.paymentType,
        orderType: extendedOrder.orderType || OrderType.STANDARD,
        items: extendedOrder.items.map((item) => ({
          id: item.id,
          productId: item.productId,
          menuId: item.menuId,
          name: item.name,
          sku: item.sku || undefined,
          quantity: item.quantity,
          price: item.price,
          total: item.total,
          notes: item.notes || "",
          reservationId: extendedOrder.reservationId || "",
          bookingId: extendedOrder.bookingId || "",
          appointmentId: extendedOrder.appointmentId || "",
        })),
      });
    } else {
      form.reset({
        id: crypto.randomUUID(),
        businessType: BusinessType.RESTAURANT,
        customerId: "",
        specialInstructions: "",
        status: OrderStatus.PENDING,
        paymentType: PaymentType.CASH,
        orderType: OrderType.STANDARD,
        items: [],
      });
    }
  }, [open, mode, selectedOrder, form]);

  const handleAddItem = () => {
    if (!selectedProduct) return;

    const product = menuItems?.find((item) => item.id === selectedProduct);
    if (!product || !product.name) return;

    const businessType = form.getValues("businessType");
    const newItem = {
      id: `temp-${Date.now()}`,
      // For restaurants, use menuId instead of productId
      ...(businessType === BusinessType.RESTAURANT
        ? { menuId: product.id }
        : { productId: product.id }),
      name: product.name,
      sku: product.sku || undefined,
      quantity: quantity,
      price: product.price,
      total: product.price * quantity,
      notes: "",
      // Add business-specific fields based on business type
      ...(businessType === BusinessType.RESTAURANT && {
        reservationId: form.getValues("reservationId"),
      }),
      ...(businessType === BusinessType.HOTEL && {
        bookingId: form.getValues("bookingId"),
      }),
      ...(businessType === BusinessType.SALON && {
        appointmentId: form.getValues("appointmentId"),
      }),
    };

    const currentItems = form.getValues("items") || [];
    form.setValue("items", [...currentItems, newItem], {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });

    // Reset selection
    setSelectedProduct("");
    setQuantity(1);
  };

  const handleRemoveItem = (itemId: string | undefined) => {
    if (!itemId) return; // Skip if no ID provided

    const currentItems = form.getValues("items") || [];
    form.setValue(
      "items",
      currentItems.filter((item) => item.id !== itemId),
      {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      }
    );
  };

  const onSubmit = async (data: FormData) => {
    console.log("✅ Form submitted with data:", data);

    try {
      // Calculate totals
      const subtotal = data.items.reduce(
        (sum: number, item: { total: number }) => sum + item.total,
        0
      );
      const tax = subtotal * 0.1; // 10% tax rate
      const total = subtotal + tax;

      // Determine business type based on the presence of business-specific fields
      let businessType: BusinessType = BusinessType.RESTAURANT;
      if (data.items.some((item) => item.bookingId)) {
        businessType = BusinessType.HOTEL;
      } else if (data.items.some((item) => item.appointmentId)) {
        businessType = BusinessType.SALON;
      }

      const orderData = {
        id: mode === "edit" ? data.id : undefined,
        customerId: data.customerId,
        businessType,
        items: data.items.map((item) => {
          // Find the product/menu item to ensure we have the name
          const product = menuItems?.find((p) =>
            businessType === BusinessType.RESTAURANT
              ? p.id === item.menuId
              : p.id === item.productId
          );

          // If no product is found, use the item's own data
          return {
            // For restaurants, use menuId instead of productId
            ...(businessType === BusinessType.RESTAURANT
              ? { menuId: item.menuId }
              : { productId: item.productId }),
            name: product?.name || item.name || "Custom Item",
            sku: product?.sku || item.sku || undefined,
            quantity: item.quantity,
            price: item.price,
            total: item.total,
            notes: item.notes,
            // Add business-specific fields to each item
            reservationId: item.reservationId || undefined,
            bookingId: item.bookingId || undefined,
            appointmentId: item.appointmentId || undefined,
          };
        }),
        subtotal,
        tax,
        shipping: 0,
        discount: 0,
        total,
        status: data.status,
        paymentType: data.paymentType,
        orderType: data.orderType,
        notes: data.specialInstructions || "",
      };

      console.log("Sending order data:", orderData);

      if (mode === "create") {
        console.log("Creating new order...");
        const result = await createNewOrder(orderData);
        console.log("Create order result:", result);

        if (result.success) {
          onOpenChange(false);
          // Show the payment dialog
        } else {
          toast.error("Error", {
            description: result.error || "Failed to create order",
          });
        }
      } else {
        console.log("Updating order...");
        const result = await updateStatus(data.id, data.status);
        console.log("Update order result:", result);

        if (result.success) {
          onOpenChange(false);
          toast.success("Success", {
            description: "Order updated successfully",
          });
        } else {
          toast.error("Error", {
            description: result.success || "Failed to update order",
          });
        }
      }
    } catch (error) {
      console.error("Error saving order:", error);
      toast.error("Error", {
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred.",
      });
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {mode === "create" ? "Create Order" : "Edit Order"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="customerId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select customer" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {customers?.map((customer: Customer) => (
                              <SelectItem key={customer.id} value={customer.id}>
                                {customer.firstName} {customer.lastName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Restaurant specific fields */}
                  {form.watch("businessType") === BusinessType.RESTAURANT && (
                    <FormField
                      control={form.control}
                      name="reservationId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reservation</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              // Update all items with the selected reservation
                              const currentItems = form.getValues("items");
                              form.setValue(
                                "items",
                                currentItems.map((item) => ({
                                  ...item,
                                  reservationId: value,
                                }))
                              );
                            }}
                            value={field.value || ""}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select reservation" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {reservations
                                ?.filter(
                                  (reservation: Reservation) =>
                                    reservation.status === "CONFIRMED"
                                )
                                .map((reservation: Reservation) => (
                                  <SelectItem
                                    key={reservation.id}
                                    value={reservation.id}
                                  >
                                    {reservation.customerName} -{" "}
                                    {new Date(
                                      reservation.reservationTime
                                    ).toLocaleString()}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {/* Hotel specific fields */}
                  {form.watch("businessType") === BusinessType.HOTEL && (
                    <FormField
                      control={form.control}
                      name="bookingId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Booking</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              // Update all items with the selected booking
                              const currentItems = form.getValues("items");
                              form.setValue(
                                "items",
                                currentItems.map((item) => ({
                                  ...item,
                                  bookingId: value,
                                }))
                              );
                            }}
                            value={field.value || ""}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select booking" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {/* Add your bookings data here */}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {/* Salon specific fields */}
                  {form.watch("businessType") === BusinessType.SALON && (
                    <FormField
                      control={form.control}
                      name="appointmentId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Appointment</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              // Update all items with the selected appointment
                              const currentItems = form.getValues("items");
                              form.setValue(
                                "items",
                                currentItems.map((item) => ({
                                  ...item,
                                  appointmentId: value,
                                }))
                              );
                            }}
                            value={field.value || ""}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select appointment" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {/* Add your appointments data here */}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </div>

              {/* Order Items Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Order Items *</h3>
                <div className="flex gap-2">
                  <Select
                    value={selectedProduct}
                    onValueChange={setSelectedProduct}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue
                        placeholder={
                          form.watch("businessType") === BusinessType.RESTAURANT
                            ? "Select menu item"
                            : "Select product"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {menuItems?.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name} - ${item.price}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-20"
                  />
                  <Button
                    type="button"
                    onClick={handleAddItem}
                    disabled={!selectedProduct}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {form.watch("items")?.map((item) => {
                    const product = menuItems?.find((p) =>
                      form.watch("businessType") === BusinessType.RESTAURANT
                        ? p.id === item.menuId
                        : p.id === item.productId
                    );
                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2 border rounded-md"
                      >
                        <div>
                          <p className="font-medium">
                            {product?.name || item.name || "Custom Item"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {item.quantity} x ${item.price} = ${item.total}
                          </p>
                          {item.notes && (
                            <p className="text-sm text-muted-foreground">
                              {item.notes}
                            </p>
                          )}
                          {/* Show business-specific fields */}
                          {item.reservationId && (
                            <p className="text-sm text-muted-foreground">
                              Reservation: {item.reservationId}
                            </p>
                          )}
                          {item.bookingId && (
                            <p className="text-sm text-muted-foreground">
                              Booking: {item.bookingId}
                            </p>
                          )}
                          {item.appointmentId && (
                            <p className="text-sm text-muted-foreground">
                              Appointment: {item.appointmentId}
                            </p>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>

                {/* Show items validation error */}
                {form.formState.errors.items && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.items.message}
                  </p>
                )}
              </div>

              {/* Payment and Status Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Payment & Status</h3>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Order Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {[
                              "PENDING",
                              "PROCESSING",
                              "COMPLETED",
                              "CANCELLED",
                            ].map((status) => (
                              <SelectItem key={status} value={status}>
                                {status.replace(/_/g, " ")}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="paymentType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select payment type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {[
                              "CASH",
                              "CREDIT_CARD",
                              "DEBIT_CARD",
                              "MOBILE_PAYMENT",
                              "ONLINE_PAYMENT",
                            ].map((type) => (
                              <SelectItem key={type} value={type}>
                                {type.replace(/_/g, " ")}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Additional Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Additional Information</h3>
                <FormField
                  control={form.control}
                  name="specialInstructions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Special Instructions</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPending || !form.formState.isValid}
                >
                  {isPending
                    ? "Saving..."
                    : mode === "create"
                      ? "Create"
                      : "Update"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
