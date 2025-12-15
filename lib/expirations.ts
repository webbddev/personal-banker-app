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

  // 1. Calculate the target date (30 days from now)
  const targetDate = new Date();
  targetDate.setDate(now.getDate() + 30);

  // 2. Create a 48-hour search window
  // We look from the START of the PREVIOUS day to the END of the TARGET day.
  // Example: If target is Jan 14, we search Jan 13 00:00 to Jan 14 23:59.
  // This catches:
  // - "Jan 14" stored as "Jan 13 22:00 UTC" (Timezones ahead of UTC)
  // - "Jan 14" stored as "Jan 14 05:00 UTC" (Timezones behind UTC)

  const start = new Date(targetDate);
  start.setDate(start.getDate() - 1); // Go back 1 day
  start.setHours(0, 0, 0, 0); // Start of that day

  const end = new Date(targetDate);
  end.setHours(23, 59, 59, 999); // End of target day

  console.log(
    `Checking for investments between ${start.toISOString()} and ${end.toISOString()}`
  );

  return prisma.investment.findMany({
    where: {
      expirationDate: {
        gte: start, // Greater than or equal to start of yesterday
        lte: end, // Less than or equal to end of target day
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
