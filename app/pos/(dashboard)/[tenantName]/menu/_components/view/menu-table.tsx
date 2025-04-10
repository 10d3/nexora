/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useMenu } from "@/context/menu-provider";
import { useMenuMutations } from "@/hooks/use-menu-mutations";
import { useDashboard } from "@/context/dashboard-provider";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Edit, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export function MenuTable() {
  const { menuItems, isLoading } = useMenu();
  const { tenantId } = useDashboard();
  const { toggleMenuItemAvailability, deleteMenuItem } = useMenuMutations(tenantId || "");
  const [editItem, setEditItem] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading menu items...</p>
      </div>
    );
  }

  if (!menuItems || menuItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <p className="text-muted-foreground">No menu items found</p>
        <p className="text-sm text-muted-foreground">
          Add your first menu item to get started
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead>Available</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {menuItems.map((item: any) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell>
                {item.category ? (
                  <Badge variant="outline">{item.category.name}</Badge>
                ) : (
                  <span className="text-muted-foreground text-sm">Uncategorized</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(item.price)}
              </TableCell>
              <TableCell>
                <Switch
                  checked={item.isAvailable}
                  onCheckedChange={() => toggleMenuItemAvailability(item.id)}
                />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditItem(item.id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteMenuItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}