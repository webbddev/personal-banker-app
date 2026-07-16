'use client';

import * as React from 'react';
import Image from 'next/image';
import { Label, Pie, PieChart, Cell, Sector } from 'recharts';
import { PieSectorDataItem } from 'recharts/types/polar/Pie';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartStyle } from '@/components/ui/chart';
import {
  formatAmount,
  convertCurrency,
  ExchangeRates,
  SupportedCurrencyCode,
} from '@/utils/currency-formatter';

// Метаданные для отображения валют и флагов
const currencyInfo: Record<
  string,
  { name: string; flag: string; symbol: string }
> = {
  MDL: { name: 'Moldovan leu', flag: '/flags/md.svg', symbol: 'MDL' },
  USD: { name: 'US Dollar', flag: '/flags/us.svg', symbol: 'USD' },
  EUR: { name: 'Euro', flag: '/flags/eu.svg', symbol: 'EUR' },
  GBP: { name: 'British pound', flag: '/flags/gb.svg', symbol: 'GBP' },
};

const formatCompact = (num: number) => {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 2,
  }).format(num);
};

interface ChartPieInteractiveProps {
  data: Record<string, number>;
  exchangeRates: ExchangeRates;
}

export function ChartPieInteractive({
  data,
  exchangeRates,
}: ChartPieInteractiveProps) {
  const id = 'pie-currency-interactive';
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);

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
                dataKey='valueInMDL'
                nameKey='currency'
                innerRadius='50%'
                outerRadius='80%'
                strokeWidth={2}
                stroke='hsl(var(--background))'
                paddingAngle={0}
                labelLine={true}
                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                activeShape={({
                  outerRadius = 0,
                  ...props
                }: PieSectorDataItem) => (
                  <g style={{ filter: 'drop-shadow(0 0 8px rgba(0,0,0,0.2))' }}>
                    <Sector {...props} outerRadius={outerRadius * 1.03} />
                  </g>
                )}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.fill}
                    opacity={
                      activeIndex === null || activeIndex === index ? 1 : 0.4
                    }
                    style={{
                      transition: 'opacity 0.2s, transform 0.2s',
                      cursor: 'pointer',
                    }}
                  />
                ))}
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                      const activeItem =
                        activeIndex !== null ? chartData[activeIndex] : null;
                      const percentage = activeItem
                        ? Math.round(
                            (activeItem.valueInMDL / totalMDLValue) * 100,
                          )
                        : 0;

                      return (
                        <g>
                          {!activeItem ? (
                            <text
                              x={viewBox.cx}
                              y={viewBox.cy}
                              textAnchor='middle'
                              dominantBaseline='middle'
                              style={{ transition: 'opacity 0.3s ease' }}
                            >
                              <tspan
                                x={viewBox.cx}
                                y={viewBox.cy}
                                className='fill-foreground text-3xl font-bold'
                              >
                                {formatCompact(totalMDLValue)}
                              </tspan>
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 24}
                                className='fill-muted-foreground text-sm'
                              >
                                Total Wealth
                              </tspan>
                            </text>
                          ) : (
                            <text
                              x={viewBox.cx}
                              y={viewBox.cy}
                              textAnchor='middle'
                              dominantBaseline='middle'
                              style={{ transition: 'opacity 0.3s ease' }}
                            >
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) - 12}
                                className='fill-foreground text-lg md:text-xl lg:text-2xl 2xl:text-2xl font-bold'
                              >
                                {formatAmount(
                                  activeItem.amount,
                                  activeItem.currency as SupportedCurrencyCode,
                                )}
                              </tspan>
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 22}
                                className='fill-muted-foreground text-xs md:text-sm lg:text-sm 2xl:text-sm font-medium'
                              >
                                {percentage}% of total
                              </tspan>
                            </text>
                          )}
                        </g>
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
            const percentage = Math.round(
              (item.valueInMDL / totalMDLValue) * 100,
            );
            const info = currencyInfo[item.currency];

            return (
              <div
                key={item.currency}
                className={`flex flex-col gap-2 p-3 rounded-lg border transition-all duration-200 ${
                  isHovered
                    ? 'bg-muted shadow-sm scale-[1.02]'
                    : isFaded
                      ? 'opacity-40 bg-background'
                      : 'bg-background'
                }`}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                style={{
                  cursor: 'pointer',
                  borderLeft: isHovered
                    ? `3px solid ${item.fill}`
                    : '3px solid transparent',
                }}
              >
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    {info?.flag && (
                      <div className='relative h-6 w-6 shrink-0'>
                        <Image
                          src={info.flag}
                          alt={`${item.currency} flag`}
                          fill
                          className='rounded-full object-cover'
                        />
                      </div>
                    )}
                    <span className='font-semibold text-sm'>
                      {item.currency}
                    </span>
                    <div
                      className='h-3 w-3 rounded-full shrink-0'
                      style={{ backgroundColor: item.fill }}
                    />
                  </div>
                  <span className='text-sm font-bold'>{percentage}%</span>
                </div>

                <div className='flex justify-between items-center text-sm'>
                  <span className='text-muted-foreground'>Invested</span>
                  <span className='font-medium'>
                    {formatAmount(
                      item.amount,
                      item.currency as SupportedCurrencyCode,
                    )}
                  </span>
                </div>

                <div className='flex justify-between items-center text-sm'>
                  <span className='text-muted-foreground'>MDL Equiv.</span>
                  <span className='font-medium'>
                    {formatAmount(item.valueInMDL, 'MDL')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
