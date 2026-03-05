'use server';

import { checkUser } from '@/lib/checkUser';
import {
  findInvestmentsExpiringOnDay,
  findInvestmentsFor30DayNotification,
  findInvestmentsForMonthlyNotification,
} from '@/lib/expirations';
import {
  sendDailyReminder,
  sendMonthlyDigest,
  sendThirtyDayReminder,
} from '@/lib/mailer';
import { sendTelegramMessage } from '@/lib/telegram';
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
 * Sends an on-demand Telegram message to the user with all investments
 * expiring within the next 30 days.
 */
export async function sendTelegramReminder() {
  try {
    const user = await checkUser();

    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

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

    const appUrl = 'https://personal-banker-niko.vercel.app/investments';

    const details = investments
      .map(
        (inv) =>
          `• <b>${inv.organisationName}</b> 💰 ${inv.currency} ${inv.investmentAmount.toLocaleString()} | 📈 ${inv.interestRate}% 📅 Expires: ${new Date(inv.expirationDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`,
      )
      .join('\n');

    const message =
      `📋 <b>Upcoming Maturities (next 30 days)</b>\n\n` +
      `Hi ${user.name || 'there'},\n\n` +
      `You have ${investments.length} investment${investments.length === 1 ? '' : 's'} expiring soon:\n\n` +
      `${details}\n\n` +
      `🔗 Check your <a href="${appUrl}">dashboard</a>`;

    const sent = await sendTelegramMessage(message);

    if (sent) {
      return {
        success: true,
        message: `Telegram reminder sent with ${investments.length} investment(s)`,
      };
    } else {
      return {
        success: false,
        error: 'Failed to send Telegram message. Check bot configuration.',
      };
    }
  } catch (error) {
    console.error('Error sending Telegram reminder:', error);
    return {
      success: false,
      error: 'An error occurred while sending the Telegram reminder',
    };
  }
}

/**
 * Helper to process reminders for a specific day interval.
 */
async function processRemindersForInterval(
  days: number,
  options: { sendEmail: boolean; sendTelegram: boolean },
) {
  const investments = await findInvestmentsExpiringOnDay(days);
  if (investments.length === 0) return { count: 0, users: 0 };

  const investmentsByUser = groupBy(investments, 'userId');
  const users = Object.keys(investmentsByUser);

  await Promise.all(
    users.map(async (userId) => {
      const userInvestments = (investmentsByUser as any)[userId];
      const user = userInvestments[0].user;

      // Send Email
      if (options.sendEmail) {
        await sendThirtyDayReminder(user, userInvestments);
      }

      // Send Telegram
      if (options.sendTelegram) {
        const count = userInvestments.length;
        const mainSubject =
          days === 1
            ? `🚨 <b>Urgent: Investment Expiring Tomorrow!</b>`
            : `🔔 <b>Investment Reminder: ${days} days to go</b>`;

        const details = userInvestments
          .map(
            (inv: any) =>
              `• <b>${inv.organisationName}</b> 💰 ${inv.currency} ${inv.investmentAmount.toLocaleString()} | 📈 ${inv.interestRate}% 📅 Expires: ${new Date(inv.expirationDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`,
          )
          .join('\n');

        const appUrl = 'https://personal-banker-niko.vercel.app/investments';

        const message =
          `${mainSubject}\n\n` +
          `Hi ${user.name || 'there'},\n\n` +
          `${count === 1 ? 'An investment is' : `${count} investments are`} ` +
          `expiring in ${days} day${days === 1 ? '' : 's'}:\n\n` +
          `${details}\n\n` +
          `🔗 Check your <a href="${appUrl}">dashboard</a>`;

        await sendTelegramMessage(message);
      }
    }),
  );

  return { count: investments.length, users: users.length };
}

/**
 * Main cron job: runs daily to check for upcoming expirations.
 */
export async function sendDailyReminders() {
  console.log('Running daily reminder job...');
  try {
    // 30 Days: Email Only
    const r30 = await processRemindersForInterval(30, {
      sendEmail: true,
      sendTelegram: false,
    });

    // 7 Days: Email + Telegram
    const r7 = await processRemindersForInterval(7, {
      sendEmail: true,
      sendTelegram: true,
    });

    // 1 Day: Email + Telegram
    const r1 = await processRemindersForInterval(1, {
      sendEmail: true,
      sendTelegram: true,
    });

    console.log(
      `Daily reminders sent: 30d(${r30.count}), 7d(${r7.count}), 1d(${r1.count})`,
    );

    return {
      success: true,
      stats: { r30, r7, r1 },
    };
  } catch (error) {
    console.error('Error in daily reminder job:', error);
    return {
      success: false,
      message: 'An error occurred during the daily job.',
    };
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
      `Found ${users.length} users with expiring investments this month.`,
    );

    // We use Promise.all to send emails in parallel.
    const results = await Promise.all(
      users.map((userId) => {
        const userInvestments = investmentsByUser[userId];
        // The user object is attached to each investment, so we can grab it from the first one.
        const user = userInvestments[0].user;
        return sendMonthlyDigest(user, userInvestments);
      }),
    );

    const successfulSends = results.filter(Boolean).length;
    const failedSends = users.length - successfulSends;

    console.log(
      `Monthly digest job completed. Successful: ${successfulSends}, Failed: ${failedSends}.`,
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
