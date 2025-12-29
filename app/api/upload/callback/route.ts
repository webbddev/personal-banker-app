import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // This endpoint is called by Vercel Blob when an upload is completed
    // You can add any additional processing here if needed
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Callback error:', error);
    return NextResponse.json(
      { error: 'Callback processing failed' },
      { status: 500 }
    );
  }
}
