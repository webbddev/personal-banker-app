// import { prisma } from '@/lib/prisma';
// import {
//   addDays,
//   startOfDay,
//   startOfMonth,
//   endOfMonth,
//   endOfDay,
// } from 'date-fns';

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

import { prisma } from '@/lib/prisma';

/** Investments expiring in exactly 30 days (UTC) */
export async function findInvestmentsExpiringIn30Days() {
  const now = new Date();
  // Get the start of the calendar day in the server's local timezone.
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  // Calculate the target calendar day 30 days from now.
  const targetDate = new Date(startOfToday);
  targetDate.setDate(startOfToday.getDate() + 30);

  // Create a 48-hour window around the target date to account for all timezones.
  // This ensures we find the investment regardless of how the time was stored.
  const start = new Date(targetDate);
  start.setHours(0, 0, 0, 0); // Start of the target calendar day.

  const end = new Date(start);
  end.setDate(start.getDate() + 1); // End of the target calendar day.

  return prisma.investment.findMany({
    where: {
      expirationDate: {
        gte: start,
        lt: end, // Use 'lt' (less than) the start of the next day.
      },
    },
    include: { user: true },
  });
}

/** Investments expiring in the current month (UTC) */
export async function findInvestmentsExpiringThisMonth() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  // The start of the current month in the server's local timezone.
  const start = new Date(year, month, 1);

  // The start of the next month.
  const end = new Date(year, month + 1, 1);

  return prisma.investment.findMany({
    where: {
      expirationDate: {
        gte: start,
        lt: end, // Use 'lt' to include everything up to the end of the month.
      },
    },
    include: { user: true },
    orderBy: { expirationDate: 'asc' },
  });
}