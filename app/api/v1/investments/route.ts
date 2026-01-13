import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET Handler for fetching investment data
 * Accessible via: /api/v1/investments
 * Security: Requires 'x-api-key' header
 */
export async function GET(request: Request) {
  // 1. Extract API key from headers and server environment
  const apiKey = request.headers.get('x-api-key');
  const serverKey = process.env.N8N_API_KEY?.trim();

  // 2. Validate authentication
  if (!apiKey || apiKey !== serverKey) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Invalid API Key' },
      { status: 401 }
    );
  }

  try {
    // 3. Parse query parameters (e.g., ?email=user@example.com)
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    // 4. Fetch data from database using Prisma
    // If email is provided, filter by user; otherwise, fetch all
    const investments = await prisma.investment.findMany({
      where: email ? { user: { email: email } } : {},
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // 5. Return JSON response
    return NextResponse.json(investments);
  } catch (error) {
    // Log critical errors for server-side debugging
    console.error('API Database Error:', error);
    return NextResponse.json(
      { error: 'Database error', message: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}
