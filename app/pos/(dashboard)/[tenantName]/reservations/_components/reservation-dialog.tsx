"use client";

import { useState, useEffect } from "react";
import { useReservation } from "@/context/reservation-provider";
// import { useDashboard } from "@/context/dashboard-provider";
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
import { CalendarIcon, Clock } from "lucide-react";
import { toast } from "sonner";
import {
  createReservation,
  updateReservation,
} from "@/lib/actions/reservation-actions";

type ReservationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  businessType: string;
  tenantId: string;
  mode: "create" | "edit";
  refreshData?: () => Promise<void>;
};

export function ReservationDialog({
  open,
  onOpenChange,
  businessType,
  tenantId,
  mode,
//   refreshData
}: ReservationDialogProps) {
  const { selectedReservation, resources, refreshData } = useReservation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    startDate: new Date(),
    startTime: "12:00",
    endTime: "14:00",
    size: 1,
    specialRequests: "",
    status: "CONFIRMED",
    resourceId: "",
  });

  // Reset form when dialog opens/closes or mode changes
  useEffect(() => {
    if (open && mode === "edit" && selectedReservation) {
      // Format the date and time for the form
      const startDate = new Date(selectedReservation.startTime);
      const startHours = startDate.getHours().toString().padStart(2, "0");
      const startMinutes = startDate.getMinutes().toString().padStart(2, "0");
      const startTime = `${startHours}:${startMinutes}`;

      let endTime = "14:00"; // Default end time
      if (selectedReservation.endTime) {
        const endDate = new Date(selectedReservation.endTime);
        const endHours = endDate.getHours().toString().padStart(2, "0");
        const endMinutes = endDate.getMinutes().toString().padStart(2, "0");
        endTime = `${endHours}:${endMinutes}`;
      }

      setFormData({
        id: selectedReservation.id,
        customerName: selectedReservation.customerName || "",
        customerEmail: selectedReservation.customerEmail || "",
        customerPhone: selectedReservation.customerPhone || "",
        startDate: startDate,
        startTime: startTime,
        endTime: endTime,
        size: selectedReservation.size || 1,
        specialRequests: selectedReservation.notes || "",
        status: selectedReservation.status || "CONFIRMED",
        resourceId: selectedReservation.resourceId || "",
      });
    } else {
      // Reset form for create mode
      setFormData({
        id: "",
        customerName: "",
        customerEmail: "",
        customerPhone: "",
        startDate: new Date(),
        startTime: "12:00",
        endTime: "14:00",
        size: 1,
        specialRequests: "",
        status: "CONFIRMED",
        resourceId: "",
      });
    }
  }, [open, mode, selectedReservation]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Combine date and time
      const startDateTime = new Date(formData.startDate);
      const [startHours, startMinutes] = formData.startTime
        .split(":")
        .map(Number);
      startDateTime.setHours(startHours, startMinutes, 0);

      const endDateTime = new Date(formData.startDate);
      const [endHours, endMinutes] = formData.endTime.split(":").map(Number);
      endDateTime.setHours(endHours, endMinutes, 0);

      // Prepare data for API
      const reservationData = {
        id: mode === "edit" ? formData.id : undefined,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail || null,
        customerPhone: formData.customerPhone || null,
        startTime: startDateTime,
        endTime: endDateTime,
        size: Number(formData.size),
        specialRequests: formData.specialRequests || null,
        status: formData.status,
        resourceId:
          formData.resourceId === "unassigned"
            ? null
            : formData.resourceId || null,
      };

      let result;
      if (mode === "create") {
        result = await createReservation(
          businessType,
          reservationData,
          tenantId
        );
      } else {
        result = await updateReservation(
          businessType,
          //   businessType,
          //   reservationData.id as string,
          reservationData,
          tenantId
        );
      }

      if (result.success) {
        toast.success(
          mode === "create" ? "Reservation created" : "Reservation updated",
          {
            description:
              mode === "create"
                ? "The reservation has been successfully created."
                : "The reservation has been successfully updated.",
          }
        );
        refreshData();
        onOpenChange(false);
      } else {
        toast.error("Error", {
          description: result.error || "Failed to save reservation.",
        });
      }
    } catch (error) {
      console.error("Error saving reservation:", error);
      toast.error("Error", {
        description: "An unexpected error occurred.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusOptions = [
    "PENDING",
    "CONFIRMED",
    "CANCELLED",
    "COMPLETED",
    "NO_SHOW",
    "WAITING_LIST",
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create Reservation" : "Edit Reservation"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Customer Name *</Label>
                <Input
                  id="customerName"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="size">Party Size *</Label>
                <Input
                  id="size"
                  name="size"
                  type="number"
                  min="1"
                  value={formData.size}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerEmail">Email</Label>
                <Input
                  id="customerEmail"
                  name="customerEmail"
                  type="email"
                  value={formData.customerEmail}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerPhone">Phone</Label>
                <Input
                  id="customerPhone"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(formData.startDate, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.startDate}
                    onSelect={(date) =>
                      date &&
                      setFormData((prev) => ({ ...prev, startDate: date }))
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time *</Label>
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="startTime"
                    name="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="endTime"
                    name="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
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
                <Label htmlFor="resourceId">Resource</Label>
                <Select
                  value={formData.resourceId}
                  onValueChange={(value) =>
                    handleSelectChange("resourceId", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select resource" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {resources.map((resource) => (
                      <SelectItem key={resource.id} value={resource.id}>
                        {resource.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialRequests">Special Requests</Label>
              <Textarea
                id="specialRequests"
                name="specialRequests"
                value={formData.specialRequests}
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
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
