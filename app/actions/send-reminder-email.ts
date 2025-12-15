'use server';

import { checkUser } from '@/lib/checkUser';
import { prisma } from '@/lib/prisma';
import { sendMonthlyDigest } from '@/lib/mailer';
import { startOfMonth, endOfMonth, addDays } from 'date-fns';

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
    const emailSent = await sendMonthlyDigest(user, investments);

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
