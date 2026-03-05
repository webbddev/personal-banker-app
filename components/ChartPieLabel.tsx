'use client';

import * as React from 'react';
import { Pie, PieChart } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartStyle,
  ChartTooltip,
} from '@/components/ui/chart';
import { formatAmount } from '@/utils/currency-formatter';

// Helper function to add spaces between camelCase words
const formatInvestmentType = (type: string) => {
  return type
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

type ConvertedTypeData = {
  type: string;
  total: number;
  breakdown: Record<string, number>;
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;

    return (
      <div className='flex flex-col gap-2 rounded-lg bg-background p-3 shadow-md border text-xs lg:text-sm min-w-[160px]'>
        <div className='flex items-center gap-2 border-b pb-1 mb-1'>
          <div
            className='h-2 w-2 rounded-full'
            style={{ backgroundColor: data.fill }}
          />
          <span className='font-bold'>{formatInvestmentType(data.type)}</span>
        </div>
        <div className='flex flex-col gap-1'>
          <div className='flex justify-between items-center text-muted-foreground gap-4'>
            <span>Equivalent:</span>
            <span className='font-semibold text-foreground whitespace-nowrap'>
              {formatAmount(data.total, 'MDL')}
            </span>
          </div>
          <div className='h-px bg-muted my-1' />
          {Object.entries(data.breakdown || {}).map(([curr, amt]: any) => (
            <div
              key={curr}
              className='flex justify-between items-center text-[10px] lg:text-xs'
            >
              <span className='text-muted-foreground'>{curr}:</span>
              <span>{formatAmount(amt, curr)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export function ChartPieLabel({ data }: { data: ConvertedTypeData[] }) {
  const id = 'pie-types-interactive';

  const chartData = React.useMemo(() => {
    return data
      .filter((item) => item.total > 0)
      .map((item, index) => ({
        ...item,
        name: formatInvestmentType(item.type),
        value: item.total,
        fill: `hsl(var(--chart-${index + 1}))`,
      }));
  }, [data]);

  const dynamicChartConfig = React.useMemo(() => {
    const config: ChartConfig = {
      value: { label: 'Amount' },
    };
    chartData.forEach((item) => {
      config[item.type] = {
        label: item.name,
        color: item.fill,
      };
    });
    return config;
  }, [chartData]);

  if (chartData.length === 0) {
    return (
      <Card className='flex flex-col h-full'>
        <CardHeader className='items-start pb-0'>
          <CardTitle>Investments by Type</CardTitle>
          <CardDescription>Portfolio distribution in MDL</CardDescription>
        </CardHeader>
        <CardContent className='flex-1 flex items-center justify-center p-6'>
          <p className='text-muted-foreground'>No investment data available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-chart={id} className='flex flex-col h-full'>
      <ChartStyle id={id} config={dynamicChartConfig} />
      <CardHeader className='items-start pb-0'>
        <CardTitle>Investments by Type</CardTitle>
        <CardDescription>
          Portfolio distribution in MDL equivalent
        </CardDescription>
      </CardHeader>
      <CardContent className='flex-1 pb-0 flex flex-col items-center justify-center relative min-h-[300px]'>
        <ChartContainer
          id={id}
          config={dynamicChartConfig}
          className='mx-auto aspect-square h-[250px] md:h-[280px] lg:h-[350px] 2xl:h-[600px] w-full max-w-[500px] [&_.recharts-pie-label-text]:fill-foreground [&_.recharts-pie-label-text]:text-[10px] md:[&_.recharts-pie-label-text]:text-xs 2xl:[&_.recharts-pie-label-text]:text-sm [&_.recharts-pie-label-text]:font-medium'
        >
          <PieChart>
            <ChartTooltip cursor={false} content={<CustomTooltip />} />
            <Pie
              data={chartData}
              dataKey='value'
              nameKey='name'
              label={({ name, percent }) =>
                `${name} (${(percent * 100).toFixed(0)}%)`
              }
              innerRadius={0}
              stroke='hsl(var(--background))'
              strokeWidth={2}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className='flex-col gap-2 pt-4'>
        <div className='leading-none text-muted-foreground text-xs 2xl:text-base text-center italic'>
          Hover for currency breakdown
        </div>
        <div className='flex flex-wrap justify-center gap-2 w-full mt-2'>
          {chartData.map((item) => (
            <div
              key={item.type}
              className='flex items-center gap-1.5 px-2 py-1'
            >
              <div
                className='h-2 w-2 rounded-full shrink-0'
                style={{ backgroundColor: item.fill }}
              />
              <span className='text-[10px] lg:text-xs 2xl:text-sm text-muted-foreground font-medium'>
                {item.name}
              </span>
            </div>
          ))}
        </div>
      </CardFooter>
    </Card>
  );
}
