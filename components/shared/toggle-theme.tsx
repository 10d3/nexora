"use client";

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface ModeToggleProps {
  isNav?: boolean;
}

export function ModeToggle({ isNav = false }: ModeToggleProps) {
  const { setTheme, theme } = useTheme();

  if (isNav) {
    return (
      <div className="flex items-center gap-1 rounded-md border bg-background p-1">
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-4 w-4 p-0",
            theme === "light" && "bg-foreground text-background"
          )}
          onClick={() => setTheme("light")}
        >
          <Monitor className="h-3 w-3" />
          <span className="sr-only">Light mode</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-4 w-4 p-0",
            theme === "dark" && "bg-foreground text-background"
          )}
          onClick={() => setTheme("dark")}
        >
          <Moon className="h-3 w-3" />
          <span className="sr-only">Dark mode</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-4 w-4 p-0",
            theme === "system" && "bg-foreground text-background"
          )}
          onClick={() => setTheme("system")}
        >
          <Sun className="h-3 w-3" />
          <span className="sr-only">System mode</span>
        </Button>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}