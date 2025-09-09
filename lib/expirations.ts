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
