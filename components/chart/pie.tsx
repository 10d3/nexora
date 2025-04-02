"use client";

import * as React from "react";
// import { TrendingUp } from "lucide-react";
import { Label, Pie, PieChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
//   CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "../ui/skeleton";

interface InteractivePieChartProps {
  title: string;
  description: string;
  data: Array<{ name: string; value: number; fill?: string }>;
  isLoading?: boolean;
  error?: Error | null;
}

export function PieTest({
  title,
  description,
  data,
  isLoading,
  error,
}: InteractivePieChartProps) {
  const chartConfigGenerated = React.useMemo(() => {
    const config: ChartConfig = {};

    config.visitors = {
      label: "Visitors",
    };

    data.forEach((item, index) => {
      config[item.name] = {
        label: item.name.charAt(0).toUpperCase() + item.name.slice(1),
        color: item.fill || `hsl(var(--chart-${index + 1}))`,
      };
    });

    return config satisfies ChartConfig;
  }, [data]);

  console.log("chartConfigGenerated", chartConfigGenerated);

  const dataFormatted = React.useMemo(() => {
    const formattedData = [];

    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      const fill = item.fill || `hsl(var(--chart-${i + 1}))`;

      formattedData.push({
        name: item.name,
        value: item.value,
        fill,
      });
    }

    return formattedData;
  }, [data]);

  const totalVisitors = React.useMemo(() => {
    return dataFormatted.reduce((acc, curr) => acc + curr.value, 0);
  }, [dataFormatted]);

  console.log("dataFormatted", dataFormatted);

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

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfigGenerated}
          className="mx-auto aspect-square max-h-[250px]"
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
                          {totalVisitors.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Tables
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
      {/* <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total visitors for the last 6 months
        </div>
      </CardFooter> */}
    </Card>
  );
}
