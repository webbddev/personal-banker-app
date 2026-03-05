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
import {
  formatAmount,
  convertCurrency,
  ExchangeRates,
  SupportedCurrencyCode,
} from '@/utils/currency-formatter';

interface ChartPieInteractiveProps {
  data: Record<string, number>;
  exchangeRates: ExchangeRates;
}

export function ChartPieInteractive({
  data,
  exchangeRates,
}: ChartPieInteractiveProps) {
  const id = 'pie-currency-interactive';

  const chartData = React.useMemo(() => {
    return Object.entries(data)
      .filter(([, amount]) => amount > 0)
      .map(([currency, amount], index) => {
        const valueInMDL = convertCurrency(
          amount,
          currency as SupportedCurrencyCode,
          'MDL',
          exchangeRates,
        );
        return {
          currency,
          amount,
          valueInMDL,
          fill: `hsl(var(--chart-${index + 1}))`,
        };
      })
      .sort((a, b) => b.valueInMDL - a.valueInMDL);
  }, [data, exchangeRates]);

  const [activeIndex, setActiveIndex] = React.useState<number | undefined>(
    undefined,
  );

  const totalMDLValue = React.useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.valueInMDL, 0);
  }, [chartData]);

  const dynamicChartConfig = React.useMemo(() => {
    const config: ChartConfig = {
      amount: { label: 'Original Amount' },
      valueInMDL: { label: 'MDL Equivalent' },
    };
    chartData.forEach((item) => {
      config[item.currency] = {
        label: item.currency,
        color: item.fill,
      };
    });
    return config;
  }, [chartData]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        // 1. Increased min-width to 180px to accommodate larger numbers
        <div className='flex flex-col gap-2 rounded-lg bg-background p-3 shadow-md border text-xs lg:text-sm min-w-[180px]'>
          <div className='flex items-center gap-2 border-b pb-2 mb-1'>
            <div
              className='h-2 w-2 rounded-full'
              style={{ backgroundColor: data.fill }}
            />
            <span className='font-bold'>{data.currency} Exposure</span>
          </div>

          <div className='flex flex-col gap-1.5'>
            {/* 2. Added gap-4 and w-20 for consistent label spacing */}
            <div className='flex justify-between items-center gap-4'>
              <span className='text-muted-foreground w-20'>Original:</span>
              <span className='font-medium text-right flex-1'>
                {formatAmount(data.amount, data.currency)}
              </span>
            </div>

            <div className='flex justify-between items-center gap-4'>
              <span className='text-muted-foreground w-20'>MDL Eq:</span>
              <span className='font-medium text-right flex-1'>
                {formatAmount(data.valueInMDL, 'MDL')}
              </span>
            </div>

            <div className='h-px bg-muted my-1' />

            <div className='flex justify-between items-center gap-4 text-blue-600 font-bold'>
              <span className='w-20'>Weight:</span>
              <span className='text-right flex-1'>
                {((data.valueInMDL / totalMDLValue) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return (
      <Card className='flex flex-col h-full'>
        <CardHeader className='items-start pb-0'>
          <CardTitle className='text-xl lg:text-2xl'>
            Currency Exposure
          </CardTitle>
          <CardDescription className='lg:text-base'>
            No currency data available.
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
        <CardTitle className='text-xl lg:text-2xl'>Currency Exposure</CardTitle>
        <CardDescription className='lg:text-base'>
          Unified portfolio weight by currency
        </CardDescription>
      </CardHeader>
      <CardContent className='flex-1 pb-0 flex flex-col items-center justify-center relative min-h-[300px]'>
        <ChartContainer
          id={id}
          config={dynamicChartConfig}
          className='mx-auto aspect-square h-[250px] md:h-[280px] lg:h-[350px] 2xl:h-[600px] w-full max-w-[500px]'
        >
          <PieChart>
            <ChartTooltip cursor={false} content={<CustomTooltip />} />
            <Pie
              data={chartData}
              dataKey='valueInMDL'
              nameKey='currency'
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
                          className='fill-foreground text-xl md:text-2xl lg:text-3xl 2xl:text-3xl font-bold'
                        >
                          {totalMDLValue > 1000000
                            ? `${(totalMDLValue / 1000000).toFixed(2)}M`
                            : totalMDLValue.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 20}
                          className='fill-muted-foreground text-xs md:text-sm 2xl:text-lg font-medium'
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
      </CardContent>
      <CardFooter className='pt-0'>
        <div className='flex flex-wrap justify-center gap-2 w-full'>
          {chartData.map((item, index) => (
            <div
              key={item.currency}
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
              <span className='text-[10px] lg:text-xs 2xl:text-sm font-bold'>
                {Math.round((item.valueInMDL / totalMDLValue) * 100)}%
              </span>
              <span className='text-[10px] lg:text-xs 2xl:text-sm text-muted-foreground font-medium'>
                {item.currency}
              </span>
            </div>
          ))}
        </div>
      </CardFooter>
    </Card>
  );
}
