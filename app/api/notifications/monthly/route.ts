import { NextResponse } from 'next/server';
import { sendMonthlyDigests } from '@/app/actions/send-reminders';
import { headers } from 'next/headers';

export async function GET(request: Request) {
  const headersList = await headers();
  const cronSecret = headersList.get('x-vercel-cron-secret');

  if (process.env.NODE_ENV === 'production') {
    if (cronSecret !== process.env.CRON_SECRET) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
  }

  try {
    const result = await sendMonthlyDigests();
    return NextResponse.json({ ...result, success: true });
  } catch (error) {
    console.error('Error in monthly notifications route:', error);
    return NextResponse.json(
      { success: false, message: 'An internal error occurred.' },
      { status: 500 }
    );
  }
}
