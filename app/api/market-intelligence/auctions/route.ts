import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/market-intelligence/auctions
 *
 * Returns the 10 most recent GS bond auction records,
 * sorted by auction date descending.
 */
export async function GET() {
  try {
    const auctions = await prisma.bondAuction.findMany({
      orderBy: { auctionDate: 'desc' },
      take: 10,
    });

    return NextResponse.json(auctions);
  } catch (error) {
    console.error('Error fetching auctions:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch auctions',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
