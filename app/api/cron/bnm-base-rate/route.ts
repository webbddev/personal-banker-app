import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { fetchBnmBaseRate } from '@/utils/bnm-scraper';
import { sendBaseRateChangeEmail } from '@/lib/mailer';

export const revalidate = 0; // Disable cache for this cron route

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
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

      if (isActualChange && oldRate !== null) {
        await prisma.bnmBaseRate.create({
          data: {
            rate: scrapedRate,
          },
        });
      }

      // Send email notification to Admin/User.
      // NOTE: Resend "testing free tier" can ONLY send emails to the exact address
      // verified on the Resend account!
      const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_FROM;
      if (adminEmail) {
        emailSentStatus = await sendBaseRateChangeEmail(
          adminEmail,
          oldRate,
          scrapedRate,
        );
      } else {
        console.warn(
          'No ADMIN_EMAIL or EMAIL_FROM configured for base rate notification',
        );
      }
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
