"use client";
import * as React from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useThemeContext } from "@/context/theme-data-provider";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { ThemeColors } from "@/types/theme-types";

// Update this to match your actual theme keys from theme-color.ts
const availableThemeColors = [
  { name: "default", label: "Default", light: "bg-zinc-900", dark: "bg-zinc-700" },
  { name: "midnight", label: "Midnight", light: "bg-slate-900", dark: "bg-slate-800" },
  { name: "daylight", label: "Daylight", light: "bg-amber-500", dark: "bg-amber-600" },
  { name: "emerald", label: "Emerald", light: "bg-emerald-600", dark: "bg-emerald-700" },
  { name: "sapphire", label: "Sapphire", light: "bg-blue-600", dark: "bg-blue-700" },
  { name: "ruby", label: "Ruby", light: "bg-rose-600", dark: "bg-rose-700" },
];

export function ThemeColorToggle() {
  const { themeColor, setThemeColor } = useThemeContext();
  const { resolvedTheme } = useTheme();

  const createSelectItems = () => {
    return availableThemeColors.map(({ name, label, light, dark }) => (
      <SelectItem key={name} value={name}>
        <div className="flex items-center space-x-3">
          <div
            className={cn(
              "rounded-full",
              "w-[20px]",
              "h-[20px]",
              resolvedTheme === "dark" ? dark : light
            )}
          ></div>
          <div className="text-sm">{label}</div>
        </div>
      </SelectItem>
    ));
  };

  return (
    <div className="px-2 py-1">
      <Select
        onValueChange={(value) => setThemeColor(value as ThemeColors)}
        defaultValue={themeColor}
        value={themeColor}
      >
        <SelectTrigger className="w-full h-9 ring-offset-transparent focus:ring-transparent">
          <SelectValue placeholder="Select Theme" />
        </SelectTrigger>
        <SelectContent className="border-muted">
          {createSelectItems()}
        </SelectContent>
      </Select>
    </div>
  );
}