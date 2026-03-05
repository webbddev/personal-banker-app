import { prisma } from '@/lib/prisma';
import {
  addDays,
  subDays,
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
} from 'date-fns';

/** Finds investments expiring on EXACTLY the Nth day from now.
 *  Use this to trigger one-time notifications at specific intervals (e.g., 30, 7, or 1 day).
 */
export async function findInvestmentsExpiringOnDay(days: number) {
  const now = new Date();
  const targetDate = addDays(now, days);

  return prisma.investment.findMany({
    where: {
      expirationDate: {
        gte: startOfDay(targetDate),
        lte: endOfDay(targetDate),
      },
    },
    include: { user: true },
    orderBy: { expirationDate: 'asc' },
  });
}

/** Specific helper for the 30-day cron check */
export async function findInvestmentsFor30DayNotification() {
  return findInvestmentsExpiringOnDay(30);
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
