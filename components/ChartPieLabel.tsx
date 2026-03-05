'use client';

import * as React from 'react';
import { Label, Pie, PieChart, Sector } from 'recharts';
import { PieSectorDataItem } from 'recharts/types/polar/Pie';
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
import { Item, ItemContent, ItemMedia, ItemTitle } from '@/components/ui/item';
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

  const totalValue = React.useMemo(() => {
    return data.reduce((sum, item) => sum + item.total, 0);
  }, [data]);

  const [activeIndex, setActiveIndex] = React.useState<number | undefined>(
    undefined,
  );

  const chartData = React.useMemo(() => {
    return data
      .filter((item) => item.total > 0)
      .map((item, index) => ({
        ...item,
        name: formatInvestmentType(item.type),
        value: item.total, // Using converted total for proportions
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
          <CardTitle className='text-xl lg:text-2xl'>
            Investments by Type
          </CardTitle>
          <CardDescription className='lg:text-base'>
            No investment data available.
          </CardDescription>
        </CardHeader>
        <CardContent className='flex-1 flex items-center justify-center'>
          <p className='text-muted-foreground'>
            Add investments to see distribution.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      data-chart={id}
      className='flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-md'
    >
      <ChartStyle id={id} config={dynamicChartConfig} />
      <CardHeader className='items-start pb-0'>
        <CardTitle className='text-xl lg:text-2xl'>
          Investments by Type
        </CardTitle>
        <CardDescription className='lg:text-base'>
          Portfolio distribution in MDL equivalent
        </CardDescription>
      </CardHeader>
      <CardContent className='flex-1 pb-0 flex flex-col items-center justify-center relative min-h-[300px]'>
        <ChartContainer
          id={id}
          config={dynamicChartConfig}
          className='mx-auto aspect-square h-[250px] md:h-[280px] lg:h-[350px] 2xl:h-[600px] w-full max-w-[600px]'
        >
          <PieChart>
            <ChartTooltip cursor={false} content={<CustomTooltip />} />
            <Pie
              data={chartData}
              dataKey='value'
              nameKey='name'
              innerRadius={65}
              strokeWidth={8}
              stroke='hsl(var(--background))'
              paddingAngle={2}
              activeIndex={activeIndex}
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(undefined)}
              activeShape={({
                outerRadius = 0,
                ...props
              }: PieSectorDataItem) => (
                <g>
                  <Sector {...props} outerRadius={outerRadius + 8} />
                  <Sector
                    {...props}
                    outerRadius={outerRadius + 15}
                    innerRadius={outerRadius + 10}
                  />
                </g>
              )}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor='middle'
                        dominantBaseline='middle'
                      >
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) - 5}
                          className='fill-foreground text-xl md:text-2xl lg:text-3xl font-bold'
                        >
                          {totalValue > 1000000
                            ? `${(totalValue / 1000000).toFixed(2)}M`
                            : totalValue.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 20}
                          className='fill-muted-foreground text-xs md:text-sm font-medium'
                        >
                          Total MDL Eq.
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
      <CardFooter className='pt-0'>
        <div className='flex flex-wrap justify-center gap-2 w-full'>
          {chartData.map((item, index) => (
            <div
              key={item.type}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-all cursor-default ${
                activeIndex === index
                  ? 'bg-muted ring-1 ring-border'
                  : 'opacity-80 hover:opacity-100'
              }`}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(undefined)}
            >
              <div
                className='h-2 w-2 rounded-full shrink-0'
                style={{ backgroundColor: item.fill }}
              />
              <span className='text-[10px] lg:text-xs font-semibold'>
                {Math.round((item.value / totalValue) * 100)}%
              </span>
              <span className='text-[10px] lg:text-xs text-muted-foreground'>
                {item.name}
              </span>
            </div>
          ))}
        </div>
      </CardFooter>
    </Card>
  );
}
