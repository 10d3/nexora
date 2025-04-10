/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMenu } from "@/context/menu-provider";
import { useMenuMutations } from "@/hooks/use-menu-mutations";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { PlusCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

const menuItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Price must be a positive number"),
  categoryId: z.string().optional(),
  isAvailable: z.boolean().default(true),
  imageUrl: z.string().optional(),
});

type MenuItemFormValues = z.infer<typeof menuItemSchema>;

interface MenuDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenantId: string;
  businessType?: string;
  mode: "create" | "edit";
  initialData?: any;
}

export function MenuDialog({
  open,
  onOpenChange,
  tenantId,
  //   businessType,
  mode,
  initialData,
}: MenuDialogProps) {
  const { categories } = useMenu();
  const { createMenuItem, updateMenuItem, createCategory } =
    useMenuMutations(tenantId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  const defaultValues: Partial<MenuItemFormValues> = {
    name: initialData?.name || "",
    description: initialData?.description || "",
    price: initialData?.price || 0,
    categoryId: initialData?.categoryId || undefined,
    isAvailable: initialData?.isAvailable ?? true,
    imageUrl: initialData?.imageUrl || "",
  };

  const form = useForm<MenuItemFormValues>({
    resolver: zodResolver(menuItemSchema),
    defaultValues,
  });

  const onSubmit = async (data: MenuItemFormValues) => {
    setIsSubmitting(true);
    try {
      // Convert "none" value to undefined for categoryId
      if (data.categoryId === "none") {
        data.categoryId = undefined;
      }

      if (mode === "create") {
        await createMenuItem(data);
      } else if (mode === "edit" && initialData?.id) {
        await updateMenuItem({
          itemId: initialData.id,
          data,
        });
      }
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add New Menu Item" : "Edit Menu Item"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Add a new item to your menu"
              : "Update the details of this menu item"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Item name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Item description"
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
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      if (value === "create-new") {
                        setShowNewCategoryForm(true);
                      } else {
                        field.onChange(value);
                      }
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {categories.map((category: any) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                      <Separator className="my-2" />
                      <SelectItem value="create-new" className="text-primary">
                        <div className="flex items-center">
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Create new category
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {showNewCategoryForm && (
                    <div className="mt-2 space-y-2 rounded-md border p-3">
                      <div className="text-sm font-medium">
                        Create New Category
                      </div>
                      <div className="space-y-2">
                        <Input
                          placeholder="Category name"
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                        />
                        <Textarea
                          placeholder="Category description (optional)"
                          value={newCategoryDescription}
                          onChange={(e) =>
                            setNewCategoryDescription(e.target.value)
                          }
                        />
                        <div className="flex justify-end space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setShowNewCategoryForm(false);
                              setNewCategoryName("");
                              setNewCategoryDescription("");
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            disabled={
                              !newCategoryName.trim() || isCreatingCategory
                            }
                            onClick={async () => {
                              if (!newCategoryName.trim()) return;

                              setIsCreatingCategory(true);
                              try {
                                const result = await createCategory({
                                  name: newCategoryName.trim(),
                                  description:
                                    newCategoryDescription.trim() || undefined,
                                });

                                if (result.success) {
                                  // Set the newly created category as the selected one
                                  field.onChange(result.data.id);
                                  setShowNewCategoryForm(false);
                                  setNewCategoryName("");
                                  setNewCategoryDescription("");
                                  toast.success(
                                    "Category created successfully"
                                  );
                                } else {
                                  toast.error("Failed to create category", {
                                    description: result.error,
                                  });
                                }
                              } catch (error) {
                                console.error(
                                  "Error creating category:",
                                  error
                                );
                                toast.error("Failed to create category");
                              } finally {
                                setIsCreatingCategory(false);
                              }
                            }}
                          >
                            {isCreatingCategory ? "Creating..." : "Create"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/image.jpg"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter a URL for the menu item image
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isAvailable"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Available</FormLabel>
                    <FormDescription>
                      Mark this item as available on the menu
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

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
                    ? "Create Item"
                    : "Update Item"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
