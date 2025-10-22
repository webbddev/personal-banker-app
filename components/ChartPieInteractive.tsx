'use client';

import * as React from 'react';
import { Label, Pie, PieChart, Sector } from 'recharts';
import { PieSectorDataItem } from 'recharts/types/polar/Pie';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

export const description = 'An interactive pie chart for currency exposure';

interface ChartPieInteractiveProps {
  data: Record<string, number>;
}

export function ChartPieInteractive({ data }: ChartPieInteractiveProps) {
  const id = 'pie-interactive';

  const chartData = React.useMemo(() => {
    return Object.entries(data).map(([currency, amount], index) => ({
      currency,
      amount,
      fill: `hsl(var(--chart-${index + 1}))`,
    }));
  }, [data]);

  const [activeCurrency, setActiveCurrency] = React.useState(
    chartData[0]?.currency
  );

  React.useEffect(() => {
    if (chartData.length > 0 && !activeCurrency) {
      setActiveCurrency(chartData[0].currency);
    }
  }, [chartData, activeCurrency]);

  const activeIndex = React.useMemo(
    () => chartData.findIndex((item) => item.currency === activeCurrency),
    [activeCurrency, chartData]
  );
  const currencies = React.useMemo(
    () => chartData.map((item) => item.currency),
    [chartData]
  );

  const dynamicChartConfig = React.useMemo(() => {
    const config: ChartConfig = {
      amount: {
        label: 'Amount',
      },
    };
    chartData.forEach((item) => {
      config[item.currency] = {
        label: item.currency,
        color: item.fill,
      };
    });
    return config;
  }, [chartData]);

  if (chartData.length === 0) {
    return (
      <Card className='flex flex-col h-full'>
        <CardHeader className='items-start pb-0'>
          <CardTitle>Currency Exposure</CardTitle>
          <CardDescription>No investment data to display.</CardDescription>
        </CardHeader>
        <CardContent className='flex-1 flex items-center justify-center pb-0'>
          <p className='text-muted-foreground'>
            Add investments to see currency exposure.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-chart={id} className='flex flex-col h-full'>
      <ChartStyle id={id} config={dynamicChartConfig} />
      <CardHeader className='items-start pb-0'>
        <CardTitle>Currency Exposure</CardTitle>
        <CardDescription>
          Distribution of investments by currency
        </CardDescription>
      </CardHeader>
      <CardContent className='flex-1 flex flex-col md:flex-row items-center justify-center p-4 gap-8'>
        <ChartContainer
          id={id}
          config={dynamicChartConfig}
          className='mx-auto aspect-square h-[200px] md:h-[200px] lg:h-[250px] 2xl:h-[600px] w-full max-w-[650px]'
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey='amount'
              nameKey='currency'
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
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    const activeData = chartData[activeIndex];
                    if (!activeData) return null;
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor='middle'
                        dominantBaseline='middle'
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className='fill-foreground text-3xl font-bold'
                        >
                          {activeData.amount.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className='fill-muted-foreground'
                        >
                          {activeData.currency}
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>

        {/* Currencies list */}
        <div className='flex flex-row md:flex-col gap-2'>
          {currencies.map((key) => {
            const config =
              dynamicChartConfig[key as keyof typeof dynamicChartConfig];
            if (!config) {
              return null;
            }
            const isActive = activeCurrency === key;
            return (
              <div
                key={key}
                className={`flex items-center gap-2 cursor-pointer p-2 rounded-lg ${
                  isActive ? 'bg-muted' : 'hover:bg-muted/50'
                }`}
                onClick={() => setActiveCurrency(key)}
              >
                <span
                  className='flex h-3 w-3 shrink-0 rounded-sm'
                  style={{
                    backgroundColor: config.color,
                  }}
                />
                <div className='flex-1'>
                  <div className='font-medium leading-none'>{config.label}</div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
