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

export function InvestmentExpirationCalendar({
  investments,
}: InvestmentExpirationCalendarProps) {
  const today = new Date();
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    today
  );

  // Get all investments with expiration status
  const allInvestmentsWithStatus = React.useMemo(() => {
    return investments.map((inv) => {
      const days = calculateDaysUntilExpiration(inv.expirationDate);
      return {
        ...inv,
        daysUntilExpiration: days,
        isExpired: days <= 0,
        isExpiringIn7Days: days > 0 && days <= 7,
        isExpiringIn30Days: days > 7 && days <= 30,
      };
    });
  }, [investments]);

  // Get investments expiring within 30 days for calendar view
  const expiringInvestments = React.useMemo(() => {
    return allInvestmentsWithStatus.filter((inv) => {
      return inv.daysUntilExpiration > 0 && inv.daysUntilExpiration <= 30;
    });
  }, [allInvestmentsWithStatus]);

  // Get expired investments
  const expiredInvestments = React.useMemo(() => {
    return allInvestmentsWithStatus.filter((inv) => inv.isExpired);
  }, [allInvestmentsWithStatus]);

  // Create a map of dates with all investments (expiring and expired)
  const expirationMap = React.useMemo(() => {
    const map = new Map<string, Investment[]>();

    // Add expiring investments
    expiringInvestments.forEach((inv) => {
      const dateKey = new Date(inv.expirationDate).toLocaleDateString();
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push(inv);
    });

    // Add expired investments
    expiredInvestments.forEach((inv) => {
      const dateKey = new Date(inv.expirationDate).toLocaleDateString();
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push(inv);
    });

    return map;
  }, [expiringInvestments, expiredInvestments]);

  // Check what types of expirations we have
  const hasExpired = React.useMemo(() => {
    return expiredInvestments.length > 0;
  }, [expiredInvestments]);

  const isExpiringIn7Days = React.useMemo(() => {
    return allInvestmentsWithStatus.some((inv) => inv.isExpiringIn7Days);
  }, [allInvestmentsWithStatus]);

  const isExpiringIn30Days = React.useMemo(() => {
    return allInvestmentsWithStatus.some((inv) => inv.isExpiringIn30Days);
  }, [allInvestmentsWithStatus]);

  // Get investments for selected date
  const selectedDateInvestments = React.useMemo(() => {
    if (!selectedDate) return [];
    const dateKey = selectedDate.toLocaleDateString();
    return expirationMap.get(dateKey) || [];
  }, [selectedDate, expirationMap]);

  return (
    <Card className='h-full flex flex-col'>
      <CardHeader>
        <CardTitle className='flex items-center justify-between text-xl lg:text-2xl'>
          <span>Upcoming Expirations</span>
          <CalendarDays className='h-6 w-6 text-blue-500' />
        </CardTitle>
        <CardDescription className='lg:text-base'>
          {expiringInvestments.length} investment(s) expiring in the next 30
          days
        </CardDescription>
      </CardHeader>
      <CardContent className='flex-1 flex flex-col p-4 pb-6 gap-4'>
        {/* Calendar - Fixed container to prevent shifting */}
        <div className='flex-shrink-0 flex justify-center'>
          <Calendar
            mode='single'
            selected={selectedDate}
            onSelect={setSelectedDate}
            defaultMonth={today}
            className='rounded-lg  [--cell-size:3.5rem] sm:[--cell-size:2.25rem] md:[--cell-size:2.5rem] lg:[--cell-size:3.25rem]'
            modifiers={{
              expiringIn7Days: (day) => {
                const dateKey = day.toLocaleDateString();
                const investmentsOnDay = expirationMap.get(dateKey);
                if (!investmentsOnDay) return false;
                return investmentsOnDay.some((inv) => {
                  const days = calculateDaysUntilExpiration(inv.expirationDate);
                  return days > 0 && days <= 7;
                });
              },
              expiringIn30Days: (day) => {
                const dateKey = day.toLocaleDateString();
                const investmentsOnDay = expirationMap.get(dateKey);
                if (!investmentsOnDay) return false;
                return investmentsOnDay.some((inv) => {
                  const days = calculateDaysUntilExpiration(inv.expirationDate);
                  return days > 7 && days <= 30;
                });
              },
            }}
            modifiersClassNames={{
              expiringIn7Days: 'relative',
              expiringIn30Days: 'relative',
            }}
            components={{
              DayButton: ({ day, modifiers, ...props }) => {
                const dateKey = day.date.toLocaleDateString();
                const investmentsOnDay = expirationMap.get(dateKey);
                const hasInvestments =
                  !!investmentsOnDay && investmentsOnDay.length > 0;

                let daysUntil = null;
                let expirationCategory = '';

                if (investmentsOnDay) {
                  daysUntil = calculateDaysUntilExpiration(
                    investmentsOnDay[0].expirationDate
                  );
                  if (daysUntil <= 0) {
                    expirationCategory = 'expired';
                  } else if (daysUntil > 0 && daysUntil <= 7) {
                    expirationCategory = 'urgent';
                  } else if (daysUntil > 7 && daysUntil <= 30) {
                    expirationCategory = 'soon';
                  }
                }

                const isSelected =
                  selectedDate &&
                  day.date.toLocaleDateString() ===
                    selectedDate.toLocaleDateString();

                return (
                  <button
                    {...props}
                    className={cn(
                      props.className,
                      'relative w-full h-full flex items-center justify-center rounded-md transition-all duration-150',
                      isSelected &&
                        'bg-teal-600/30 text-white shadow-md scale-105',
                      !isSelected &&
                        'hover:bg-blue-50 dark:hover:bg-blue-900/30',
                      hasInvestments && 'font-bold'
                    )}
                    title={
                      investmentsOnDay
                        ? `${investmentsOnDay.length} investment(s) expiring`
                        : undefined
                    }
                  >
                    <span
                      className={cn(
                        'relative text-xs sm:text-sm z-10 pb-1 font-bold',
                        hasInvestments && 'custom-underline',
                        expirationCategory === 'expired' && 'text-red-600',
                        expirationCategory === 'urgent' && 'text-yellow-600',
                        expirationCategory === 'soon' && 'text-green-600',
                        hasInvestments && !expirationCategory && 'text-blue-600'
                      )}
                    >
                      {day.date.getDate()}
                    </span>
                  </button>
                );
              },
            }}
          />
        </div>

        {/* Legend - Fixed position */}
        <div className='flex-shrink-0 mx-auto mt-2 flex justify-center flex-wrap gap-y-0'>
          {hasExpired && (
            <Item variant='default' size='xs'>
              <ItemMedia>
                <div
                  className='h-3 w-3 rounded-full'
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
                  className='h-3 w-3 rounded-full'
                  style={{ backgroundColor: '#eab308' }}
                />
              </ItemMedia>
              <ItemContent>
                <ItemTitle className='text-xs lg:text-sm'>
                  Expires in {'<'} 7 Days
                </ItemTitle>
              </ItemContent>
            </Item>
          )}
          {isExpiringIn30Days && (
            <Item variant='default' size='xs'>
              <ItemMedia>
                <div
                  className='h-3 w-3 rounded-full'
                  style={{ backgroundColor: '#16a34a' }}
                />
              </ItemMedia>
              <ItemContent>
                <ItemTitle className='text-xs lg:text-sm'>
                  Expires in {'<'} 30 Days
                </ItemTitle>
              </ItemContent>
            </Item>
          )}
        </div>

        {/* Selected date details - Container always exists but content conditionally rendered */}
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
