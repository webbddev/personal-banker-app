import { prisma } from '@/lib/prisma';
import {
  addDays,
  subDays,
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
} from 'date-fns';

/** Investments expiring in the next 30 days */
export async function findInvestmentsFor30DayNotification() {
  const now = new Date();
  const thirtyDaysFromNow = addDays(now, 30);

  console.log(
    `Checking for investments expiring between ${now.toISOString()} and ${thirtyDaysFromNow.toISOString()}`
  );

  return prisma.investment.findMany({
    where: {
      expirationDate: {
        gte: startOfDay(now),
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
