"use client";

import { useState, useEffect } from "react";
import { useInventory } from "@/context/inventory-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Check, ChevronsUpDown, RefreshCcw, Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function InventoryFilters() {
  const {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedStatus,
    setSelectedStatus,
    selectedSupplier,
    setSelectedSupplier,
    statusOptions,
    categories,
    suppliers,
    // refreshData,
  } = useInventory();

  const [searchInput, setSearchInput] = useState(searchQuery);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [supplierOpen, setSupplierOpen] = useState(false);

  // Update search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput, setSearchQuery]);

  const handleClearFilters = () => {
    setSearchInput("");
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedStatus("all");
    setSelectedSupplier("all");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search inventory..."
            className="pl-8"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          {searchInput && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3"
              onClick={() => {
                setSearchInput("");
                setSearchQuery("");
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Category Filter */}
        <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={categoryOpen}
              className="min-w-[180px] justify-between"
            >
              {selectedCategory === "all"
                ? "All Categories"
                : selectedCategory}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandInput placeholder="Search category..." />
              <CommandList>
                <CommandEmpty>No category found.</CommandEmpty>
                <CommandGroup>
                  <CommandItem
                    onSelect={() => {
                      setSelectedCategory("all");
                      setCategoryOpen(false);
                    }}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedCategory === "all" ? "opacity-100" : "opacity-0"
                      )}
                    />
                    All Categories
                  </CommandItem>
                  {categories.map((category) => (
                    <CommandItem
                      key={category.id}
                      onSelect={() => {
                        setSelectedCategory(category.name);
                        setCategoryOpen(false);
                      }}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center">
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedCategory === category.name
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        <div
                          className={`w-2 h-2 rounded-full mr-2 ${category.color}`}
                        ></div>
                        {category.name}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Status Filter */}
        <Popover open={statusOpen} onOpenChange={setStatusOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={statusOpen}
              className="min-w-[180px] justify-between"
            >
              {selectedStatus === "all" ? "All Statuses" : selectedStatus}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandInput placeholder="Search status..." />
              <CommandList>
                <CommandEmpty>No status found.</CommandEmpty>
                <CommandGroup>
                  <CommandItem
                    onSelect={() => {
                      setSelectedStatus("all");
                      setStatusOpen(false);
                    }}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedStatus === "all" ? "opacity-100" : "opacity-0"
                      )}
                    />
                    All Statuses
                  </CommandItem>
                  {statusOptions.map((status) => (
                    <CommandItem
                      key={status}
                      onSelect={() => {
                        setSelectedStatus(status);
                        setStatusOpen(false);
                      }}
                      className="cursor-pointer"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedStatus === status ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {status.charAt(0).toUpperCase() + status.slice(1).replace("-", " ")}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Supplier Filter */}
        <Popover open={supplierOpen} onOpenChange={setSupplierOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={supplierOpen}
              className="min-w-[180px] justify-between"
            >
              {selectedSupplier === "all" ? "All Suppliers" : selectedSupplier}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandInput placeholder="Search supplier..." />
              <CommandList>
                <CommandEmpty>No supplier found.</CommandEmpty>
                <CommandGroup>
                  <CommandItem
                    onSelect={() => {
                      setSelectedSupplier("all");
                      setSupplierOpen(false);
                    }}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedSupplier === "all" ? "opacity-100" : "opacity-0"
                      )}
                    />
                    All Suppliers
                  </CommandItem>
                  {suppliers.map((supplier) => (
                    <CommandItem
                      key={supplier.id}
                      onSelect={() => {
                        setSelectedSupplier(supplier.name);
                        setSupplierOpen(false);
                      }}
                      className="cursor-pointer"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedSupplier === supplier.name
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      {supplier.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active Filters */}
      <div className="flex flex-wrap gap-2">
        {searchQuery && (
          <Badge variant="secondary" className="flex items-center gap-1">
            Search: {searchQuery}
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 ml-2"
              onClick={() => {
                setSearchInput("");
                setSearchQuery("");
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        )}
        {selectedCategory !== "all" && (
          <Badge variant="secondary" className="flex items-center gap-1">
            Category: {selectedCategory}
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 ml-2"
              onClick={() => setSelectedCategory("all")}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        )}
        {selectedStatus !== "all" && (
          <Badge variant="secondary" className="flex items-center gap-1">
            Status: {selectedStatus}
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 ml-2"
              onClick={() => setSelectedStatus("all")}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        )}
        {selectedSupplier !== "all" && (
          <Badge variant="secondary" className="flex items-center gap-1">
            Supplier: {selectedSupplier}
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 ml-2"
              onClick={() => setSelectedSupplier("all")}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        )}
        {(searchQuery || selectedCategory !== "all" || selectedStatus !== "all" || selectedSupplier !== "all") && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2"
            onClick={handleClearFilters}
          >
            <RefreshCcw className="h-3.5 w-3.5 mr-1.5" />
            Reset Filters
          </Button>
        )}
      </div>
    </div>
  );
}