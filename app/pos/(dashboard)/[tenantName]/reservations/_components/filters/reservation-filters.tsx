"use client";

import { useState, useEffect } from "react";
import { useReservation } from "@/context/reservation-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { CalendarIcon, Check, ChevronsUpDown, Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export function ReservationFilters() {
  const {
    search,
    setSearch,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    statusFilter,
    setStatusFilter,
    resourceFilter,
    setResourceFilter,
    statusOptions,
    resources,
  } = useReservation();

  const [searchInput, setSearchInput] = useState(search);
  const [statusOpen, setStatusOpen] = useState(false);
  const [resourceOpen, setResourceOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);

  // Update search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput, setSearch]);

  const handleClearFilters = () => {
    setSearchInput("");
    setSearch("");
    setStatusFilter([]);
    setResourceFilter([]);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search reservations..."
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
                setSearch("");
              }}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Clear</span>
            </Button>
          )}
        </div>

        {/* Date Range Picker */}
        <Popover open={dateOpen} onOpenChange={setDateOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="justify-start text-left font-normal w-full md:w-auto"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startDate && endDate ? (
                <>
                  {format(startDate, "MMM d, yyyy")} -{" "}
                  {format(endDate, "MMM d, yyyy")}
                </>
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={{
                from: startDate,
                to: endDate,
              }}
              onSelect={(range) => {
                if (range?.from) setStartDate(range.from);
                if (range?.to) setEndDate(range.to);
                setDateOpen(false);
              }}
              numberOfMonths={2}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {/* Status Filter */}
        <Popover open={statusOpen} onOpenChange={setStatusOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={statusOpen}
              className="justify-between w-full md:w-[200px]"
            >
              {statusFilter.length > 0
                ? `${statusFilter.length} selected`
                : "Filter by status"}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandInput placeholder="Search status..." />
              <CommandList>
                <CommandEmpty>No status found.</CommandEmpty>
                <CommandGroup>
                  {statusOptions.map((status) => (
                    <CommandItem
                      key={status}
                      value={status}
                      onSelect={() => {
                        setStatusFilter(
                          statusFilter.includes(status)
                            ? statusFilter.filter((s) => s !== status)
                            : [...statusFilter, status]
                        );
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          statusFilter.includes(status)
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      {status.replace(/_/g, " ")}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Resource Filter */}
        <Popover open={resourceOpen} onOpenChange={setResourceOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={resourceOpen}
              className="justify-between w-full md:w-[200px]"
            >
              {resourceFilter.length > 0
                ? `${resourceFilter.length} selected`
                : "Filter by resource"}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandInput placeholder="Search resources..." />
              <CommandList>
                <CommandEmpty>No resources found.</CommandEmpty>
                <CommandGroup>
                  {resources.map((resource) => (
                    <CommandItem
                      key={resource.id}
                      value={resource.name}
                      onSelect={() => {
                        setResourceFilter(
                          resourceFilter.includes(resource.id)
                            ? resourceFilter.filter((id) => id !== resource.id)
                            : [...resourceFilter, resource.id]
                        );
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          resourceFilter.includes(resource.id)
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      {resource.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Clear Filters Button */}
        <Button
          variant="ghost"
          onClick={handleClearFilters}
          className="w-full md:w-auto"
          disabled={
            !search && statusFilter.length === 0 && resourceFilter.length === 0
          }
        >
          Clear filters
        </Button>
      </div>

      {/* Active Filters */}
      {(statusFilter.length > 0 || resourceFilter.length > 0) && (
        <div className="flex flex-wrap gap-2">
          {statusFilter.map((status) => (
            <Badge key={status} variant="secondary">
              {status.replace(/_/g, " ")}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-2"
                onClick={() =>
                  setStatusFilter(statusFilter.filter((s) => s !== status))
                }
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove</span>
              </Button>
            </Badge>
          ))}
          {resourceFilter.map((id) => {
            const resource = resources.find((r) => r.id === id);
            return (
              <Badge key={id} variant="secondary">
                {resource?.name || id}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 ml-2"
                  onClick={() =>
                    setResourceFilter(resourceFilter.filter((r) => r !== id))
                  }
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove</span>
                </Button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
