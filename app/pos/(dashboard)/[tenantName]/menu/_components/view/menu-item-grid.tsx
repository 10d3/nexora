/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDashboard } from "@/context/dashboard-provider";
import { useMenuStore } from "@/lib/store/menu-store";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

// Category icons mapping
const categoryIcons: Record<string, string> = {
  // Default icons for common categories
  Entrées: "🍽️",
  "Plats Principaux": "🍛",
  Pizzas: "🍕",
  Burgers: "🍔",
  Salades: "🥗",
  Pâtes: "🍝",
  Grillades: "🥩",
  "Fruits de Mer": "🦐",
  Soupes: "🥣",
  Sandwiches: "🥪",
  Accompagnements: "🍟",
  Vegan: "🌱",
  Desserts: "🍰",
  Boissons: "🥤",
  Bière: "🍺",
  Champagne: "🍾",
  Gazeuze: "🧋",
  Eau: "💧",
  "Vins & Alcools": "🍷",
  "Menu Enfant": "👶",
  "Petit Déjeuner": "🥐",
  Specialités: "⭐",
  // Fallback icon for unknown categories
  default: "🍴",
};

// Helper function to get icon for a category
const getCategoryIcon = (categoryName: string): string => {
  return categoryIcons[categoryName] || categoryIcons.default;
};

export function MenuItemGrid() {
  const { tenantId } = useDashboard();
  const {
    menuItems,
    categories,
    isLoading,
    fetchMenuItems,
    fetchCategories,
    currentSearchTerm,
    searchMenuItems,
  } = useMenuStore();

  // Fetch data on component mount
  useEffect(() => {
    if (tenantId) {
      fetchMenuItems(tenantId);
      fetchCategories(tenantId);

      // Store current tenant ID for filter operations
      localStorage.setItem("currentTenantId", tenantId);
    }
  }, [tenantId, fetchMenuItems, fetchCategories]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    searchMenuItems(e.target.value);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading menu items...</p>
      </div>
    );
  }

  // Group menu items by category
  const itemsByCategory: Record<string, any[]> = {};

  // Add uncategorized group
  itemsByCategory["uncategorized"] = [];

  // Group items by category ID
  menuItems.forEach((item: any) => {
    if (item.categoryId) {
      if (!itemsByCategory[item.categoryId]) {
        itemsByCategory[item.categoryId] = [];
      }
      itemsByCategory[item.categoryId].push(item);
    } else {
      itemsByCategory["uncategorized"].push(item);
    }
  });

  return (
    <div className="space-y-6">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search menu items..."
          className="pl-8"
          value={currentSearchTerm}
          onChange={handleSearchChange}
        />
      </div>

      {/* Categories grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map((category: any) => {
          const categoryItems = itemsByCategory[category.id] || [];
          const itemCount = categoryItems.length;

          // Skip empty categories if you want
          // if (itemCount === 0) return null;

          return (
            <Card
              key={category.id}
              className="p-4 hover:shadow-md transition-shadow cursor-pointer border border-border"
              onClick={() =>
                useMenuStore.getState().filterByCategory(category.id)
              }
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-3xl">
                    {getCategoryIcon(category.name)}
                  </div>
                  <div>
                    <h3 className="font-medium">{category.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {itemCount} items
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="ml-auto">
                  {itemCount}
                </Badge>
              </div>
            </Card>
          );
        })}

        {/* Uncategorized items card */}
        {itemsByCategory["uncategorized"].length > 0 && (
          <Card
            className="p-4 hover:shadow-md transition-shadow cursor-pointer border border-border"
            onClick={() => useMenuStore.getState().filterByCategory(null)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-3xl">{getCategoryIcon("default")}</div>
                <div>
                  <h3 className="font-medium">Uncategorized</h3>
                  <p className="text-sm text-muted-foreground">
                    {itemsByCategory["uncategorized"].length} items
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="ml-auto">
                {itemsByCategory["uncategorized"].length}
              </Badge>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
