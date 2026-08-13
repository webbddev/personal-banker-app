'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from 'recharts';
import {
  ChevronLeft,
  ChevronRight,
  Landmark,
  Percent,
  Calendar,
  Clock,
} from 'lucide-react';
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
    (item) => item.fill === 'var(--color-expired)',
  );
  const isExpiringIn7Days = chartData.some(
    (item) => item.fill === 'var(--color-expiringIn7Days)',
  );
  const isExpiringSoon = chartData.some(
    (item) => item.fill === 'var(--color-expiringSoon)',
  );
  const isActiveInvestment = chartData.some(
    (item) => item.fill === 'var(--color-investmentAmount)',
  );

  const handleNext = () => {
    setActiveIndex((prev) =>
      prev === null || prev === chartData.length - 1 ? 0 : prev + 1,
    );
  };

  const handleBack = () => {
    setActiveIndex((prev) =>
      prev === null || prev === 0 ? chartData.length - 1 : prev - 1,
    );
  };

  // ─── Keyboard Navigation ──────────────────────────────────────────
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only navigate if an input element is not focused
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if (e.key === 'ArrowLeft') {
        handleBack();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, chartData.length]);

  const activeItem = activeIndex !== null ? chartData[activeIndex] : null;
  const daysLeft = activeItem
    ? calculateDaysUntilExpiration(new Date(activeItem.expirationDate))
    : 0;
  const isSoon = daysLeft > 0 && daysLeft <= 30;
  const isUrgent = daysLeft > 0 && daysLeft <= 7;

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
                          props.payload.currency as string,
                        )}
                      </span>
                      <span>Rate: {props.payload.interestRate}%</span>
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
            <span className='text-xs font-medium text-muted-foreground uppercase tracking-widest'>
              Navigation
            </span>
            <span className='text-sm font-bold'>
              {activeIndex !== null
                ? `${activeIndex + 1} / ${chartData.length}`
                : '- / -'}
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

        {/* Selected Investment Detail Card — Sidebar Accent (Mobile-First, No Layout Shift) */}
        {/* Selected Investment Detail Card — Sidebar Accent (Mobile-First, No Layout Shift) */}
        {/* Selected Investment Detail Card — Sidebar Accent */}
        <div
          className={cn(
            'mt-4 rounded-xl border bg-card p-5 transition-all duration-300 border-l-4',
            activeIndex !== null
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-2 pointer-events-none h-0 p-0 overflow-hidden border-l-0',
            daysLeft <= 0
              ? 'border-l-red-500'
              : isUrgent
                ? 'border-l-amber-500'
                : isSoon
                  ? 'border-l-emerald-500'
                  : 'border-l-[#40C1AC]',
          )}
        >
          {activeIndex !== null && chartData[activeIndex] && (
            <div className='flex flex-col gap-4'>
              {/* Header */}
              <div className='flex items-start justify-between gap-4'>
                <div className='min-w-0 flex-1'>
                  <p className='text-xs font-medium text-muted-foreground uppercase tracking-wider'>
                    Selected Investment
                  </p>
                  <h3 className='text-xl font-bold text-foreground mt-1 whitespace-nowrap'>
                    {chartData[activeIndex].organisationName}
                  </h3>
                  {chartData[activeIndex].relatedData && (
                    <p className='text-sm text-muted-foreground mt-0.5 whitespace-nowrap'>
                      {chartData[activeIndex].relatedData}
                    </p>
                  )}
                </div>
                <span
                  className={cn(
                    'inline-flex items-center rounded-md px-2.5 py-1 text-xs font-bold whitespace-nowrap',
                    daysLeft <= 0
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      : isUrgent
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                        : isSoon
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                          : 'bg-[#40C1AC]/10 text-[#2a9d8f]',
                  )}
                >
                  {daysLeft <= 0
                    ? 'Expired'
                    : `Expiring in ${daysLeft} Day${daysLeft === 1 ? '' : 's'}`}
                </span>
              </div>

              {/* Metrics: Stacked List Rows */}
              <div className='rounded-lg border divide-y overflow-hidden'>
                {/* Amount */}
                <div className='flex items-center justify-between gap-4 px-5 py-4 bg-muted/30'>
                  <div className='flex items-center gap-2 text-muted-foreground min-w-0'>
                    <Landmark className='h-4 w-4 text-emerald-500 flex-shrink-0' />
                    <span className='text-[11px] font-medium uppercase tracking-wider'>
                      Amount
                    </span>
                  </div>
                  <span className='text-xl font-bold text-foreground tabular-nums whitespace-nowrap'>
                    {formatAmount(
                      Number(chartData[activeIndex].investmentAmount),
                      chartData[activeIndex].currency as string,
                    )}
                  </span>
                </div>

                {/* Rate */}
                <div className='flex items-center justify-between gap-4 px-5 py-4'>
                  <div className='flex items-center gap-2 text-muted-foreground min-w-0'>
                    <Percent className='h-4 w-4 text-blue-500 flex-shrink-0' />
                    <span className='text-[11px] font-medium uppercase tracking-wider'>
                      Rate
                    </span>
                  </div>
                  <span className='text-base font-bold text-foreground whitespace-nowrap'>
                    {chartData[activeIndex].interestRate}%
                  </span>
                </div>

                {/* Expires */}
                <div className='flex items-center justify-between gap-4 px-5 py-4'>
                  <div className='flex items-center gap-2 text-muted-foreground min-w-0'>
                    <Calendar className='h-4 w-4 text-purple-500 flex-shrink-0' />
                    <span className='text-[11px] font-medium uppercase tracking-wider'>
                      Expires
                    </span>
                  </div>
                  <span className='text-base font-semibold text-foreground whitespace-nowrap'>
                    {chartData[activeIndex].expirationDateFormatted}
                  </span>
                </div>

                {/* Days Left */}
                {/* <div
                  className={cn(
                    'flex items-center justify-between gap-4 px-5 py-4',
                    isUrgent
                      ? 'bg-amber-500/10'
                      : isSoon
                        ? 'bg-emerald-500/10'
                        : '',
                  )}
                >
                  <div className='flex items-center gap-2 text-muted-foreground min-w-0'>
                    <Clock
                      className={cn(
                        'h-4 w-4 flex-shrink-0',
                        isUrgent
                          ? 'text-amber-500'
                          : isSoon
                            ? 'text-emerald-500'
                            : 'text-indigo-500',
                      )}
                    />
                    <span className='text-[11px] font-medium uppercase tracking-wider'>
                      Days left
                    </span>
                  </div>
                  <span
                    className={cn(
                      'text-base font-bold whitespace-nowrap',
                      daysLeft <= 0
                        ? 'text-red-600 dark:text-red-500'
                        : isUrgent
                          ? 'text-amber-600 dark:text-amber-500'
                          : isSoon
                            ? 'text-emerald-600 dark:text-emerald-500'
                            : 'text-foreground',
                    )}
                  >
                    {daysLeft <= 0 ? 0 : daysLeft} days
                  </span>
                </div> */}
              </div>
            </div>
          )}
        </div>

        {/* --------------- */}

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
