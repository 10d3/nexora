/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useResourceMutation } from "@/hooks/use-resource-mutations";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import { useResource } from "@/context/resource-provider";

// Define the base schema that all resource types will share
const baseResourceSchema = z.object({
  name: z.string().min(1, { message: "Name is required." }),
  status: z.string().min(1, { message: "Status is required." }),
});

// Restaurant table schema
const tableSchema = baseResourceSchema.extend({
  capacity: z.coerce.number().int().positive({
    message: "Capacity must be a positive number.",
  }),
});

// Hotel room schema
const roomSchema = baseResourceSchema.extend({
  roomType: z.string().min(1, { message: "Room type is required." }),
  capacity: z.coerce.number().int().positive({
    message: "Capacity must be a positive number.",
  }),
  rate: z.coerce.number().positive({
    message: "Rate must be a positive number.",
  }),
});

// Service staff schema
const staffSchema = baseResourceSchema.extend({
  specialization: z.string().min(1, { message: "Specialization is required." }),
  email: z.string().email({ message: "Invalid email address." }),
  phone: z.string().min(1, { message: "Phone number is required." }),
});

// Asset schema for other business types
const assetSchema = baseResourceSchema.extend({
  type: z.string().min(1, { message: "Asset type is required." }),
  condition: z.string().min(1, { message: "Condition is required." }),
});

type ResourceFormValues = z.infer<typeof baseResourceSchema> & {
  capacity?: number;
  roomType?: string;
  rate?: number;
  specialization?: string;
  email?: string;
  phone?: string;
  type?: string;
  condition?: string;
};

export function ResourceDialog({
  open,
  onOpenChange,
  businessType,
  tenantId,
  mode,
  resource,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  businessType: string;
  tenantId: string;
  mode: "create" | "edit";
  resource?: any;
}) {
  console.log(tenantId)
  const { statusOptions } = useResource();
  const { createResource, updateResource } = useResourceMutation();
  const [schema, setSchema] = useState<z.ZodType<any>>(baseResourceSchema);

  // Set the appropriate schema based on business type
  useEffect(() => {
    switch (businessType) {
      case "RESTAURANT":
        setSchema(tableSchema);
        break;
      case "HOTEL":
        setSchema(roomSchema);
        break;
      case "SALON":
      case "SERVICE":
        setSchema(staffSchema);
        break;
      default:
        setSchema(assetSchema);
        break;
    }
  }, [businessType]);

  // Set default values based on business type and mode
  const getDefaultValues = (): Partial<ResourceFormValues> => {
    if (mode === "edit" && resource) {
      // Return existing resource data for edit mode
      return {
        name: resource.name,
        status: resource.status,
        // Restaurant specific
        capacity: resource.capacity,
        // Hotel specific
        roomType: resource.roomType,
        rate: resource.rate,
        // Service specific
        specialization: resource.specialization,
        email: resource.email,
        phone: resource.phone,
        // Asset specific
        type: resource.type,
        condition: resource.condition,
      };
    }

    // Default values for create mode
    const baseDefaults = {
      name: "",
      status: statusOptions[0] || "AVAILABLE",
    };

    switch (businessType) {
      case "RESTAURANT":
        return {
          ...baseDefaults,
          capacity: 2,
        };
      case "HOTEL":
        return {
          ...baseDefaults,
          roomType: "",
          capacity: 1,
          rate: 0,
        };
      case "SALON":
      case "SERVICE":
        return {
          ...baseDefaults,
          specialization: "",
          email: "",
          phone: "",
        };
      default:
        return {
          ...baseDefaults,
          type: "",
          condition: "GOOD",
        };
    }
  };

  const form = useForm<ResourceFormValues>({
    resolver: zodResolver(schema),
    defaultValues: getDefaultValues(),
  });

  // Reset form when dialog opens/closes or resource changes
  useEffect(() => {
    if (open) {
      form.reset(getDefaultValues());
    }
  }, [open, resource, form]);

  // Handle form submission
  const onSubmit = (data: ResourceFormValues) => {
    if (mode === "edit" && resource) {
      // Update existing resource
      updateResource({
        ...data,
        id: resource.id,
      });
    } else {
      // Create new resource
      createResource(data);
    }
    onOpenChange(false);
  };

  // Get form fields based on business type
  const renderFormFields = () => {
    return (
      <>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter name" {...field} />
              </FormControl>
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
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Restaurant specific fields */}
        {businessType === "RESTAURANT" && (
          <FormField
            control={form.control}
            name="capacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Capacity</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter capacity"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  The number of people this table can accommodate.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Hotel specific fields */}
        {businessType === "HOTEL" && (
          <>
            <FormField
              control={form.control}
              name="roomType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select room type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="STANDARD">Standard</SelectItem>
                      <SelectItem value="DELUXE">Deluxe</SelectItem>
                      <SelectItem value="SUITE">Suite</SelectItem>
                      <SelectItem value="EXECUTIVE">Executive</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Capacity</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter capacity"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    The number of people this room can accommodate.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rate</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter rate"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>The nightly rate for this room.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {/* Service/Salon specific fields */}
        {(businessType === "SALON" || businessType === "SERVICE") && (
          <>
            <FormField
              control={form.control}
              name="specialization"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Specialization</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter specialization"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter email"
                      {...field}
                    />
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
                    <Input
                      placeholder="Enter phone number"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {/* Asset specific fields for other business types */}
        {businessType !== "RESTAURANT" && 
         businessType !== "HOTEL" && 
         businessType !== "SALON" && 
         businessType !== "SERVICE" && (
          <>
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Asset Type</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter asset type" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="condition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Condition</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="EXCELLENT">Excellent</SelectItem>
                      <SelectItem value="GOOD">Good</SelectItem>
                      <SelectItem value="FAIR">Fair</SelectItem>
                      <SelectItem value="POOR">Poor</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}
      </>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add New Resource" : "Edit Resource"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? `Enter the details for the new ${businessType.toLowerCase()} resource.`
              : `Update the details for this ${businessType.toLowerCase()} resource.`}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderFormFields()}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {mode === "create" ? "Create" : "Update"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}