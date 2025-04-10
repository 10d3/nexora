/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useMenu } from "@/context/menu-provider";
import { useMenuMutations } from "@/hooks/use-menu-mutations";
import { useDashboard } from "@/context/dashboard-provider";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Edit, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export function MenuCategories() {
  const { menuItems, categories, isLoading } = useMenu();
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

  // Group menu items by category
  const itemsByCategory: Record<string, any[]> = {};
  
  // Add uncategorized group
  itemsByCategory['uncategorized'] = [];
  
  // Group items by category ID
  menuItems.forEach((item: any) => {
    if (item.categoryId) {
      if (!itemsByCategory[item.categoryId]) {
        itemsByCategory[item.categoryId] = [];
      }
      itemsByCategory[item.categoryId].push(item);
    } else {
      itemsByCategory['uncategorized'].push(item);
    }
  });

  return (
    <div className="space-y-8">
      {categories.map((category: any) => {
        // Skip categories with no items
        if (!itemsByCategory[category.id] || itemsByCategory[category.id].length === 0) {
          return null;
        }
        
        return (
          <div key={category.id} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{category.name}</h3>
              <Badge variant="outline">{itemsByCategory[category.id].length} items</Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {itemsByCategory[category.id].map((item: any) => (
                <Card key={item.id}>
                  <CardHeader className="p-4 pb-2">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium">{item.name}</h4>
                      <div className="text-right font-semibold">
                        {formatCurrency(item.price)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    {item.description && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                    <div className="flex justify-between items-center">
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
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
      
      {/* Uncategorized items */}
      {itemsByCategory['uncategorized'].length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Uncategorized</h3>
            <Badge variant="outline">{itemsByCategory['uncategorized'].length} items</Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {itemsByCategory['uncategorized'].map((item: any) => (
              <Card key={item.id}>
                <CardHeader className="p-4 pb-2">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium">{item.name}</h4>
                    <div className="text-right font-semibold">
                      {formatCurrency(item.price)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  {item.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                  <div className="flex justify-between items-center">
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
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}