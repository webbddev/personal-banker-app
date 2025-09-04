import { prisma } from '@/lib/prisma';
import { addDays, startOfDay, startOfMonth, endOfMonth } from 'date-fns';
import type { Investment } from '@prisma/client';

/** Инвестиции, истекающие ровно через 30 дней (UTC) */
export async function findInvestmentsExpiringIn30Days() {
  const targetDate = startOfDay(addDays(new Date(), 30));
  return prisma.investment.findMany({
    where: { expirationDate: targetDate },
    include: { user: true },
  });
}

/** Инвестиции, истекающие в текущем месяце (UTC) */
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
