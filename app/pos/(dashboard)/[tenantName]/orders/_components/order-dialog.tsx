"use client";

import { useState, useEffect } from "react";
// import { useOrder } from "@/context/order-provider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon, Clock, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { useOrders } from "@/context/order-provider";
import { useCustomer } from "@/context/customer-provider";
import { useMenu } from "@/context/menu-provider";
import { useReservation } from "@/context/reservation-provider";
import { OrderStatus, PaymentType } from "@prisma/client";

// Import Order type from order provider
type Order = {
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
  shippingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  billingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  notes?: string;
  trackingNumber?: string;
  timeline?: {
    status: string;
    timestamp: Date;
    note?: string;
  }[];
};

// Add reservation type
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

type OrderItem = {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
};

type Customer = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
};

// Extended Order type that includes tableId
type ExtendedOrder = Order & {
  tableId?: string;
};

export function OrderDialog({
  open,
  onOpenChange,
  mode,
}: OrderDialogProps) {
  const { selectedOrder, createNewOrder, updateStatus, isPending } = useOrders();
  const { customers } = useCustomer();
  const { menuItems } = useMenu();
  const { reservations } = useReservation();
  
  const [formData, setFormData] = useState({
    id: "",
    customerId: "",
    orderDate: new Date(),
    orderTime: "12:00",
    reservationId: "",
    specialInstructions: "",
    status: "PENDING" as OrderStatus,
    paymentType: "CASH" as PaymentType,
    items: [] as OrderItem[],
  });

  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);

  // Reset form when dialog opens/closes or mode changes
  useEffect(() => {
    if (open && mode === "edit" && selectedOrder) {
      // Format the date and time for the form
      const orderDate = new Date(selectedOrder.orderDate);
      const orderHours = orderDate.getHours().toString().padStart(2, "0");
      const orderMinutes = orderDate.getMinutes().toString().padStart(2, "0");
      const orderTime = `${orderHours}:${orderMinutes}`;

      const extendedOrder = selectedOrder as ExtendedOrder;

      setFormData({
        id: selectedOrder.id,
        customerId: selectedOrder.customer.id,
        orderDate: orderDate,
        orderTime: orderTime,
        reservationId: extendedOrder.tableId || "",
        specialInstructions: selectedOrder.notes || "",
        status: selectedOrder.status,
        paymentType: selectedOrder.paymentType,
        items: selectedOrder.items,
      });
    } else {
      // Reset form for create mode
      setFormData({
        id: "",
        customerId: "",
        orderDate: new Date(),
        orderTime: "12:00",
        reservationId: "",
        specialInstructions: "",
        status: "PENDING" as OrderStatus,
        paymentType: "CASH" as PaymentType,
        items: [],
      });
    }
  }, [open, mode, selectedOrder]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddItem = () => {
    if (!selectedProduct) return;

    const product = menuItems.find((item) => item.id === selectedProduct);
    if (!product) return;

    const newItem: OrderItem = {
      id: `temp-${Date.now()}`,
      productId: product.id,
      name: product.name,
      quantity: quantity,
      price: product.price,
      total: product.price * quantity,
    };

    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));

    // Reset selection
    setSelectedProduct("");
    setQuantity(1);
  };

  const handleRemoveItem = (itemId: string) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== itemId),
    }));
  };

  // Filter confirmed reservations
  const confirmedReservations = reservations.filter(
    (reservation: Reservation) => reservation.status === "CONFIRMED"
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Combine date and time
      const orderDateTime = new Date(formData.orderDate);
      const [orderHours, orderMinutes] = formData.orderTime
        .split(":")
        .map(Number);
      orderDateTime.setHours(orderHours, orderMinutes, 0);

      // Get selected reservation
      const selectedReservation = confirmedReservations.find((r: Reservation) => r.id === formData.reservationId);
      if (!selectedReservation) {
        toast.error("Error", {
          description: "Please select a confirmed reservation",
        });
        return;
      }

      // Calculate totals
      const subtotal = formData.items.reduce((sum, item) => sum + item.total, 0);
      const tax = subtotal * 0.1; // 10% tax rate, adjust as needed
      const total = subtotal + tax;

      // Prepare data for API
      const orderData = {
        id: mode === "edit" ? formData.id : undefined,
        customerId: formData.customerId,
        reservationId: formData.reservationId,
        items: formData.items,
        subtotal,
        tax,
        shipping: 0,
        discount: 0,
        total,
        status: formData.status,
        paymentType: formData.paymentType,
        notes: formData.specialInstructions || "",
      };

      // Close the dialog immediately for better UX (optimistic update)
      onOpenChange(false);

      // Use the mutation functions
      if (mode === "create") {
        await createNewOrder(orderData);
      } else {
        await updateStatus(formData.id, formData.status);
      }
    } catch (error) {
      console.error("Error saving order:", error);
      toast.error("Error", {
        description: "An unexpected error occurred.",
      });
    }
  };

  const statusOptions = [
    "PENDING",
    "PROCESSING",
    "COMPLETED",
    "CANCELLED",
  ] as const;

  const paymentTypeOptions: PaymentType[] = [
    "CASH",
    "CREDIT_CARD",
    "DEBIT_CARD",
    "MOBILE_PAYMENT",
    "ONLINE_PAYMENT",
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create Order" : "Edit Order"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="customerId">Customer *</Label>
              <Select
                value={formData.customerId}
                onValueChange={(value) => handleSelectChange("customerId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer: Customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.firstName} {customer.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reservationId">Reservation *</Label>
              <Select
                value={formData.reservationId}
                onValueChange={(value) => handleSelectChange("reservationId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select reservation" />
                </SelectTrigger>
                <SelectContent>
                  {confirmedReservations.map((reservation: Reservation) => (
                    <SelectItem key={reservation.id} value={reservation.id}>
                      {reservation.customerName} - {new Date(reservation.reservationTime).toLocaleString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Order Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(formData.orderDate, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.orderDate}
                    onSelect={(date) =>
                      date &&
                      setFormData((prev) => ({ ...prev, orderDate: date }))
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="orderTime">Order Time *</Label>
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="orderTime"
                  name="orderTime"
                  type="time"
                  value={formData.orderTime}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label>Order Items</Label>
              <div className="flex gap-2">
                <Select
                  value={selectedProduct}
                  onValueChange={setSelectedProduct}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select menu item" />
                  </SelectTrigger>
                  <SelectContent>
                    {menuItems.map((item) => (
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

              <div className="space-y-2">
                {formData.items.map((item) => (
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Order Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleSelectChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.replace(/_/g, " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentType">Payment Type</Label>
                <Select
                  value={formData.paymentType}
                  onValueChange={(value) =>
                    handleSelectChange("paymentType", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment type" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentTypeOptions.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.replace(/_/g, " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialInstructions">Special Instructions</Label>
              <Textarea
                id="specialInstructions"
                name="specialInstructions"
                value={formData.specialInstructions}
                onChange={handleChange}
                rows={3}
              />
            </div>
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
      </DialogContent>
    </Dialog>
  );
}
