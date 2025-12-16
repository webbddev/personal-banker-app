'use server';

import { checkUser } from '@/lib/checkUser';
import {
  findInvestmentsFor30DayNotification,
  findInvestmentsForMonthlyNotification,
} from '@/lib/expirations';
import {
  sendDailyReminder,
  sendMonthlyDigest,
  sendThirtyDayReminder,
} from '@/lib/mailer';
import { prisma } from '@/lib/prisma';
import { groupBy } from '@/utils/group-by';
import { addDays } from 'date-fns';

/**
 * Sends an on-demand email to the current user with a list of their investments
 * expiring in the next 30 days.
 */
export async function sendReminderEmail() {
  try {
    const user = await checkUser();

    if (!user) {
      return {
        success: false,
        error: 'User not authenticated',
      };
    }

    if (!user.email) {
      return {
        success: false,
        error: 'User email not found',
      };
    }

    // Get investments expiring in the next 30 days
    const now = new Date();
    const thirtyDaysFromNow = addDays(now, 30);

    const investments = await prisma.investment.findMany({
      where: {
        userId: user.clerkUserId,
        expirationDate: {
          gte: now,
          lte: thirtyDaysFromNow,
        },
      },
      orderBy: { expirationDate: 'asc' },
    });

    if (investments.length === 0) {
      return {
        success: true,
        message: 'No investments are expiring in the next 30 days.',
      };
    }

    // Send the email
    const emailSent = await sendThirtyDayReminder(user, investments);

    if (emailSent) {
      return {
        success: true,
        message: `Reminder email sent to ${user.email} with ${investments.length} investment(s)`,
      };
    } else {
      return {
        success: false,
        error: 'Failed to send email',
      };
    }
  } catch (error) {
    console.error('Error sending reminder email:', error);
    return {
      success: false,
      error: 'An error occurred while sending the reminder email',
    };
  }
}

/**
 * Fetches all investments that are expiring in exactly 30 days and sends a
 * reminder email for each one. This function is intended to be called by a daily cron job.
 */
export async function sendDailyReminders() {
  console.log('Running daily reminder job...');
  try {
    const investments = await findInvestmentsFor30DayNotification();
    console.log(`Found ${investments.length} investments expiring in 30 days.`);

    // We use Promise.all to send emails in parallel, which is more efficient.
    const results = await Promise.all(
      investments.map((investment) => sendDailyReminder(investment))
    );

    const successfulSends = results.filter(Boolean).length;
    const failedSends = investments.length - successfulSends;

    console.log(
      `Daily reminder job completed. Successful: ${successfulSends}, Failed: ${failedSends}.`
    );
    return {
      success: true,
      message: `Processed ${investments.length} reminders. Successful: ${successfulSends}, Failed: ${failedSends}.`,
      found: investments.length,
      successfulSends,
      failedSends,
    };
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
    const investments = await findInvestmentsForMonthlyNotification();
    console.log(`Found ${investments.length} investments expiring this month.`);

    // Group investments by the owner (userId)
    const investmentsByUser = groupBy(investments, 'userId');

    const users = Object.keys(investmentsByUser);
    console.log(
      `Found ${users.length} users with expiring investments this month.`
    );

    // We use Promise.all to send emails in parallel.
    const results = await Promise.all(
      users.map((userId) => {
        const userInvestments = investmentsByUser[userId];
        // The user object is attached to each investment, so we can grab it from the first one.
        const user = userInvestments[0].user;
        return sendMonthlyDigest(user, userInvestments);
      })
    );

    const successfulSends = results.filter(Boolean).length;
    const failedSends = users.length - successfulSends;

    console.log(
      `Monthly digest job completed. Successful: ${successfulSends}, Failed: ${failedSends}.`
    );
    return {
      success: true,
      message: `Processed ${users.length} digests. Successful: ${successfulSends}, Failed: ${failedSends}.`,
      found: users.length,
      successfulSends,
      failedSends,
    };
  } catch (error) {
    console.error('Error in monthly digest job:', error);
    return { success: false, message: 'An error occurred.' };
  }
}
