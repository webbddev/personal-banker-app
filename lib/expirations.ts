import { prisma } from '@/lib/prisma';
import {
  addDays,
  subDays,
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
} from 'date-fns';

/** Investments expiring on exactly the 30th day from now.
 *  This ensures each investment triggers only ONE reminder email,
 *  on the exact day it hits the 30-day-before-expiration mark.
 */
export async function findInvestmentsFor30DayNotification() {
  const now = new Date();
  const thirtyDaysFromNow = addDays(now, 30);

  console.log(
    `Checking for investments expiring on exactly ${thirtyDaysFromNow.toISOString()} (30 days from now)`,
  );

  return prisma.investment.findMany({
    where: {
      expirationDate: {
        gte: startOfDay(thirtyDaysFromNow),
        lte: endOfDay(thirtyDaysFromNow),
      },
    },
    include: { user: true },
    orderBy: { expirationDate: 'asc' },
  });
}

/** Investments expiring in a specific range of days from now */
export async function findInvestmentsExpiringInRange(days: number) {
  const now = new Date();
  const targetDate = addDays(now, days);

  return prisma.investment.findMany({
    where: {
      expirationDate: {
        gte: startOfDay(now),
        lte: endOfDay(targetDate),
      },
    },
    include: { user: true },
    orderBy: { expirationDate: 'asc' },
  });
}

/** Investments expiring in the current month */
export async function findInvestmentsForMonthlyNotification() {
  const now = new Date();

  // date-fns handles the start/end of month calculations cleanly
  const start = startOfMonth(now);
  const end = endOfMonth(now);

  return prisma.investment.findMany({
    where: {
      expirationDate: {
        gte: start,
        lte: end,
      },
    },
    include: { user: true },
    orderBy: { expirationDate: 'asc' },
  });
}
