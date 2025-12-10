import { prisma } from '@/lib/prisma';
import { addDays, startOfDay, startOfMonth, endOfMonth } from 'date-fns';

/** Investments expiring in exactly 30 days (UTC) */
export async function findInvestmentsExpiringIn30Days() {
  const targetDate = startOfDay(addDays(new Date(), 30));
  return prisma.investment.findMany({
    where: { expirationDate: targetDate },
    include: { user: true },
  });
}

/** Investments expiring in the current month (UTC) */
export async function findInvestmentsExpiringThisMonth() {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();

  // Create date based on UTC values to avoid timezone issues.
  const start = startOfMonth(new Date(Date.UTC(year, month, 1)));
  const end = endOfMonth(new Date(Date.UTC(year, month, 1)));

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
