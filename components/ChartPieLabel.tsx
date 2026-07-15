'use client';

import * as React from 'react';
import { Pie, PieChart, Label, Cell } from 'recharts';
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

const formatCompact = (num: number) => {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 2,
  }).format(num);
};

type ConvertedTypeData = {
  type: string;
  total: number;
  breakdown: Record<string, number>;
};

export function ChartPieLabel({ data }: { data: ConvertedTypeData[] }) {
  const id = 'pie-types-interactive';
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);

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

  const totalValue = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.value, 0);
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
      <CardContent className='flex-1 flex flex-col 2xl:flex-row items-center justify-center gap-8 2xl:gap-12 p-6'>
        <div className='w-full 2xl:w-[500px] flex justify-center'>
          <ChartContainer
            id={id}
            config={dynamicChartConfig}
            className='mx-auto aspect-square h-[300px] md:h-[300px] lg:h-[350px] 2xl:h-[600px] w-full max-w-[500px] [&_.recharts-pie-label-text]:fill-foreground [&_.recharts-pie-label-text]:text-[10px] md:[&_.recharts-pie-label-text]:text-xs [&_.recharts-pie-label-text]:font-medium'
          >
            <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <Pie
                data={chartData}
                dataKey='value'
                nameKey='name'
                innerRadius="50%"
                outerRadius="80%"
                strokeWidth={2}
                stroke='hsl(var(--background))'
                labelLine={true}
                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.fill}
                    opacity={activeIndex === null || activeIndex === index ? 1 : 0.4}
                    style={{
                      transition: 'opacity 0.2s',
                      cursor: 'pointer',
                    }}
                  />
                ))}
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
                            y={viewBox.cy}
                            className='fill-foreground text-3xl font-bold'
                          >
                            {formatCompact(totalValue)}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className='fill-muted-foreground text-sm'
                          >
                            Total Wealth
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        </div>

        <div className='flex flex-col gap-3 w-full max-w-[500px] mx-auto 2xl:mx-0 2xl:max-w-[370px] overflow-y-auto pr-2'>
          {chartData.map((item, index) => {
            const isHovered = activeIndex === index;
            const isFaded = activeIndex !== null && activeIndex !== index;

            return (
              <div
                key={item.type}
                className={`flex flex-col gap-2 p-3 rounded-lg border transition-all duration-200 ${
                  isHovered
                    ? 'bg-muted shadow-sm scale-[1.02]'
                    : isFaded
                    ? 'opacity-40 bg-background'
                    : 'bg-background'
                }`}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                style={{ cursor: 'pointer' }}
              >
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <div
                      className='h-3 w-3 rounded-full shrink-0'
                      style={{ backgroundColor: item.fill }}
                    />
                    <span className='font-semibold text-sm'>
                      {item.name}
                    </span>
                  </div>
                  <span className='text-sm font-bold'>
                    {((item.value / totalValue) * 100).toFixed(0)}%
                  </span>
                </div>

                <div className='flex justify-between items-center text-sm'>
                  <span className='text-muted-foreground'>Total (MDL)</span>
                  <span className='font-medium'>
                    {formatAmount(item.value, 'MDL')}
                  </span>
                </div>

                {Object.keys(item.breakdown || {}).length > 0 && (
                  <div className='flex flex-col gap-1 mt-1 pt-2 border-t'>
                    {Object.entries(item.breakdown).map(([curr, amt]: any) => (
                      <div key={curr} className='flex justify-between text-xs'>
                        <span className='text-muted-foreground'>{curr}:</span>
                        <span>{formatAmount(amt, curr)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

