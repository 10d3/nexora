/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMenuStore } from "@/lib/store/menu-store";

export function MenuFilters() {
  const {
    categories,
    filterByCategory,
    filterByAvailability,
    searchMenuItems,
    currentCategoryFilter,
    currentAvailabilityFilter,
    currentSearchTerm
  } = useMenuStore();

  const [searchValue, setSearchValue] = useState(currentSearchTerm || "");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== undefined) {
        searchMenuItems(searchValue);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue, searchMenuItems]);

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search menu items..."
          className="pl-8"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
      </div>

      <div className="flex gap-2">
        <Select
          value={currentCategoryFilter || "all"}
          onValueChange={(value) =>
            filterByCategory(value === "all" ? null : value)
          }
        >
          <SelectTrigger className="w-[180px]">
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

        <Select
          value={currentAvailabilityFilter === null ? "all" : String(currentAvailabilityFilter)}
          onValueChange={(value) =>
            filterByAvailability(
              value === "all" ? null : value === "true" ? true : false
            )
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Availability" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Items</SelectItem>
            <SelectItem value="true">Available</SelectItem>
            <SelectItem value="false">Unavailable</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          onClick={() => {
            filterByCategory(null);
            filterByAvailability(null);
            setSearchValue("");
            searchMenuItems("");
          }}
        >
          Reset
        </Button>
      </div>
    </div>
  );
}