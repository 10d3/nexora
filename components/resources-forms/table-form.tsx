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
// import { useDashboard } from "@/context/dashboard-provider";

const tableFormSchema = z.object({
  number: z.string().min(1, {
    message: "Table number is required.",
  }),
  capacity: z.coerce.number().int().positive({
    message: "Capacity must be a positive number.",
  }),
  status: z.string().default("AVAILABLE"),
});

type TableFormValues = z.infer<typeof tableFormSchema>;

const defaultValues: Partial<TableFormValues> = {
  number: "",
  capacity: 2,
  status: "AVAILABLE",
};

interface TableFormProps {
  onSuccess?: () => void;
}

export function TableForm({ onSuccess }: TableFormProps) {
  const { createResource, isPending } = useResourceMutation();

  const form = useForm<TableFormValues>({
    resolver: zodResolver(tableFormSchema),
    defaultValues,
  });

  async function onSubmit(data: TableFormValues) {
    try {
      await createResource({
        ...data,
        capacity: Number(data.capacity), // Ensure capacity is a number
      });

      form.reset(defaultValues);
      onSuccess?.(); // Call onSuccess callback if provided
    } catch (error) {
      console.error("Error creating table:", error);
      toast.error("Failed to create table", {
        description:
          "Please try again or contact support if the issue persists.",
      });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Table</CardTitle>
        <CardDescription>
          Enter the details of the table you want to add to your restaurant.
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
                  <FormLabel>Table Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter table number" {...field} />
                  </FormControl>
                  <FormDescription>
                    The unique identifier for this table.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                        <SelectItem value="RESERVED">Reserved</SelectItem>
                        <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
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
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Creating..." : "Create Table"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
