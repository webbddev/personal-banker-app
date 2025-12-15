// import { prisma } from '@/lib/prisma';
// import { addDays, startOfDay, startOfMonth, endOfMonth, endOfDay } from 'date-fns';

// /** Investments expiring in exactly 30 days (UTC) */
// export async function findInvestmentsExpiringIn30Days() {
//   const dateIn30Days = addDays(new Date(), 30);
//   const start = startOfDay(dateIn30Days);
//   const end = endOfDay(dateIn30Days);

//   return prisma.investment.findMany({
//     where: {
//       expirationDate: {
//         gte: start,
//         lte: end,
//       },
//     },
//     include: { user: true },
//   });
// }

// /** Investments expiring in the current month (UTC) */
// export async function findInvestmentsExpiringThisMonth() {
//   const now = new Date();
//   const year = now.getUTCFullYear();
//   const month = now.getUTCMonth();

//   // Create date based on UTC values to avoid timezone issues.
//   const start = startOfMonth(new Date(Date.UTC(year, month, 1)));
//   const end = endOfMonth(new Date(Date.UTC(year, month, 1)));

//   return prisma.investment.findMany({
//     where: {
//       expirationDate: {
//         gte: start,
//         lte: end,
//       },
//     },
//     include: { user: true },
//     orderBy: { expirationDate: 'asc' },
//   });
// }

import { prisma } from './prisma';

export async function findInvestmentsExpiringIn30Days() {
  // Get today's date and add 30 days in a UTC-safe way
  const today = new Date();
  today.setUTCDate(today.getUTCDate() + 30);

  // Get the year, month, and day in UTC
  const year = today.getUTCFullYear();
  const month = today.getUTCMonth();
  const day = today.getUTCDate();

  // Create the start and end of the target day in UTC
  const start = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
  const end = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));

  return prisma.investment.findMany({
    where: {
      expirationDate: {
        gte: start,
        lte: end,
      },
    },
    include: {
      user: true,
    },
  });
}

export async function findInvestmentsExpiringThisMonth() {
  // Get today's date in UTC
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();

  // Create the start of the current month in UTC
  const start = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));

  // Get the end of the month by going to the next month and subtracting a millisecond
  const end = new Date(Date.UTC(year, month + 1, 1, 0, 0, 0, 0) - 1);

  return prisma.investment.findMany({
    where: {
      expirationDate: {
        gte: start,
        lte: end,
      },
    },
    include: {
      user: true,
    },
  });
}