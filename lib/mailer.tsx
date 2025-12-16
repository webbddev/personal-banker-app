import { Resend } from 'resend';
import { Investment, User } from '@/prisma/generated/prisma/client';
import { format } from 'date-fns';
import { render } from '@react-email/render';
import { DailyReminderEmail } from '@/emails/DailyReminderEmail';
import { MonthlyDigestEmail } from '@/emails/MonthlyDigestEmail';
import { formatAmount } from '@/utils/currency-formatter';
import ThirtyDayReminderEmail from '@/emails/ThirtyDayReminderEmail';

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.EMAIL_FROM;

// Use the explicit APP_BASE_URL if set, otherwise fallback (mostly for local dev)
const appBaseUrl = process.env.APP_BASE_URL || 'http://localhost:3000';

if (!fromEmail) {
  console.error(
    'EMAIL_FROM environment variable is not set. Emails will not be sent.'
  );
}

type InvestmentWithUser = Investment & { user: User };

function formatInvestment(inv: Investment) {
  return {
    id: inv.id,
    name: inv.organisationName,
    interestRate: inv.interestRate,
    formattedValue: formatAmount(inv.investmentAmount, inv.currency),
    expirationDate: format(inv.expirationDate, 'PPP'),
  };
}

async function sendEmail({
  to,
  subject,
  component,
}: {
  to: string;
  subject: string;
  component: React.ReactElement;
}): Promise<boolean> {
  if (!fromEmail) return false;

  const emailHtml = await render(component);

  try {
    await resend.emails.send({ from: fromEmail, to, subject, html: emailHtml });
    console.log(`✅ Email sent to ${to} | ${subject}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}`, error);
    return false;
  }
}

export async function sendDailyReminder(
  investment: InvestmentWithUser
): Promise<boolean> {
  if (!investment.user.email) {
    console.error(`User ${investment.user.id} does not have an email address.`);
    return false;
  }

  // UNCOMMENTED appBaseUrl passing
  return sendEmail({
    to: investment.user.email,
    subject: `🔔 Reminder: Your Investment with ${investment.organisationName} is Expiring Soon!`,
    component: (
      <DailyReminderEmail
        userFirstName={investment.user.name || 'there'}
        investments={[formatInvestment(investment)]}
        appBaseUrl={appBaseUrl}
      />
    ),
  });
}

export async function sendMonthlyDigest(
  user: User,
  investments: Investment[]
): Promise<boolean> {
  if (!user.email || investments.length === 0) {
    console.error(`Skipping monthly digest for ${user.id}`);
    return false;
  }

  // UNCOMMENTED appBaseUrl passing
  return sendEmail({
    to: user.email,
    subject: '🗓️ Your Monthly Investment Expiration Summary',
    component: (
      <MonthlyDigestEmail
        userFirstName={user.name || 'there'}
        investments={investments.map(formatInvestment)}
        appBaseUrl={appBaseUrl}
      />
    ),
  });
}

export async function sendThirtyDayReminder(
  user: User,
  investments: Investment[]
): Promise<boolean> {
  if (!user.email || investments.length === 0) {
    console.error(`Skipping 30-day reminder for ${user.id}`);
    return false;
  }

  return sendEmail({
    to: user.email,
    subject: '🔔 Your 30-Day Investment Expiration Reminder',
    component: (
      <ThirtyDayReminderEmail
        userFirstName={user.name || 'there'}
        investments={investments.map(formatInvestment)}
        appBaseUrl={appBaseUrl}
      />
    ),
  });
}
