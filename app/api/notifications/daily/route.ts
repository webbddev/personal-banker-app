import { NextResponse } from 'next/server';
import { sendDailyReminders } from '@/app/actions/send-reminders';

// This is the API route that will be called by the Vercel Cron Job.
export async function GET(request: Request) {
  // 1. Secure the endpoint
  const authHeader = request.headers.get('authorization');
  if (
    process.env.NODE_ENV === 'production' &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new Response('Unauthorized', {
      status: 401,
    });
  }

  // 2. Trigger the daily reminder function
  try {
    const result = await sendDailyReminders();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in daily notification API route:', error);
    return NextResponse.json(
      { success: false, message: 'An internal error occurred.' },
      { status: 500 }
    );
  }
}
