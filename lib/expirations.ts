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
export async function findInvestmentsExpiringIn30Days() {
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
export async function findInvestmentsExpiringThisMonth() {
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

// import { prisma } from '@/lib/prisma';

// /** Investments expiring in exactly 30 days (UTC) */
// export async function findInvestmentsExpiringIn30Days() {
//   const now = new Date();

//   // 1. Calculate the target date (30 days from now)
//   const targetDate = new Date();
//   targetDate.setDate(now.getDate() + 30);

//   // 2. Create a 48-hour search window
//   // We look from the START of the PREVIOUS day to the END of the TARGET day.
//   // Example: If target is Jan 14, we search Jan 13 00:00 to Jan 14 23:59.
//   // This catches:
//   // - "Jan 14" stored as "Jan 13 22:00 UTC" (Timezones ahead of UTC)
//   // - "Jan 14" stored as "Jan 14 05:00 UTC" (Timezones behind UTC)

//   const start = new Date(targetDate);
//   start.setDate(start.getDate() - 1); // Go back 1 day
//   start.setHours(0, 0, 0, 0); // Start of that day

//   const end = new Date(targetDate);
//   end.setHours(23, 59, 59, 999); // End of target day

//   console.log(
//     `Checking for investments between ${start.toISOString()} and ${end.toISOString()}`
//   );

//   return prisma.investment.findMany({
//     where: {
//       expirationDate: {
//         gte: start, // Greater than or equal to start of yesterday
//         lte: end, // Less than or equal to end of target day
//       },
//     },
//     include: { user: true },
//   });
// }

// /** Investments expiring in the current month (UTC) */
// export async function findInvestmentsExpiringThisMonth() {
//   const now = new Date();
//   const year = now.getFullYear();
//   const month = now.getMonth();

//   // The start of the current month in the server's local timezone.
//   const start = new Date(year, month, 1);

//   // The start of the next month.
//   const end = new Date(year, month + 1, 1);

//   return prisma.investment.findMany({
//     where: {
//       expirationDate: {
//         gte: start,
//         lt: end, // Use 'lt' to include everything up to the end of the month.
//       },
//     },
//     include: { user: true },
//     orderBy: { expirationDate: 'asc' },
//   });
// }
