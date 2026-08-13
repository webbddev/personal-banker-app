'use client';

import * as React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Item, ItemContent, ItemMedia, ItemTitle } from '@/components/ui/item';
// import { Investment } from '@prisma/client';
import { Investment } from '@/prisma/generated/prisma/client';

import { calculateDaysUntilExpiration } from '@/utils/investment-calculations';
import { cn } from '@/lib/utils';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { addMonths, format } from 'date-fns';

interface InvestmentExpirationCalendarProps {
  investments: Investment[];
}

// 1. Helper for stable date keys (YYYY-MM-DD) avoids locale issues
const getDateKey = (date: Date | string) => {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

type InvestmentStatus = 'expired' | 'urgent' | 'soon' | 'active';

// 2. Helper to determine the "worst" status for a group of investments
// Priority: Expired > Urgent (7d) > Soon (30d) > Active
const getHighestPriorityStatus = (invs: any[]): InvestmentStatus => {
  if (invs.some((i) => i.isExpired)) return 'expired';
  if (invs.some((i) => i.isExpiringIn7Days)) return 'urgent';
  if (invs.some((i) => i.isExpiringIn30Days)) return 'soon';
  return 'active';
};

export function InvestmentExpirationCalendar({
  investments,
}: InvestmentExpirationCalendarProps) {
  const today = new Date();
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    today
  );
  const [month, setMonth] = React.useState<Date>(today);

  const handlePrevMonth = () => setMonth((prev) => addMonths(prev, -1));
  const handleNextMonth = () => setMonth((prev) => addMonths(prev, 1));

  // 3. Consolidated Data Processing
  // We process everything in one pass for efficiency and readability.
  const { expirationMap, viewStats, expiringCount } = React.useMemo(() => {
    const map = new Map<string, any[]>();
    let count = 0;

    const enrichedInvestments = investments.map((inv) => {
      const days = calculateDaysUntilExpiration(inv.expirationDate);

      // Count total expiring soon (1-30 days) globally
      if (days > 0 && days <= 30) count++;

      return {
        ...inv,
        daysUntilExpiration: days,
        isExpired: days <= 0,
        isExpiringIn7Days: days > 0 && days <= 7,
        isExpiringIn30Days: days > 7 && days <= 30,
        isActive: days > 30,
      };
    });

    enrichedInvestments.forEach((inv) => {
      const key = getDateKey(inv.expirationDate);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(inv);
    });

    // Calculate view-specific stats based on the current 'month' state
    const currentMonthKey = `${month.getFullYear()}-${month.getMonth()}`;
    const stats = {
      hasExpired: false,
      hasUrgent: false,
      hasSoon: false,
      hasActive: false,
    };

    enrichedInvestments.forEach((inv) => {
      const invDate = new Date(inv.expirationDate);
      if (
        invDate.getMonth() === month.getMonth() &&
        invDate.getFullYear() === month.getFullYear()
      ) {
        if (inv.isExpired) stats.hasExpired = true;
        if (inv.isExpiringIn7Days) stats.hasUrgent = true;
        if (inv.isExpiringIn30Days) stats.hasSoon = true;
        if (inv.isActive) stats.hasActive = true;
      }
    });

    return { expirationMap: map, viewStats: stats, expiringCount: count };
  }, [investments, month]);

  const selectedDateInvestments = React.useMemo(() => {
    if (!selectedDate) return [];
    return expirationMap.get(getDateKey(selectedDate)) || [];
  }, [selectedDate, expirationMap]);

  // 4. Critical Fix: Memoize the components object
  // This prevents the DayButton from being re-created (unmounted/remounted) on every render.
  const calendarComponents = React.useMemo(
    () => ({
      DayButton: ({ day, ...props }: any) => {
        const dateKey = getDateKey(day.date);
        const investmentsOnDay = expirationMap.get(dateKey);
        const hasInvestments = !!investmentsOnDay?.length;

        let status: InvestmentStatus | null = null;
        if (hasInvestments) {
          status = getHighestPriorityStatus(investmentsOnDay);
        }

        const isSelected =
          selectedDate && getDateKey(day.date) === getDateKey(selectedDate);

        return (
          <button
            {...props}
            className={cn(
              props.className,
              'relative w-full h-full min-h-[--cell-size] min-w-[--cell-size] flex items-center justify-center rounded-md transition-all duration-150',
              isSelected && 'bg-muted/50 dark:bg-muted/20 border border-border shadow-sm scale-105',
              !isSelected && 'hover:bg-muted dark:hover:bg-white/5',
              hasInvestments && 'font-bold'
            )}
            title={
              hasInvestments
                ? `${investmentsOnDay.length} investment(s) on this day`
                : undefined
            }
          >
            <span
              className={cn(
                'relative text-xs sm:text-sm z-10 pb-1 font-bold transition-colors',
                hasInvestments && 'custom-underline',
                !isSelected && status === 'expired' && 'text-red-600 dark:text-red-400',
                !isSelected && status === 'urgent' && 'text-amber-600 dark:text-amber-400',
                !isSelected && status === 'soon' && 'text-emerald-600 dark:text-emerald-400',
                !isSelected && status === 'active' && 'text-blue-600 dark:text-blue-400'
              )}
            >
              {day.date.getDate()}
            </span>
          </button>
        );
      },
    }),
    [expirationMap, selectedDate]
  );

  return (
    <Card className='h-full flex flex-col'>
      <CardHeader>
        <CardTitle className='flex items-center justify-between text-xl lg:text-2xl'>
          <span>Upcoming Expirations</span>
          <CalendarDays className='h-6 w-6 text-blue-500' />
        </CardTitle>
        <CardDescription className='lg:text-base'>
          {expiringCount} investment(s) expiring in the next 30 days
        </CardDescription>
      </CardHeader>
      <CardContent className='flex-1 flex flex-col p-4 pb-6 gap-4'>
        {/* custom month navigation moved above calendar */}
        <div className='flex justify-center items-center gap-6 mb-2'>
          <Button
            variant='outline'
            size='icon'
            onClick={handlePrevMonth}
            className='h-10 w-10 sm:h-12 sm:w-12 rounded-full shadow-md hover:shadow-lg transition-all active:scale-90'
            aria-label='Previous month'
          >
            <ChevronLeft className='h-6 w-6' />
          </Button>
          <div className='flex flex-col items-center min-w-[120px]'>
            {/* <span className='text-[10px] font-medium text-muted-foreground uppercase tracking-widest'>
              Navigation
            </span> */}
            <span className='text-sm font-bold'>
              {format(month, 'MMMM yyyy')}
            </span>
          </div>
          <Button
            variant='outline'
            size='icon'
            onClick={handleNextMonth}
            className='h-10 w-10 sm:h-12 sm:w-12 rounded-full shadow-md hover:shadow-lg transition-all active:scale-90'
            aria-label='Next month'
          >
            <ChevronRight className='h-6 w-6' />
          </Button>
        </div>

        <div className='flex-shrink-0 flex justify-center'>
          <Calendar
            mode='single'
            selected={selectedDate}
            onSelect={setSelectedDate}
            month={month}
            onMonthChange={setMonth}
            weekStartsOn={1}
            className='rounded-lg border border-border/50 w-90% [&>div]:w-full sm:w-fit [--cell-size:10vw] sm:[--cell-size:2.25rem] md:[--cell-size:2.5rem] lg:[--cell-size:3.25rem] mx-auto flex justify-center [&_.rdp-months]:w-full [&_.rdp-month]:w-full [&_table]:w-full bg-transparent shadow-none'
            classNames={{
              nav: 'hidden',
              month_caption: 'hidden',
              months: 'bg-transparent',
              month: 'bg-transparent',
              table: 'bg-transparent',
              tbody: 'bg-transparent',
              head_row: 'bg-transparent',
              row: 'bg-transparent',
              cell: 'bg-transparent',
            }}
            components={calendarComponents}
          />
        </div>

        {/* Legend */}
        <div className='flex-shrink-0 mx-auto mt-0 flex justify-center flex-wrap gap-y-0'>
          {viewStats.hasExpired && (
            <LegendItem color='#ef4444' label='Expired' />
          )}
          {viewStats.hasUrgent && (
            <LegendItem color='#eab308' label='Expires in 1-7 Days' />
          )}
          {viewStats.hasSoon && (
            <LegendItem color='#16a34a' label='Expires in 8-30 Days' />
          )}
          {viewStats.hasActive && (
            <LegendItem color='#2563eb' label='Expiring in > 30 Days' />
          )}
        </div>

        {/* Selected date details - Redesigned sleek UI */}
        <div className='flex-shrink-0 min-h-[100px] mt-4'>
          <div className='flex flex-col gap-3'>
            {selectedDateInvestments.length > 0 ? (
              selectedDateInvestments.map((inv) => (
                <div
                  key={inv.id}
                  className='group relative flex flex-col justify-between p-4 rounded-xl border bg-card hover:border-primary/50 transition-colors shadow-sm'
                >
                  <div className='flex justify-between items-start mb-2'>
                    <div>
                      <h4 className='font-bold text-base'>
                        {inv.organisationName}
                      </h4>
                      <p className='text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5'>
                        {inv.investmentType}
                      </p>
                    </div>
                    <span
                      className={cn(
                        'text-xs font-bold px-2.5 py-1 rounded-md',
                        inv.isExpired
                          ? 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400'
                          : inv.isExpiringIn7Days
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                            : inv.isExpiringIn30Days
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                              : 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
                      )}
                    >
                      {inv.isExpired
                        ? 'Expired'
                        : `${inv.daysUntilExpiration} days`}
                    </span>
                  </div>

                  <div className='grid grid-cols-3 gap-4 mt-2 bg-muted/30 p-3 rounded-lg border border-border/50'>
                    <div>
                      <span className='text-[10px] text-muted-foreground uppercase font-medium tracking-wider'>
                        Amount
                      </span>
                      <p className='font-bold text-sm text-foreground mt-0.5'>
                        {inv.investmentAmount.toLocaleString()}{' '}
                        <span className='text-muted-foreground text-xs'>
                          {inv.currency}
                        </span>
                      </p>
                    </div>
                    <div>
                      <span className='text-[10px] text-muted-foreground uppercase font-medium tracking-wider'>
                        Interest
                      </span>
                      <p className='font-bold text-sm text-foreground mt-0.5'>
                        {inv.interestRate}%
                      </p>
                    </div>
                    <div>
                      <span className='text-[10px] text-muted-foreground uppercase font-medium tracking-wider'>
                        Expires
                      </span>
                      <p className='font-bold text-sm text-foreground mt-0.5 whitespace-nowrap'>
                        {new Date(inv.expirationDate).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className='flex flex-col items-center justify-center h-24 rounded-xl border border-dashed text-center bg-muted/10'>
                <p className='text-sm text-muted-foreground'>
                  No expirations on{' '}
                  {selectedDate
                    ? selectedDate.toLocaleDateString('en-GB')
                    : 'selected date'}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Small sub-component to clean up the JSX
function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <Item variant='default' size='xs'>
      <ItemMedia>
        <div
          className='h-3 w-3 rounded-full'
          style={{ backgroundColor: color }}
        />
      </ItemMedia>
      <ItemContent>
        <ItemTitle className='text-xs lg:text-sm'>{label}</ItemTitle>
      </ItemContent>
    </Item>
  );
}
