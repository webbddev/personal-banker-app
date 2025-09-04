'use server';

import {
  findInvestmentsExpiringIn30Days,
  findInvestmentsExpiringThisMonth,
} from '@/lib/expirations';
import { sendDailyReminder, sendMonthlyDigest } from '@/lib/mailer';
import { groupBy } from '@/utils/group-by';

/**
 * Fetches all investments that are expiring in exactly 30 days and sends a
 * reminder email for each one. This function is intended to be called by a daily cron job.
 */
export async function sendDailyReminders() {
  console.log('Running daily reminder job...');
  try {
    const investments = await findInvestmentsExpiringIn30Days();
    console.log(`Found ${investments.length} investments expiring in 30 days.`);

    // We use Promise.all to send emails in parallel, which is more efficient.
    await Promise.all(
      investments.map((investment) => sendDailyReminder(investment))
    );

    console.log('Daily reminder job completed successfully.');
    return { success: true, message: `Sent ${investments.length} reminders.` };
  } catch (error) {
    console.error('Error in daily reminder job:', error);
    return { success: false, message: 'An error occurred.' };
  }
}

/**
 * Fetches all investments expiring in the current month, groups them by user,
 * and sends a single digest email to each user. This is intended to be called by a monthly cron job.
 */
export async function sendMonthlyDigests() {
  console.log('Running monthly digest job...');
  try {
    const investments = await findInvestmentsExpiringThisMonth();
    console.log(`Found ${investments.length} investments expiring this month.`);

    // Group investments by the owner (userId)
    const investmentsByUser = groupBy(investments, 'userId');

    const users = Object.keys(investmentsByUser);
    console.log(
      `Found ${users.length} users with expiring investments this month.`
    );

    // We use Promise.all to send emails in parallel.
    await Promise.all(
      users.map((userId) => {
        const userInvestments = investmentsByUser[userId];
        // The user object is attached to each investment, so we can grab it from the first one.
        const user = userInvestments[0].user;
        return sendMonthlyDigest(user, userInvestments);
      })
    );

    console.log('Monthly digest job completed successfully.');
    return { success: true, message: `Sent digests to ${users.length} users.` };
  } catch (error) {
    console.error('Error in monthly digest job:', error);
    return { success: false, message: 'An error occurred.' };
  }
}
