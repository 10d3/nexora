/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
// import { useDashboard } from "@/providers/dashboard-provider";
import type { BusinessType } from "@prisma/client";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createStaff, updateStaff, getServices } from "@/lib/actions/staff-actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useDashboard } from "@/context/dashboard-provider";

// Form schema
const staffSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email").optional().nullable(),
  phone: z.string().optional().nullable(),
  specialization: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  services: z.array(z.string()).optional(),
});

type StaffFormValues = z.infer<typeof staffSchema>;

interface StaffFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  staff?: any;
  businessType: BusinessType;
}

export default function StaffForm({
  open,
  onOpenChange,
  onSuccess,
  staff,
  businessType,
}: StaffFormProps) {
  const { tenantId } = useDashboard();
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Get specialization options based on business type
  const getSpecializationOptions = (businessType: BusinessType): string[] => {
    switch (businessType) {
      case "SALON":
        return [
          "Hair Stylist",
          "Colorist",
          "Nail Technician",
          "Makeup Artist",
          "Esthetician",
        ];
      case "SERVICE":
        return ["Technician", "Consultant", "Specialist", "Therapist"];
      case "RESTAURANT":
        return ["Chef", "Waiter", "Bartender", "Host", "Kitchen Staff"];
      case "HOTEL":
        return [
          "Receptionist",
          "Concierge",
          "Housekeeper",
          "Maintenance",
          "Bellhop",
        ];
      case "PHARMACIE":
        return ["Pharmacist", "Pharmacy Technician", "Consultant"];
      case "EDUCATION":
        return ["Teacher", "Instructor", "Administrator", "Counselor"];
      case "CONSTRUCTION":
        return ["Foreman", "Contractor", "Engineer", "Architect", "Laborer"];
      default:
        return ["General", "Specialist", "Manager"];
    }
  };

  const specializationOptions = getSpecializationOptions(businessType);

  // Initialize form with default values or staff data for editing
  const form = useForm<StaffFormValues>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      id: staff?.id || undefined,
      name: staff?.name || "",
      email: staff?.email || "",
      phone: staff?.phone || "",
      specialization: staff?.specialization || "",
      bio: staff?.bio || "",
      image: staff?.image || "",
      services: staff?.services?.map((s: any) => s.id) || [],
    },
  });

  // Fetch services when the form opens
  useEffect(() => {
    if (open) {
      const fetchServices = async () => {
        try {
          const result = await getServices(tenantId as string);
          if (result.success) {
            setServices(result.data || []);
          }
        } catch (error) {
          console.error("Error fetching services:", error);
        }
      };

      fetchServices();
    }
  }, [open, tenantId]);

  const onSubmit = async (values: StaffFormValues) => {
    setLoading(true);

    try {
      const action = values.id ? updateStaff : createStaff;
      console.log("Action:", action);
      const result = await action(businessType, values, tenantId as string);
      console.log("Result:", result);

      if (result.success) {
        onSuccess?.();
        onOpenChange(false);
      } else {
        toast.error("Error", {
          description: result.error || "Failed to save staff member",
        });
      }
    } catch (error) {
      toast.error("Error", {
        description: "An unexpected error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {staff ? "Edit Team Member" : "Add Team Member"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="specialization"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specialization</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select specialization" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {specializationOptions.map((specialization) => (
                          <SelectItem
                            key={specialization}
                            value={specialization}
                          >
                            {specialization}
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
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="john@example.com"
                        {...field}
                        value={field.value || ""}
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
                        placeholder="+1 (555) 123-4567"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief description about the team member"
                      className="resize-none"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile Image URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/image.jpg"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {services.length > 0 && (
              <FormField
                control={form.control}
                name="services"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Services</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between",
                              !field.value?.length && "text-muted-foreground"
                            )}
                          >
                            {field.value?.length
                              ? `${field.value.length} service${field.value.length > 1 ? "s" : ""} selected`
                              : "Select services"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search services..." />
                          <CommandList>
                            <CommandEmpty>No services found.</CommandEmpty>
                            <CommandGroup className="max-h-64 overflow-auto">
                              {services.map((service) => (
                                <CommandItem
                                  key={service.id}
                                  value={service.id}
                                  onSelect={() => {
                                    const current = field.value || [];
                                    const updated = current.includes(service.id)
                                      ? current.filter(
                                          (id) => id !== service.id
                                        )
                                      : [...current, service.id];
                                    field.onChange(updated);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      (field.value || []).includes(service.id)
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {service.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : staff ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
