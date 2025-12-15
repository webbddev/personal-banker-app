import { NextResponse } from 'next/server';
import { sendDailyReminders } from '@/app/actions/send-reminders';
import { headers } from 'next/headers';

export async function GET(request: Request) {
  const headersList = await headers();
  const authHeader = headersList.get('authorization');

  // Vercel sends the secret in the Authorization header as "Bearer <CRON_SECRET>"
  if (process.env.NODE_ENV === 'production') {
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
  }

  try {
    const result = await sendDailyReminders();
    return NextResponse.json({ ...result, success: true });
  } catch (error) {
    console.error('Error in daily notifications route:', error);
    return NextResponse.json(
      { success: false, message: 'An internal error occurred.' },
      { status: 500 }
    );
  }
}
