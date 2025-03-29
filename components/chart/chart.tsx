/* eslint-disable @typescript-eslint/no-empty-object-type */
"use client";

import * as React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface ChartContainerProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const ChartContainer = React.forwardRef<
  HTMLDivElement,
  ChartContainerProps
>(({ className, ...props }, ref) => {
  return <div className={cn("relative", className)} ref={ref} {...props} />;
});
ChartContainer.displayName = "ChartContainer";

export interface ChartProps extends React.HTMLAttributes<SVGSVGElement> {}

export const Chart = React.forwardRef<SVGSVGElement, ChartProps>(
  ({ className, ...props }, ref) => {
    return (
      <svg className={cn("h-full w-full", className)} ref={ref} {...props} />
    );
  }
);
Chart.displayName = "Chart";

export interface ChartTooltipProps {
  children: React.ReactNode;
}

export const ChartTooltip = ({ children }: ChartTooltipProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent className="bg-popover border-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-top-[2%] data-[state=open]:slide-in-from-top-[2%]">
          {children}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export interface ChartTooltipContentProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  ChartTooltipContentProps
>(({ className, ...props }, ref) => {
  return (
    <div
      className={cn("px-2 py-1 text-sm font-medium", className)}
      ref={ref}
      {...props}
    />
  );
});
ChartTooltipContent.displayName = "ChartTooltipContent";

export interface ChartTooltipItemProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const ChartTooltipItem = React.forwardRef<
  HTMLDivElement,
  ChartTooltipItemProps
>(({ className, ...props }, ref) => {
  return (
    <div
      className={cn("flex items-center justify-between space-x-2", className)}
      ref={ref}
      {...props}
    />
  );
});
ChartTooltipItem.displayName = "ChartTooltipItem";

export interface ChartTooltipLabelProps
  extends React.HTMLAttributes<HTMLSpanElement> {}

export const ChartTooltipLabel = React.forwardRef<
  HTMLSpanElement,
  ChartTooltipLabelProps
>(({ className, ...props }, ref) => {
  return (
    <span
      className={cn("text-gray-500 dark:text-gray-400", className)}
      ref={ref}
      {...props}
    />
  );
});
ChartTooltipLabel.displayName = "ChartTooltipLabel";

export interface ChartTooltipValueProps
  extends React.HTMLAttributes<HTMLSpanElement> {}

export const ChartTooltipValue = React.forwardRef<
  HTMLSpanElement,
  ChartTooltipValueProps
>(({ className, ...props }, ref) => {
  return <span className={cn("font-bold", className)} ref={ref} {...props} />;
});
ChartTooltipValue.displayName = "ChartTooltipValue";
