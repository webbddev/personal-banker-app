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

  const hasExpiringIn7Days = React.useMemo(() => {
    return allInvestmentsWithStatus.some((inv) => inv.isExpiringIn7Days);
  }, [allInvestmentsWithStatus]);

  const hasExpiringIn30Days = React.useMemo(() => {
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
        {/* Calendar */}
        <div className='flex-1 flex items-center justify-center overflow-auto'>
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

                return (
                  <button
                    {...props}
                    className={cn(
                      props.className,
                      hasInvestments && 'font-bold'
                    )}
                    title={
                      investmentsOnDay
                        ? `${investmentsOnDay.length} investment(s) expiring`
                        : undefined
                    }
                  >
                    <div className='relative w-full h-full flex items-center justify-center'>
                      <span
                        className={cn(
                          'text-xs sm:text-sm relative z-10',
                          hasInvestments && 'font-bold'
                        )}
                      >
                        {day.date.getDate()}
                      </span>

                      {/* Dot indicator for expiring dates */}
                      {hasInvestments && (
                        <div
                          className={cn(
                            'absolute top-0.5 left-0.5 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full',
                            expirationCategory === 'expired'
                              ? 'bg-red-500'
                              : expirationCategory === 'urgent'
                                ? 'bg-yellow-500'
                                : expirationCategory === 'soon'
                                  ? 'bg-green-600'
                                  : 'bg-blue-500'
                          )}
                        />
                      )}
                    </div>
                  </button>
                );
              },
            }}
          />
        </div>

        {/* Legend - matching ChartBarInteractive style */}
        <div className='mx-auto mt-2 flex justify-center flex-wrap gap-y-0'>
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
          {hasExpiringIn7Days && (
            <Item variant='default' size='xs'>
              <ItemMedia>
                <div
                  className='h-3 w-3 rounded-full'
                  style={{ backgroundColor: '#eab308' }}
                />
              </ItemMedia>
              <ItemContent>
                <ItemTitle className='text-xs lg:text-sm'>
                  Expires in 7 Days
                </ItemTitle>
              </ItemContent>
            </Item>
          )}
          {hasExpiringIn30Days && (
            <Item variant='default' size='xs'>
              <ItemMedia>
                <div
                  className='h-3 w-3 rounded-full'
                  style={{ backgroundColor: '#16a34a' }}
                />
              </ItemMedia>
              <ItemContent>
                <ItemTitle className='text-xs lg:text-sm'>
                  Expires in 30 Days
                </ItemTitle>
              </ItemContent>
            </Item>
          )}
        </div>

        {/* Selected date details */}
        {selectedDateInvestments.length > 0 && (
          <div className='mt-4 pt-4 border-t border-gray-200 dark:border-gray-800'>
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
      </CardContent>
    </Card>
  );
}
