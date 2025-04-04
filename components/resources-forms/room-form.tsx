"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const roomFormSchema = z.object({
  number: z.string().min(1, {
    message: "Room number is required.",
  }),
  type: z.string().min(1, {
    message: "Please select a room type.",
  }),
  capacity: z.coerce.number().int().positive({
    message: "Capacity must be a positive number.",
  }),
  rate: z.coerce.number().positive({
    message: "Rate must be a positive number.",
  }),
  status: z.string().default("AVAILABLE"),
  roomTypeId: z.string().optional(),
});

type RoomFormValues = z.infer<typeof roomFormSchema>;

const defaultValues: Partial<RoomFormValues> = {
  number: "",
  type: "",
  capacity: 1,
  rate: 0,
  status: "AVAILABLE",
  roomTypeId: "",
};

export function RoomForm() {
  const form = useForm<RoomFormValues>({
    resolver: zodResolver(roomFormSchema),
    defaultValues,
  });

  function onSubmit(data: RoomFormValues) {
    toast.success("Room created", {
      description: "The room has been successfully created.",
      action: {
        label: "View",
        onClick: () => console.log("View room:", data),
      },
    });
    console.log(data);
    form.reset(defaultValues);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Room</CardTitle>
        <CardDescription>
          Enter the details of the room you want to add to your property.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter room number" {...field} />
                  </FormControl>
                  <FormDescription>
                    The unique identifier for this room.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select room type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Standard">Standard</SelectItem>
                        <SelectItem value="Deluxe">Deluxe</SelectItem>
                        <SelectItem value="Suite">Suite</SelectItem>
                        <SelectItem value="Executive">Executive</SelectItem>
                        <SelectItem value="Presidential">
                          Presidential
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>The category of the room.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="AVAILABLE">Available</SelectItem>
                        <SelectItem value="OCCUPIED">Occupied</SelectItem>
                        <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                        <SelectItem value="CLEANING">Cleaning</SelectItem>
                        <SelectItem value="RESERVED">Reserved</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Current availability status.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacity</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormDescription>Maximum number of guests.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rate (per night)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" {...field} />
                    </FormControl>
                    <FormDescription>
                      Price per night in your currency.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="roomTypeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room Type ID (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter room type ID if applicable"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Reference to a specific room type configuration.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              Create Room
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
