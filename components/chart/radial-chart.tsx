/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { TrendingUp } from "lucide-react";
import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/chart/chart-config";
import { Skeleton } from "@/components/ui/skeleton";

interface RadialChartProps {
  title: string;
  description: string;
  data: Array<{ name: string; [key: string]: any }>;
  dataKeys: string[];
  centerLabel: string;
  centerValue: number;
  trendingValue?: number;
  trendingLabel?: string;
  footerText?: string;
  isLoading?: boolean;
  error?: Error | null;
}

export function RadialChart({
  title,
  description,
  data,
  dataKeys,
  centerLabel,
  centerValue,
  trendingValue,
  trendingLabel,
  footerText,
  isLoading,
  error,
}: RadialChartProps) {
  // Generate chart config from dataKeys
  const chartConfig = dataKeys.reduce((acc, key, index) => {
    acc[key] = {
      label: key.charAt(0).toUpperCase() + key.slice(1),
      color: `hsl(${index * 60 + 200}, 70%, 50%)`,
    };
    return acc;
  }, {} as ChartConfig);

  if (isLoading) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-60" />
        </CardHeader>
        <CardContent className="flex flex-1 items-center pb-0">
          <Skeleton className="mx-auto aspect-square w-full max-w-[250px] rounded-full" />
        </CardContent>
        <CardFooter className="flex-col gap-2 text-sm">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-60" />
        </CardFooter>
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
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 items-center pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square w-full max-w-[250px]"
        >
          <RadialBarChart
            data={data}
            endAngle={180}
            innerRadius={80}
            outerRadius={130}
          >
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) - 16}
                          className="fill-foreground text-2xl font-bold"
                        >
                          {centerValue.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 4}
                          className="fill-muted-foreground"
                        >
                          {centerLabel}
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </PolarRadiusAxis>
            {dataKeys.map((key, index) => (
              <RadialBar
                key={key}
                dataKey={key}
                stackId="a"
                cornerRadius={5}
                fill={`var(--color-${key})`}
                className="stroke-transparent stroke-2"
              />
            ))}
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      {(trendingValue || footerText) && (
        <CardFooter className="flex-col gap-2 text-sm">
          {trendingValue && (
            <div className="flex items-center gap-2 font-medium leading-none">
              {trendingLabel || "Trending"} {trendingValue > 0 ? "up" : "down"}{" "}
              by {Math.abs(trendingValue)}% this month{" "}
              <TrendingUp
                className={`h-4 w-4 ${trendingValue < 0 ? "rotate-180" : ""}`}
              />
            </div>
          )}
          {footerText && (
            <div className="leading-none text-muted-foreground">
              {footerText}
            </div>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
