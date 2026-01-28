'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from 'recharts';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Investment } from '@/prisma/generated/prisma/client';

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
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Item, ItemContent, ItemMedia, ItemTitle } from '@/components/ui/item';
import {
  calculateDaysUntilExpiration,
  CurrencyTotals,
} from '@/utils/investment-calculations';
import { formatAmount } from '@/utils/currency-formatter';
import { ExportButton } from './ExportButton';
import { Button } from '@/components/ui/button';

export const description = 'An interactive bar chart of investments';

interface ChartBarInteractiveProps {
  data: Investment[];
  currencyTotals?: CurrencyTotals;
  monthlyReturns?: CurrencyTotals;
}

export function ChartBarInteractive({
  data,
  currencyTotals,
  monthlyReturns,
}: ChartBarInteractiveProps) {
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);

  const handleNext = () => {
    setActiveIndex((prev) =>
      prev === null || prev === chartData.length - 1 ? 0 : prev + 1
    );
  };

  const handleBack = () => {
    setActiveIndex((prev) =>
      prev === null || prev === 0 ? chartData.length - 1 : prev - 1
    );
  };

  const chartConfig = {
    investmentAmount: {
      label: 'Active Investment',
      color: '#40C1AC',
    },
    expiringSoon: {
      label: 'Expiring Soon',
      color: '#16a34a',
    },
    expiringIn7Days: {
      label: 'Expiring in 7 Days',
      color: '#eab308',
    },
    expired: {
      label: 'Expired',
      color: '#ef4444',
    },
  } satisfies ChartConfig;

  const chartData = data.map((investment) => {
    const expirationDate = new Date(investment.expirationDate);
    const daysUntilExpiration = calculateDaysUntilExpiration(expirationDate);
    const isExpired = daysUntilExpiration <= 0;
    const isExpiringIn7Days =
      daysUntilExpiration > 0 && daysUntilExpiration <= 7;
    const isExpiringSoon = daysUntilExpiration > 0 && daysUntilExpiration <= 30;

    let fill;
    if (isExpired) {
      fill = 'var(--color-expired)';
    } else if (isExpiringIn7Days) {
      fill = 'var(--color-expiringIn7Days)';
    } else if (isExpiringSoon) {
      fill = 'var(--color-expiringSoon)';
    } else {
      fill = 'var(--color-investmentAmount)';
    }

    return {
      ...investment,
      expirationDateFormatted: expirationDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      fill,
    };
  });

  const hasExpired = chartData.some(
    (item) => item.fill === 'var(--color-expired)'
  );
  const isExpiringIn7Days = chartData.some(
    (item) => item.fill === 'var(--color-expiringIn7Days)'
  );
  const isExpiringSoon = chartData.some(
    (item) => item.fill === 'var(--color-expiringSoon)'
  );
  const isActiveInvestment = chartData.some(
    (item) => item.fill === 'var(--color-investmentAmount)'
  );

  return (
    <Card className='h-full'>
      <CardHeader>
        {/* Changed from flex justify-between to flex-col to stack vertically */}
        <div className='flex flex-col gap-4'>
          <div>
            <CardTitle className='text-xl lg:text-2xl'>
              Investment Portfolio Overview
            </CardTitle>
            <CardDescription className='lg:text-base'>
              Each bar represents an investment, ordered by expiration date
            </CardDescription>
          </div>

          {/* Export Button container placed under description */}
          {/* w-full for mobile, sm:w-fit for desktop to avoid over-stretching */}
          <div className='w-full sm:w-fit'>
            <ExportButton
              investments={data}
              currencyTotals={currencyTotals}
              monthlyReturns={monthlyReturns}
              filename='investment-portfolio'
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className='aspect-auto h-[250px] md:h-[300px] lg:h-[350px] 2xl:h-[600px] w-full'
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              top: 20,
              right: 40,
              bottom: 20,
              left: 10,
            }}
            onMouseMove={(state) => {
              if (state.isTooltipActive) {
                setActiveIndex(state.activeTooltipIndex ?? null);
              } else {
                setActiveIndex(null);
              }
            }}
            onMouseLeave={() => setActiveIndex(null)}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey='expirationDateFormatted'
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              dataKey='investmentAmount'
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `${value.toLocaleString()}`}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  formatter={(value, name, props) => (
                    <div className='flex flex-col gap-1 rounded-lg bg-background p-2 shadow-sm text-sm lg:text-base'>
                      <span className='font-bold'>
                        {props.payload.organisationName}
                      </span>
                      <span>
                        Amount:{' '}
                        {formatAmount(
                          Number(value),
                          props.payload.currency as string
                        )}
                      </span>
                      <span>
                        Expires: {props.payload.expirationDateFormatted}
                      </span>
                    </div>
                  )}
                />
              }
            />
            <Bar dataKey='investmentAmount' radius={4}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.fill}
                  opacity={
                    activeIndex === null || activeIndex === index ? 1 : 0.6
                  }
                  stroke={
                    activeIndex === index ? 'hsl(var(--foreground))' : 'none'
                  }
                  strokeWidth={activeIndex === index ? 2 : 0}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>

        {/* Mobile-friendly Navigation Arrows - Positioned right under the chart */}
        <div className='flex justify-center items-center gap-6 mt-4 mb-2'>
          <Button
            variant='outline'
            size='icon'
            onClick={handleBack}
            className='h-10 w-10 sm:h-12 sm:w-12 rounded-full shadow-md hover:shadow-lg transition-all active:scale-90'
            aria-label='Previous investment'
          >
            <ChevronLeft className='h-6 w-6' />
          </Button>
          <div className='flex flex-col items-center min-w-[80px]'>
             <span className='text-xs font-medium text-muted-foreground uppercase tracking-widest'>Navigation</span>
             <span className='text-sm font-bold'>
                {activeIndex !== null ? `${activeIndex + 1} / ${chartData.length}` : '- / -'}
             </span>
          </div>
          <Button
            variant='outline'
            size='icon'
            onClick={handleNext}
            className='h-10 w-10 sm:h-12 sm:w-12 rounded-full shadow-md hover:shadow-lg transition-all active:scale-90'
            aria-label='Next investment'
          >
            <ChevronRight className='h-6 w-6' />
          </Button>
        </div>

        {/* Selected Investment Detail Card - Programmatic highlight/tooltip replacement */}
        <div 
          className={cn(
            'mt-4 rounded-lg border bg-card p-4 transition-all duration-300',
            activeIndex !== null ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none h-0 p-0 overflow-hidden'
          )}
        >
          {activeIndex !== null && chartData[activeIndex] && (
            <div className='flex flex-col gap-1'>
              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium text-muted-foreground'>Selected Investment</span>
                <span className='text-xs font-mono bg-muted px-2 py-0.5 rounded'>
                  {activeIndex + 1} / {chartData.length}
                </span>
              </div>
              <p className='text-lg font-bold text-foreground'>
                {chartData[activeIndex].organisationName}
              </p>
              <div className='grid grid-cols-2 gap-4 mt-2'>
                <div>
                  <p className='text-xs text-muted-foreground uppercase tracking-wider'>Amount</p>
                  <p className='text-base font-semibold'>
                    {formatAmount(
                      Number(chartData[activeIndex].investmentAmount),
                      chartData[activeIndex].currency as string
                    )}
                  </p>
                </div>
                <div>
                  <p className='text-xs text-muted-foreground uppercase tracking-wider'>Expiration Date</p>
                  <p className='text-base font-semibold'>
                    {chartData[activeIndex].expirationDateFormatted}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className='mx-auto mt-2 flex justify-center flex-wrap gap-y-0'>
          {hasExpired && (
            <Item variant='default' size='xs'>
              <ItemMedia>
                <div
                  className='h-3 w-3 rounded-sm'
                  style={{ backgroundColor: '#ef4444' }}
                />
              </ItemMedia>
              <ItemContent>
                <ItemTitle className='text-xs lg:text-sm'>Expired</ItemTitle>
              </ItemContent>
            </Item>
          )}
          {isExpiringIn7Days && (
            <Item variant='default' size='xs'>
              <ItemMedia>
                <div
                  className='h-3 w-3 rounded-sm'
                  style={{ backgroundColor: '#eab308' }}
                />
              </ItemMedia>
              <ItemContent>
                <ItemTitle className='text-xs lg:text-sm'>
                  Expiring in 7 Days
                </ItemTitle>
              </ItemContent>
            </Item>
          )}
          {isExpiringSoon && (
            <Item variant='default' size='xs'>
              <ItemMedia>
                <div
                  className='h-3 w-3 rounded-sm'
                  style={{ backgroundColor: '#16a34a' }}
                />
              </ItemMedia>
              <ItemContent>
                <ItemTitle className='text-xs lg:text-sm'>
                  Expiring in 30 Days
                </ItemTitle>
              </ItemContent>
            </Item>
          )}
          {isActiveInvestment && (
            <Item variant='default' size='xs'>
              <ItemMedia>
                <div
                  className='h-3 w-3 rounded-sm'
                  style={{ backgroundColor: '#40C1AC' }}
                />
              </ItemMedia>
              <ItemContent>
                <ItemTitle className='text-xs lg:text-sm'>
                  Active Investments
                </ItemTitle>
              </ItemContent>
            </Item>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
