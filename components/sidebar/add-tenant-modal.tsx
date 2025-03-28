/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { BusinessType } from "@prisma/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createTenant } from "@/lib/actions/tenant-actions";
import { Plus } from "lucide-react";

interface AddTenantModalProps {
  userId: string;
  trigger?: React.ReactNode;
  onSuccess?: (tenant: any) => void;
}

export function AddTenantModal({
  userId,
  trigger,
  onSuccess,
}: AddTenantModalProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [businessType, setBusinessType] = useState<BusinessType | "">("");
  const [description, setDescription] = useState("");
  const router = useRouter();

  const businessTypes = Object.values(BusinessType);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!name || !businessType) {
        toast.error("Please fill in all required fields");
        return;
      }

      const formData = new FormData();
      formData.append("name", name);
      formData.append("businessType", businessType);
      formData.append("description", description);
      formData.append("userId", userId);

      const result = await createTenant(formData);

      console.log(result)

      if (result.success) {
        toast.success(result.message);
        setOpen(false);
        resetForm();

        if (onSuccess && result.tenant) {
          onSuccess(result.tenant);
        }

        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error creating tenant:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setBusinessType("");
    setDescription("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <div className="flex items-center gap-2 p-2 cursor-pointer hover:bg-accent hover:text-accent-foreground rounded-md">
            <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
              <Plus className="size-4" />
            </div>
            <div className="text-muted-foreground font-medium">
              Add business
            </div>
          </div>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Business</DialogTitle>
            <DialogDescription>
              Create a new business for your account.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Business Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Acme Inc."
                required
                disabled={isLoading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="businessType">Business Type</Label>
              <Select
                value={businessType}
                onValueChange={(value) =>
                  setBusinessType(value as BusinessType)
                }
                required
                disabled={isLoading}
              >
                <SelectTrigger id="businessType">
                  <SelectValue placeholder="Select business type" />
                </SelectTrigger>
                <SelectContent>
                  {businessTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0) +
                        type.slice(1).toLowerCase().replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of your business"
                disabled={isLoading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Business"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
