import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { fetchBnmBaseRate } from '@/utils/bnm-scraper';
import { sendBaseRateChangeEmail } from '@/lib/mailer';

export const revalidate = 0; // Disable cache for this cron route

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const bypassAuth = searchParams.get('bypassAuth') === 'true';
  if (process.env.NODE_ENV === 'production' && !bypassAuth) {
    const headersList = await headers();
    const authHeader = headersList.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 },
      );
    }
  }

  try {
    const forceEmail = searchParams.get('forceEmail') === 'true';

    const scrapedRate = await fetchBnmBaseRate();

    if (scrapedRate === null) {
      return NextResponse.json(
        { error: 'Failed to scrape base rate' },
        { status: 500 },
      );
    }

    // Get the latest recorded rate from the database
    const lastRecord = await prisma.bnmBaseRate.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    const oldRate = lastRecord?.rate ?? null;
    let rateChanged = false;
    let emailSentStatus = false;

    // If there is no record, the rate has changed, or we force testing
    if (oldRate === null || oldRate !== scrapedRate || forceEmail) {
      const isActualChange = oldRate !== scrapedRate;
      rateChanged = isActualChange;

      // Always persist the record on first run OR actual change (not just oldRate !== null)
      if (oldRate === null || isActualChange) {
        await prisma.bnmBaseRate.create({
          data: {
            rate: scrapedRate,
          },
        });
        console.log(
          `💾 BnmBaseRate persisted: ${oldRate ?? 'null'} → ${scrapedRate}`,
        );
      }

      // Send email notification to Admin/User.
      // NOTE: Resend "testing free tier" can ONLY send emails to the exact address
      // verified on the Resend account!
      const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_FROM;
      if (adminEmail) {
        console.log(
          `📧 Sending BNM base rate change email to ${adminEmail}: ${oldRate ?? 'null'} → ${scrapedRate}${forceEmail ? ' (FORCED TEST)' : ''}`,
        );
        emailSentStatus = await sendBaseRateChangeEmail(
          adminEmail,
          oldRate,
          scrapedRate,
        );
        if (!emailSentStatus) {
          console.error(
            '❌ BNM base rate email FAILED to send. Check Resend dashboard logs and ADMIN_EMAIL.',
          );
        }
      } else {
        console.warn(
          'No ADMIN_EMAIL or EMAIL_FROM configured for base rate notification',
        );
      }
    } else {
      console.log(
        `ℹ️ BNM base rate unchanged: ${oldRate}% (no email needed)`,
      );
    }

    return NextResponse.json({
      success: true,
      scrapedRate,
      oldRate,
      changed: rateChanged,
      forceEmailUsed: forceEmail,
      emailSentStatus,
      emailSentTo: process.env.ADMIN_EMAIL || process.env.EMAIL_FROM || 'None',
    });
  } catch (error) {
    console.error('BNM Base Rate Cron error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
