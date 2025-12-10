'use client';

import * as React from 'react';
import { Calendar } from '@/components/ui/calendar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Item, ItemContent, ItemMedia, ItemTitle } from '@/components/ui/item';
import { Investment } from '@prisma/client';
import { calculateDaysUntilExpiration } from '@/utils/investment-calculations';
import { cn } from '@/lib/utils';
import { CalendarDays } from 'lucide-react';

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
              'relative w-full h-full flex items-center justify-center rounded-md transition-all duration-150',
              isSelected && 'bg-teal-600/30 text-white shadow-md scale-105',
              !isSelected && 'hover:bg-blue-50 dark:hover:bg-blue-900/30',
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
                'relative text-xs sm:text-sm z-10 pb-1 font-bold',
                hasInvestments && 'custom-underline',
                status === 'expired' && 'text-red-600',
                status === 'urgent' && 'text-yellow-600',
                status === 'soon' && 'text-green-600',
                status === 'active' && 'text-blue-600'
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
        <div className='flex-shrink-0 flex justify-center'>
          <Calendar
            mode='single'
            selected={selectedDate}
            onSelect={setSelectedDate}
            month={month}
            onMonthChange={setMonth}
            className='rounded-lg [--cell-size:3.5rem] sm:[--cell-size:2.25rem] md:[--cell-size:2.5rem] lg:[--cell-size:3.25rem]'
            // Since we handle styling in DayButton, we don't need complex modifiers for logic anymore
            components={calendarComponents}
          />
        </div>

        {/* Legend */}
        <div className='flex-shrink-0 mx-auto mt-2 flex justify-center flex-wrap gap-y-0'>
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

        {/* Selected date details */}
        <div className='flex-shrink-0 min-h-[90px]'>
          {selectedDateInvestments.length > 0 && (
            <div className='pt-4 border-t border-gray-200 dark:border-gray-800'>
              <p className='text-xs lg:text-sm font-semibold text-gray-400 mb-2'>
                Expiring on {selectedDate?.toLocaleDateString('en-GB')}:
              </p>
              <div className='space-y-1'>
                {selectedDateInvestments.map((inv) => (
                  <div
                    key={inv.id}
                    className='text-xs lg:text-sm text-gray-500 flex justify-between'
                  >
                    <span>{inv.organisationName}</span>
                    <span className='text-gray-400'>
                      {inv.investmentAmount} {inv.currency}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
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
