"use client";

import * as React from "react";
import { Label, Pie, PieChart, Sector } from "recharts";
import type { PieSectorDataItem } from "recharts/types/polar/Pie";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/chart/chart-config";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

interface InteractivePieChartProps {
  title: string;
  description: string;
  data: Array<{ name: string; value: number; fill?: string }>;
  isLoading?: boolean;
  error?: Error | null;
}

export function InteractivePieChart({
  title,
  description,
  data,
  isLoading,
  error,
}: InteractivePieChartProps) {
  const id = React.useId();
  const [activeItem, setActiveItem] = React.useState<string | null>(null);

  console.log("data from pie chart", data);

  // Set the first item as active by default when data loads
  React.useEffect(() => {
    if (data?.length && !activeItem) {
      setActiveItem(data[0].name);
    }
  }, [data, activeItem]);

  const activeIndex = React.useMemo(
    () => data.findIndex((item) => item.name === activeItem),
    [data, activeItem]
  );

  const items = React.useMemo(() => data.map((item) => item.name), [data]);

  // Generate chart config from data
  const chartConfig = React.useMemo(() => {
    const config: ChartConfig = {};

    config.visitors = {
      label: "Tables",
    };

    data.forEach((item, index) => {
      config[item.name] = {
        label: item.name.charAt(0).toUpperCase() + item.name.slice(1),
        color: item.fill || `hsl(var(--chart-${index + 1}))`,
      };
    });

    return config satisfies ChartConfig;
  }, [data]);

  console.log("chart config", chartConfig);

  const dataFormatted = React.useMemo(() => {
    const formattedData = [];

    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      const fill = item.fill || `hsl(var(--chart-${i + 1}))`;

      formattedData.push({
        name: item.name,
        value: item.value ,
        fill,
      });
    }

    return formattedData;
  }, [data]);

  console.log("data formatted", dataFormatted);

  if (isLoading) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="flex-row items-start space-y-0 pb-0">
          <div className="grid gap-1">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-60" />
          </div>
          <Skeleton className="ml-auto h-8 w-[130px]" />
        </CardHeader>
        <CardContent className="flex flex-1 justify-center pb-0">
          <Skeleton className="mx-auto aspect-square w-full max-w-[300px] rounded-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-10">
          <p className="text-destructive">Error loading chart data</p>
        </CardContent>
      </Card>
    );
  }

  if (!data.length) {
    return (
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-10">
          <p className="text-muted-foreground">No data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-chart={id} className="flex flex-col">
      <ChartStyle id={id} config={chartConfig} />
      <CardHeader className="flex-row items-start space-y-0 pb-0">
        <div className="grid gap-1">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <Select value={activeItem || undefined} onValueChange={setActiveItem}>
          <SelectTrigger
            className="ml-auto h-7 w-[130px] rounded-lg pl-2.5"
            aria-label="Select a category"
          >
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent align="end" className="rounded-xl">
            {items.map((key) => {
              const config = chartConfig[key as keyof typeof chartConfig];

              if (!config) {
                return null;
              }

              return (
                <SelectItem
                  key={key}
                  value={key}
                  className="rounded-lg [&_span]:flex"
                >
                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className="flex h-3 w-3 shrink-0 rounded-sm"
                      style={{
                        backgroundColor: `var(--color-${key})`,
                      }}
                    />
                    {config?.label}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="flex flex-1 justify-center pb-0">
        <ChartContainer
          id={id}
          config={chartConfig}
          className="mx-auto aspect-square w-full max-w-[300px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={dataFormatted}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              strokeWidth={5}
              activeIndex={activeIndex}
              activeShape={({
                outerRadius = 0,
                ...props
              }: PieSectorDataItem) => (
                <g>
                  <Sector {...props} outerRadius={outerRadius + 10} />
                  <Sector
                    {...props}
                    outerRadius={outerRadius + 25}
                    innerRadius={outerRadius + 12}
                  />
                </g>
              )}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {activeIndex >= 0
                            ? dataFormatted[activeIndex].value.toLocaleString()
                            : 0}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          {activeIndex >= 0 ? dataFormatted[activeIndex].name : ""}
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
