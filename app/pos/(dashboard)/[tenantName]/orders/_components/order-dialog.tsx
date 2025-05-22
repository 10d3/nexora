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
  tableId: z.string().optional(),
  reservationId: z.string().optional(),
  roomId: z.string().optional(),
  bookingId: z.string().optional(),
  appointmentId: z.string().optional(),
  specialInstructions: z.string().optional(),
  status: z.nativeEnum(OrderStatus),
  paymentType: z.nativeEnum(PaymentType),
  orderType: z.nativeEnum(OrderType),
  items: z
    .array(
      z.object({
        id: z.string(),
        productId: z.string(),
        name: z.string(),
        quantity: z.number().min(1),
        price: z.number().min(0),
        total: z.number().min(0),
      })
    )
    .min(1, "At least one item is required"),
});

type FormData = z.infer<typeof formSchema>;

type Reservation = {
  id: string;
  customerName: string;
  reservationTime: Date;
  status: string;
  tableId?: string;
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
    name: string;
    sku: string;
    quantity: number;
    price: number;
    total: number;
    options?: string[];
  }[];
  total: number;
  tax: number;
  shipping: number;
  discount: number;
  orderDate: Date;
  status: OrderStatus;
  paymentType: PaymentType;
  notes?: string;
  tableId?: string;
  reservationId?: string;
  roomId?: string;
  bookingId?: string;
  appointmentId?: string;
  orderType?: OrderType;
}

export function OrderDialog({ open, onOpenChange, mode }: OrderDialogProps) {
  const { selectedOrder } = useOrders();
  const { createNewOrder, updateStatus, isPending } = useOrderMutation();
  const { customers } = useCustomer();
  const { menuItems } = useMenu();
  const { reservations } = useReservation();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: crypto.randomUUID(),
      businessType: BusinessType.RESTAURANT,
      customerId: "",
      tableId: "",
      reservationId: "",
      roomId: "",
      bookingId: "",
      appointmentId: "",
      specialInstructions: "",
      status: OrderStatus.PENDING,
      paymentType: PaymentType.CASH,
      orderType: OrderType.STANDARD,
      items: [],
    },
  });

  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);

  // Add debugging
  console.log("Form errors:", form.formState.errors);
  console.log("Form values:", form.getValues());
  console.log("Form isValid:", form.formState.isValid);

  // Reset form when dialog opens/closes or mode changes
  useEffect(() => {
    if (open && mode === "edit" && selectedOrder) {
      const extendedOrder = selectedOrder as unknown as ExtendedOrder;

      // Determine business type based on the presence of business-specific fields
      let businessType: BusinessType = BusinessType.RESTAURANT;
      if (extendedOrder.roomId || extendedOrder.bookingId) {
        businessType = BusinessType.HOTEL;
      } else if (extendedOrder.appointmentId) {
        businessType = BusinessType.SALON;
      }

      form.reset({
        id: extendedOrder.id,
        businessType,
        customerId: extendedOrder.customer.id,
        tableId: extendedOrder.tableId || "",
        reservationId: extendedOrder.reservationId || "",
        roomId: extendedOrder.roomId || "",
        bookingId: extendedOrder.bookingId || "",
        appointmentId: extendedOrder.appointmentId || "",
        specialInstructions: extendedOrder.notes || "",
        status: extendedOrder.status,
        paymentType: extendedOrder.paymentType,
        orderType: extendedOrder.orderType || OrderType.STANDARD,
        items: extendedOrder.items.map((item) => ({
          id: item.id,
          productId: item.productId,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          total: item.total,
        })),
      });
    } else {
      form.reset({
        id: crypto.randomUUID(),
        businessType: BusinessType.RESTAURANT,
        customerId: "",
        tableId: "",
        reservationId: "",
        roomId: "",
        bookingId: "",
        appointmentId: "",
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

    const product = menuItems.find((item) => item.id === selectedProduct);
    if (!product) return;

    const newItem = {
      id: `temp-${Date.now()}`,
      productId: product.id,
      name: product.name,
      quantity: quantity,
      price: product.price,
      total: product.price * quantity,
    };

    const currentItems = form.getValues("items");
    form.setValue("items", [...currentItems, newItem]);

    // Trigger validation for items field
    form.trigger("items");

    // Reset selection
    setSelectedProduct("");
    setQuantity(1);
  };

  const handleRemoveItem = (itemId: string) => {
    const currentItems = form.getValues("items");
    form.setValue(
      "items",
      currentItems.filter((item) => item.id !== itemId)
    );
    // Trigger validation for items field
    form.trigger("items");
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
      if (data.roomId || data.bookingId) {
        businessType = BusinessType.HOTEL;
      } else if (data.appointmentId) {
        businessType = BusinessType.SALON;
      }

      const orderData = {
        id: mode === "edit" ? data.id : undefined,
        customerId: data.customerId,
        businessType,
        items: data.items.map((item) => ({
          productId: item.productId,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          total: item.total,
        })),
        subtotal,
        tax,
        shipping: 0,
        discount: 0,
        total,
        status: data.status,
        paymentType: data.paymentType,
        orderType: data.orderType,
        notes: data.specialInstructions || "",

        // Business specific fields
        tableId: data.tableId || undefined,
        reservationId: data.reservationId || undefined,
        roomId: data.roomId || undefined,
        bookingId: data.bookingId || undefined,
        appointmentId: data.appointmentId || undefined,
      };

      console.log("Sending order data:", orderData);

      if (mode === "create") {
        console.log("Creating new order...");
        const result = await createNewOrder(orderData);
        console.log("Create order result:", result);

        if (result.success) {
          onOpenChange(false);
          toast.success("Success", {
            description: "Order created successfully",
          });
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
            description: result.error || "Failed to update order",
          });
        }
      }
    } catch (error) {
      console.error("Error saving order:", error);
      toast.error("Error", {
        description: "An unexpected error occurred.",
      });
    }
  };

  // Add a test submit handler to debug
  //   const handleTestSubmit = (e: React.FormEvent) => {
  //     console.log("🔍 Form submit event triggered");
  //     console.log("Form state:", {
  //       isValid: form.formState.isValid,
  //       errors: form.formState.errors,
  //       values: form.getValues(),
  //     });
  //   };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create Order" : "Edit Order"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={(e) => {
              //   handleTestSubmit(e);
              form.handleSubmit(onSubmit)(e);
            }}
            className="space-y-6"
          >
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
                            // Set the table ID from the selected reservation
                            const selectedReservation = reservations?.find(
                              (res: Reservation) => res.id === value
                            );
                            if (selectedReservation?.tableId) {
                              form.setValue(
                                "tableId",
                                selectedReservation.tableId
                              );
                            }
                          }}
                          value={field.value}
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
                  <>
                    <FormField
                      control={form.control}
                      name="roomId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Room</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select room" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {/* Add your rooms data here */}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bookingId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Booking</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
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
                  </>
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
                          onValueChange={field.onChange}
                          value={field.value}
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
                    <SelectValue placeholder="Select menu item" />
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
                {form.watch("items").map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2 border rounded-md"
                  >
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.quantity} x ${item.price} = ${item.total}
                      </p>
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
                ))}
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
              <Button type="submit" disabled={isPending}>
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
  );
}
