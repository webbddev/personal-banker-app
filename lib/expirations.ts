import { prisma } from '@/lib/prisma';
import {
  addDays,
  subDays,
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
} from 'date-fns';

/** Investments expiring in exactly 30 days */
export async function findInvestmentsFor30DayNotification() {
  const now = new Date();

  // 1. Target date is 30 days from now
  const targetDate = addDays(now, 30);

  // 2. Create a 48-hour search window (Yesterday + Target Day)
  // We use date-fns to cleanly calculate the start of "yesterday" relative to the target.
  // This ensures we catch investments regardless of timezone shifts in the DB.
  const start = startOfDay(subDays(targetDate, 1));
  const end = endOfDay(targetDate);

  console.log(
    `Checking for investments between ${start.toISOString()} and ${end.toISOString()}`
  );

  return prisma.investment.findMany({
    where: {
      expirationDate: {
        gte: start,
        lte: end,
      },
    },
    include: { user: true },
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
