import { Resend } from 'resend';
import type { Investment, User } from '@prisma/client';
import { formatAmount } from '@/utils/currency-formatter';
import { format } from 'date-fns';

// 1. Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// 2. Get environment variables
const fromEmail = process.env.EMAIL_FROM;
const appBaseUrl = process.env.APP_BASE_URL || 'http://localhost:3000';

if (!fromEmail) {
  // In a real app, you'd want to throw an error or have a better fallback.
  // For this implementation, we log an error and prevent the app from crashing.
  console.error(
    'EMAIL_FROM environment variable is not set. Emails will not be sent.'
  );
}

// Type for investment that includes the user object, which is what our DB query will return
type InvestmentWithUser = Investment & { user: User };

/**
 * Sends a daily reminder email for a single investment expiring in 30 days.
 * @param investment - The investment object, including the related user.
 * @returns A boolean indicating whether the email was sent successfully.
 */
export async function sendDailyReminder(
  investment: InvestmentWithUser
): Promise<boolean> {
  if (!fromEmail) return false; // Don't proceed if the from email isn't configured.

  const { user, organisationName, investmentAmount, currency, expirationDate } =
    investment;

  if (!user.email) {
    console.error(
      `User ${user.id} does not have an email address. Skipping reminder.`
    );
    return false;
  }

  const subject = `🔔 Reminder: Your Investment with ${organisationName} is Expiring Soon!`;
  const investmentUrl = `${appBaseUrl}/investments`;
  const formattedExpirationDate = format(expirationDate, 'PPP'); // e.g., "Aug 29, 2025"
  const formattedAmount = formatAmount(investmentAmount, currency);

  const body = `
    <div style="font-family: sans-serif; line-height: 1.6;">
      <h1>Investment Expiration Reminder</h1>
      <p>Hi ${user.name || 'there'},</p>
      <p>This is a reminder that your investment with <strong>${organisationName}</strong> is expiring in 30 days, on <strong>${formattedExpirationDate}</strong>.</p>
      <ul style="list-style-type: none; padding: 0;">
        <li><strong>Organisation:</strong> ${organisationName}</li>
        <li><strong>Amount:</strong> ${formattedAmount}</li>
        <li><strong>Expiration Date:</strong> ${formattedExpirationDate}</li>
      </ul>
      <p>Please log in to your dashboard to review the details and take any necessary action.</p>
      <a href="${investmentUrl}" style="display: inline-block; padding: 10px 15px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Go to My Investments</a>
      <br/>
      <p style="margin-top: 20px; font-size: 0.9em; color: #555;">Thank you,<br/>The My Personal Banker Team</p>
    </div>
  `;

  try {
    await resend.emails.send({
      from: fromEmail,
      to: user.email,
      subject: subject,
      html: body,
    });
    console.log(
      `Sent daily reminder to ${user.email} for investment ${investment.id}`
    );
    return true;
  } catch (error) {
    console.error(`Failed to send daily reminder to ${user.email}`, error);
    return false;
  }
}

/**
 * Sends a monthly digest email summarizing all investments expiring in the current month for a user.
 * @param user - The user to whom the digest will be sent.
 * @param investments - A list of the user's investments expiring this month.
 * @returns A boolean indicating whether the email was sent successfully.
 */
export async function sendMonthlyDigest(
  user: User,
  investments: Investment[]
): Promise<boolean> {
  if (!fromEmail || investments.length === 0) return false;

  if (!user.email) {
    console.error(
      `User ${user.id} does not have an email address. Skipping digest.`
    );
    return false;
  }

  const subject = `🗓️ Your Monthly Investment Expiration Summary`;
  const investmentUrl = `${appBaseUrl}/investments`;

  const investmentsListHtml = investments
    .map(
      (inv) => `
    <li style="margin-bottom: 10px;">
      <strong>${inv.organisationName}</strong>: ${formatAmount(
        inv.investmentAmount,
        inv.currency
      )} expiring on <strong>${format(inv.expirationDate, 'PPP')}</strong>
    </li>`
    )
    .join('');

  const body = `
    <div style="font-family: sans-serif; line-height: 1.6;">
      <h1>Monthly Investment Summary</h1>
      <p>Hi ${user.name || 'there'},</p>
      <p>Here is a summary of your investments that are expiring this month:</p>
      <ul style="list-style-type: none; padding: 0;">
        ${investmentsListHtml}
      </ul>
      <p>Please log in to your dashboard to review the details and plan accordingly.</p>
      <a href="${investmentUrl}" style="display: inline-block; padding: 10px 15px; background-color: #40C1AC; color: white; text-decoration: none; border-radius: 5px;">Go to My Investments</a>
      <br/>
      <p style="margin-top: 20px; font-size: 0.9em; color: #555;">Thank you,<br/>The My Personal Banker Team</p>
    </div>
  `;

  try {
    await resend.emails.send({
      from: fromEmail,
      to: user.email,
      subject: subject,
      html: body,
    });
    console.log(`Sent monthly digest to ${user.email}`);
    return true;
  } catch (error) {
    console.error(`Failed to send monthly digest to ${user.email}`, error);
    return false;
  }
}
