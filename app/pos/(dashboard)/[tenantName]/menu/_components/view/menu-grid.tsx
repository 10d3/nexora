/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useMenu } from "@/context/menu-provider";
import { useMenuMutations } from "@/hooks/use-menu-mutations";
import { useDashboard } from "@/context/dashboard-provider";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Edit, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import Image from "next/image";

export function MenuGrid() {
  const { menuItems, isLoading } = useMenu();
  const { tenantId } = useDashboard();
  const { toggleMenuItemAvailability, deleteMenuItem } = useMenuMutations(
    tenantId || ""
  );
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {menuItems.map((item: any) => (
        <Card key={item.id} className="overflow-hidden">
          {item.imageUrl && (
            <div className="aspect-video w-full overflow-hidden">
              <Image
                src={item.imageUrl}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <CardHeader className="p-4 pb-2">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{item.name}</h3>
                {item.category && (
                  <Badge variant="outline" className="mt-1">
                    {item.category.name}
                  </Badge>
                )}
              </div>
              <div className="text-right font-semibold">
                {formatCurrency(item.price)}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {item.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {item.description}
              </p>
            )}
          </CardContent>
          <CardFooter className="p-4 pt-0 flex justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm">Available</span>
              <Switch
                checked={item.isAvailable}
                onCheckedChange={() => toggleMenuItemAvailability(item.id)}
              />
            </div>
            <div className="flex space-x-2">
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
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
