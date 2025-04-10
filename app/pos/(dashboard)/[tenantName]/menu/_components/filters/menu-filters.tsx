/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useMenu } from "@/context/menu-provider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export function MenuFilters() {
  const {
    categories,
    filterByCategory,
    filterByAvailability,
    searchMenuItems,
    currentCategoryFilter,
    currentAvailabilityFilter,
    currentSearchTerm,
  } = useMenu();

  const [searchValue, setSearchValue] = useState(currentSearchTerm || "");

  // Update search when user types
  useEffect(() => {
    const timer = setTimeout(() => {
      searchMenuItems(searchValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue, searchMenuItems]);

  // Reset all filters
  const resetFilters = () => {
    setSearchValue("");
    filterByCategory(null);
    filterByAvailability(null);
  };

  return (
    <div className="space-y-4 bg-card p-4 rounded-lg border">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <Label htmlFor="search" className="text-sm font-medium">
            Search
          </Label>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search menu items..."
              className="pl-8"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="w-full md:w-64">
          <Label htmlFor="category" className="text-sm font-medium">
            Category
          </Label>
          <Select
            value={currentCategoryFilter || "all"}
            onValueChange={(value) => filterByCategory(value === "all" ? null : value)}
          >
            <SelectTrigger id="category">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category: any) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Availability Filter */}
        <div className="w-full md:w-64">
          <Label className="text-sm font-medium">Availability</Label>
          <div className="flex items-center justify-between rounded-md border p-2">
            <span className="text-sm">Show Available Only</span>
            <Switch
              checked={currentAvailabilityFilter === true}
              onCheckedChange={(checked) =>
                filterByAvailability(checked ? true : null)
              }
            />
          </div>
        </div>
      </div>

      {/* Reset Filters */}
      {(currentCategoryFilter !== null ||
        currentAvailabilityFilter !== null ||
        currentSearchTerm !== "") && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={resetFilters}
            className="text-xs"
          >
            <X className="mr-1 h-3 w-3" />
            Reset Filters
          </Button>
        </div>
      )}
    </div>
  );
}