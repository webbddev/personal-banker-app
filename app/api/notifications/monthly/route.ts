import { NextResponse } from 'next/server';
import { sendMonthlyDigests } from '@/app/actions/send-reminders';

export const revalidate = 0;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cronSecret = searchParams.get('cron_secret');

  if (process.env.NODE_ENV === 'production') {
    if (cronSecret !== process.env.CRON_SECRET) {
      return new NextResponse('Unauthorized', { status: 401 });
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
