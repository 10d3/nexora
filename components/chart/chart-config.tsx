/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";

export type ChartConfig = Record<
  string,
  {
    label: string;
    color?: string;
  }
>;

export interface ChartStyleProps {
  id?: string;
  config: ChartConfig;
}

export function ChartStyle({ id, config }: ChartStyleProps) {
  const cssVars = React.useMemo(() => {
    return Object.entries(config).reduce(
      (acc, [key, value]) => {
        if (value.color) {
          acc[`--color-${key}`] = value.color;
        }
        return acc;
      },
      {} as Record<string, string>
    );
  }, [config]);

  return (
    <style jsx global>{`
      [data-chart${id ? `="${id}"` : ""}] {
        ${Object.entries(cssVars)
          .map(([key, value]) => `${key}: ${value};`)
          .join("\n")}
      }
    `}</style>
  );
}

export interface ChartContainerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  id?: string;
  config?: ChartConfig;
}

export const ChartContainer = React.forwardRef<
  HTMLDivElement,
  ChartContainerProps
>(({ id, config, className, ...props }, ref) => {
  return <div ref={ref} data-chart={id} className={className} {...props} />;
});
ChartContainer.displayName = "ChartContainer";

export interface ChartTooltipProps {
  children?: React.ReactNode;
  cursor?: boolean;
  content?: React.ReactNode;
}

export function ChartTooltip({ children, ...props }: ChartTooltipProps) {
  return <>{children}</>;
}

export interface ChartTooltipContentProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: {
      [key: string]: any;
    };
  }>;
  label?: string;
  labelFormatter?: (label: string) => string;
  valueFormatter?: (value: number) => string;
  indicator?: "dot" | "line";
  hideLabel?: boolean;
}

export function ChartTooltipContent({
  active,
  payload,
  label,
  labelFormatter,
  valueFormatter,
  indicator = "line",
  hideLabel = false,
}: ChartTooltipContentProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const formattedLabel = labelFormatter ? labelFormatter(label || "") : label;

  return (
    <div className="rounded-lg border bg-background p-2 shadow-sm">
      {!hideLabel && formattedLabel ? (
        <div className="border-b px-2 py-1 text-sm font-medium">
          {formattedLabel}
        </div>
      ) : null}
      <div className="px-2 py-1">
        {payload.map((item, index) => {
          const formattedValue = valueFormatter
            ? valueFormatter(item.value)
            : item.value.toLocaleString();

          return (
            <div key={index} className="flex items-center gap-2 text-sm">
              {indicator === "dot" ? (
                <span
                  className="h-2 w-2 rounded-full"
                  style={{
                    backgroundColor: `var(--color-${item.name})`,
                  }}
                />
              ) : (
                <span
                  className="h-2 w-4 rounded-sm"
                  style={{
                    backgroundColor: `var(--color-${item.name})`,
                  }}
                />
              )}
              <span className="font-medium">{item.name}:</span>
              <span>{formattedValue}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export interface ChartLegendProps {
  content?: React.ReactNode;
}

export function ChartLegend({ content }: ChartLegendProps) {
  return <>{content}</>;
}

export interface ChartLegendContentProps {
  payload?: Array<{
    value: string;
    color: string;
    payload: {
      fill: string;
      stroke: string;
      dataKey: string;
    };
  }>;
}

export function ChartLegendContent({ payload }: ChartLegendContentProps) {
  if (!payload?.length) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
      {payload.map((entry, index) => {
        const dataKey = entry.payload.dataKey;
        return (
          <div
            key={`item-${index}`}
            className="flex items-center gap-1 text-sm"
          >
            <div
              className="h-2 w-4 rounded-sm"
              style={{
                backgroundColor: `var(--color-${dataKey})`,
              }}
            />
            <span>{entry.value}</span>
          </div>
        );
      })}
    </div>
  );
}
