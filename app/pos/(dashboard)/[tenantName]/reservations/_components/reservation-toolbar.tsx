"use client";

import { useReservation } from "@/context/reservation-provider";
// import { useDashboard } from "@/context/dashboard-provider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import { Search, Calendar as CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";

export function ReservationToolbar() {
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
    resources,
    statusOptions,
  } = useReservation();

  const [dateOpen, setDateOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [resourceOpen, setResourceOpen] = useState(false);

  return (
    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
      <div className="relative w-full md:w-64">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search reservations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8"
        />
        {search && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full"
            onClick={() => setSearch("")}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <Popover open={dateOpen} onOpenChange={setDateOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="justify-start text-left font-normal"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {format(startDate, "MMM d, yyyy")} -{" "}
            {format(endDate, "MMM d, yyyy")}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={(date) => date && setStartDate(date)}
              initialFocus
            />
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={(date) => date && setEndDate(date)}
              initialFocus
            />
          </div>
          <div className="flex justify-end gap-2 p-3 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const today = new Date();
                const nextMonth = new Date();
                nextMonth.setMonth(today.getMonth() + 1);
                setStartDate(today);
                setEndDate(nextMonth);
              }}
            >
              Reset
            </Button>
            <Button size="sm" onClick={() => setDateOpen(false)}>
              Apply
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <Popover open={statusOpen} onOpenChange={setStatusOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="justify-start text-left font-normal"
          >
            Status {statusFilter.length > 0 && `(${statusFilter.length})`}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0" align="start">
          <div className="p-2 space-y-2">
            {statusOptions.map((status) => (
              <div key={status} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`status-${status}`}
                  checked={statusFilter.includes(status)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setStatusFilter([...statusFilter, status]);
                    } else {
                      setStatusFilter(statusFilter.filter((s) => s !== status));
                    }
                  }}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor={`status-${status}`} className="text-sm">
                  {status.replace(/_/g, " ")}
                </label>
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2 p-3 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStatusFilter([])}
            >
              Clear
            </Button>
            <Button size="sm" onClick={() => setStatusOpen(false)}>
              Apply
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <Popover open={resourceOpen} onOpenChange={setResourceOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="justify-start text-left font-normal"
          >
            Resource {resourceFilter.length > 0 && `(${resourceFilter.length})`}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0" align="start">
          <div className="p-2 space-y-2 max-h-[300px] overflow-y-auto">
            {resources.map((resource) => (
              <div key={resource.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`resource-${resource.id}`}
                  checked={resourceFilter.includes(resource.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setResourceFilter([...resourceFilter, resource.id]);
                    } else {
                      setResourceFilter(
                        resourceFilter.filter((r) => r !== resource.id)
                      );
                    }
                  }}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor={`resource-${resource.id}`} className="text-sm">
                  {resource.name}
                </label>
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2 p-3 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setResourceFilter([])}
            >
              Clear
            </Button>
            <Button size="sm" onClick={() => setResourceOpen(false)}>
              Apply
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Display active filters */}
      {(statusFilter.length > 0 || resourceFilter.length > 0) && (
        <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
          {statusFilter.map((status) => (
            <Badge
              key={status}
              variant="secondary"
              className="flex items-center gap-1"
            >
              {status.replace(/_/g, " ")}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() =>
                  setStatusFilter(statusFilter.filter((s) => s !== status))
                }
              />
            </Badge>
          ))}
          {resourceFilter.map((id) => {
            const resource = resources.find((r) => r.id === id);
            return (
              <Badge
                key={id}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {resource?.name || id}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() =>
                    setResourceFilter(resourceFilter.filter((r) => r !== id))
                  }
                />
              </Badge>
            );
          })}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setStatusFilter([]);
              setResourceFilter([]);
            }}
            className="h-6 px-2"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}
