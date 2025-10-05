'use client';

import * as React from 'react';
import { Pie, PieChart, Legend } from 'recharts';
import { Investment } from '@prisma/client';

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

interface ChartData {
  type: string;
  value: number;
  investments?: Investment[];
  count?: number;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;

    return (
      <div className='flex flex-col gap-1 rounded-lg bg-background p-2 shadow-sm border'>
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
      <CardHeader className='items-center pb-0'>
        <CardTitle>Investments by Type</CardTitle>
        <CardDescription>
          Your investment portfolio distribution
        </CardDescription>
      </CardHeader>
      <CardContent className='flex-1 pb-0 flex items-center justify-center'>
        <ChartContainer
          config={chartConfig}
          className='[&_.recharts-pie-label-text]:fill-foreground w-full h-full'
        >
          <PieChart>
            <ChartTooltip content={<CustomTooltip />} />
            <Pie
              data={chartData}
              dataKey='value'
              label={({ percentage }) => `${percentage}%`}
              nameKey='name'
            />
            <Legend
              verticalAlign='middle'
              align='right'
              layout='vertical'
              iconType='circle'
              wrapperStyle={{ paddingLeft: '20px' }}
              formatter={(value) => value}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className='flex-col gap-2 text-sm'>
        <div className='text-muted-foreground leading-none'>
          Percentage distribution across investment categories.
        </div>
      </CardFooter>
    </Card>
  );
}
