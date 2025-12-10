'use client';

import * as React from 'react';
import { Pie, PieChart } from 'recharts';
// import { Investment } from '@prisma/client';
import { Investment } from '@/prisma/generated/prisma/client';


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
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Item, ItemContent, ItemMedia, ItemTitle } from '@/components/ui/item';

export const description = 'A pie chart with a label for investments by type';

// Helper function to add spaces between camelCase words
const formatInvestmentType = (type: string) => {
  return type
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

type ChartData = {
  type: string;
  value: number;
  investments?: Investment[];
  count?: number;
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;

    return (
      <div className='flex flex-col gap-1 rounded-lg bg-background p-2 shadow-sm border text-sm lg:text-base'>
        <span className='font-bold'>{formatInvestmentType(data.type)}</span>
        <span>Amount: {data.value.toLocaleString()}</span>
      </div>
    );
  }
  return null;
};

export function ChartPieLabel({ data }: { data: ChartData[] }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  const chartData = data.map((item, index) => ({
    ...item,
    name: formatInvestmentType(item.type),
    percentage: total > 0 ? ((item.value / total) * 100).toFixed(1) : '0.0',
    fill: `hsl(var(--chart-${index + 1}))`,
  }));

  const config: ChartConfig = {
    value: {
      label: 'Amount',
    },
  };
  data.forEach((item, index) => {
    config[item.type] = {
      label: formatInvestmentType(item.type),
      color: `hsl(var(--chart-${index + 1}))`,
    };
  });
  const chartConfig = config satisfies ChartConfig;

  return (
    <Card className='flex flex-col h-full'>
      <CardHeader className='items-start pb-0'>
        <CardTitle className='text-xl lg:text-2xl'>
          Investments by Type
        </CardTitle>
        <CardDescription className='lg:text-base'>
          Investment portfolio distribution across investment categories
        </CardDescription>
      </CardHeader>
      <CardContent className='flex-1 pb-0 flex flex-col items-center justify-center'>
        <ChartContainer
          config={chartConfig}
          className='[&_.recharts-pie-label-text]:fill-foreground [&_.recharts-pie-label-text]:text-xs [&_.recharts-pie-label-text]:lg:text-sm [&_.recharts-pie-label-text]:font-bold mx-auto aspect-square h-[250px] md:h-[250px] lg:h-[320px] 2xl:h-[500px] w-full max-w-[500px] '
        >
          <PieChart>
            <ChartTooltip content={<CustomTooltip />} />
            <Pie
              data={chartData}
              dataKey='value'
              label={({ percentage }) => `${percentage}%`}
              nameKey='name'
              labelLine={true}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        {/* Custom Legend - matching ChartBarInteractive style */}
        <div className='mx-auto mt-2 flex justify-center flex-wrap gap-y-0'>
          {chartData.map((item, index) => (
            <Item key={`legend-${index}`} variant='default' size='xs'>
              <ItemMedia>
                <div
                  className='h-3 w-3 rounded-sm'
                  style={{ backgroundColor: item.fill }}
                />
              </ItemMedia>
              <ItemContent>
                <ItemTitle className='text-xs lg:text-sm'>
                  {item.name}
                </ItemTitle>
              </ItemContent>
            </Item>
          ))}
        </div>
      </CardFooter>
    </Card>
  );
}
