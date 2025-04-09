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
import { useResourceMutation } from "@/hooks/use-resource-mutations";

const roomFormSchema = z.object({
  number: z.string().min(1, {
    message: "Room number is required.",
  }),
  // Make sure type is required and has a default value
  roomType: z
    .string({
      required_error: "Room type is required",
    })
    .min(1, "Room type is required"),
  capacity: z.coerce.number().int().positive({
    message: "Capacity must be a positive number.",
  }),
  rate: z.coerce.number().positive({
    message: "Rate must be a positive number.",
  }),
  status: z.string().default("AVAILABLE"),
});

type RoomFormValues = z.infer<typeof roomFormSchema>;

const defaultValues: Partial<RoomFormValues> = {
  number: "",
  roomType: "Standard", // Set a default room type
  capacity: 1,
  rate: 0,
  status: "AVAILABLE",
};

interface RoomFormProps {
  onSuccess?: () => void;
}

export function RoomForm({ onSuccess }: RoomFormProps) {
  const { createResource, isPending } = useResourceMutation();

  const form = useForm<RoomFormValues>({
    resolver: zodResolver(roomFormSchema),
    defaultValues,
  });

  async function onSubmit(data: RoomFormValues) {

    console.log("Room data :", data)
    try {
      // Ensure room type is present and valid
      if (!data.roomType) {
        toast.error("Room type is required");
        return;
      }

      // Format the data before sending
      const formattedData = {
        ...data,
        capacity: Number(data.capacity),
        rate: Number(data.rate),
        roomType: data.roomType, // No need to trim as Select provides clean values
      };

      console.log("Submitting room data:", formattedData);

      await createResource(formattedData);

      toast.success("Room created successfully");
      form.reset(defaultValues);
      onSuccess?.();
    } catch (error) {
      console.error("Error creating room:", error);
      toast.error("Failed to create room", {
        description:
          error instanceof Error ? error.message : "Please try again",
      });
    }
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
                name="roomType"
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
                      <Input
                        type="number"
                        min="1"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
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
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      Price per night in your currency.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Creating..." : "Create Room"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
