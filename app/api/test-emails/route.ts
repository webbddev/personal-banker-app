import { NextResponse } from 'next/server';
import { sendBaseRateChangeEmail, sendInflationChangeEmail } from '@/lib/mailer';

export async function GET() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
      return NextResponse.json(
        { error: 'ADMIN_EMAIL is not configured in environment variables' },
        { status: 500 }
      );
    }

    // 1. Send test Base Rate change email
    const baseRateSuccess = await sendBaseRateChangeEmail(adminEmail, 3.60, 3.80);

    // 2. Send test Inflation change email
    const currentMonthStr = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const inflationSuccess = await sendInflationChangeEmail(adminEmail, 4.20, 4.50, currentMonthStr);

    return NextResponse.json({
      success: true,
      message: 'Test emails have been dispatched.',
      results: {
        baseRateSuccess,
        inflationSuccess,
        sentTo: adminEmail
      }
    });
  } catch (error) {
    console.error('Test email route error:', error);
    return NextResponse.json(
      { error: 'An error occurred while sending test emails', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
