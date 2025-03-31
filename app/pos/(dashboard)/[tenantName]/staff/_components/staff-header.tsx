/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
// import { useStaff } from "@/providers/staff-provider";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useStaff } from "@/context/staff-provider";

export default function StaffHeader() {
  const {
    search,
    setSearch,
    specializationFilter,
    setSpecializationFilter,
    specializationOptions,
  } = useStaff();

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleSpecializationChange = (specialization: string) => {
    if (specializationFilter.includes(specialization)) {
      setSpecializationFilter(
        specializationFilter.filter((s: any) => s !== specialization)
      );
    } else {
      setSpecializationFilter([...specializationFilter, specialization]);
    }
  };

  const clearFilters = () => {
    setSpecializationFilter([]);
  };

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search team members..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8"
        />
      </div>

      <div className="flex items-center gap-2">
        {specializationFilter.length > 0 && (
          <div className="flex flex-wrap gap-2 mr-2">
            {specializationFilter.map((specialization: any) => (
              <Badge
                key={specialization}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {specialization}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => handleSpecializationChange(specialization)}
                />
              </Badge>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-6 px-2 text-xs"
            >
              Clear
            </Button>
          </div>
        )}

        <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <h4 className="font-medium">Specialization</h4>
              <div className="grid grid-cols-2 gap-2">
                {specializationOptions.map((specialization: any) => (
                  <div
                    key={specialization}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={`specialization-${specialization}`}
                      checked={specializationFilter.includes(specialization)}
                      onCheckedChange={() =>
                        handleSpecializationChange(specialization)
                      }
                    />
                    <Label htmlFor={`specialization-${specialization}`}>
                      {specialization}
                    </Label>
                  </div>
                ))}
              </div>
              <div className="flex justify-between pt-2">
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear Filters
                </Button>
                <Button size="sm" onClick={() => setIsFilterOpen(false)}>
                  Apply
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
