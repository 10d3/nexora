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
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const departmentFormSchema = z.object({
  name: z.string().min(2, {
    message: "Department name must be at least 2 characters.",
  }),
  description: z.string().optional(),
  floorLocation: z.string().optional(),
  manager: z.string().optional(),
});

type DepartmentFormValues = z.infer<typeof departmentFormSchema>;

const defaultValues: Partial<DepartmentFormValues> = {
  name: "",
  description: "",
  floorLocation: "",
  manager: "",
};

export function DepartmentForm() {
  const form = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentFormSchema),
    defaultValues,
  });

  function onSubmit(data: DepartmentFormValues) {
    toast.success("Department created", {
      description: "The department has been successfully created.",
      action: {
        label: "View",
        onClick: () => console.log("View department:", data),
      },
    });
    console.log(data);
    form.reset(defaultValues);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Department</CardTitle>
        <CardDescription>
          Enter the details of the department you want to add to your
          organization.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter department name" {...field} />
                  </FormControl>
                  <FormDescription>The name of the department.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter department description"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    A brief description of the department&apos;s function.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="floorLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Floor Location (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter floor or location" {...field} />
                    </FormControl>
                    <FormDescription>
                      Where this department is physically located.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="manager"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Manager (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter manager name" {...field} />
                    </FormControl>
                    <FormDescription>
                      The person in charge of this department.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" className="w-full">
              Create Department
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
