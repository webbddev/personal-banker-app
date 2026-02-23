'use server';

import { checkUser } from '@/lib/checkUser';
import { prisma } from '@/lib/prisma';
import { getLatestRates } from '@/utils/exchange-rate-service';
import { calculateTotalAmount } from '@/utils/investment-calculations';

/**
 * Fetches the total capital from all active investments,
 * converted to a base currency (MDL).
 */
export async function getInitialSimulatorData() {
  const user = await checkUser();
  if (!user) {
    return {
      totalCapital: 0,
      error: 'User not authenticated',
    };
  }

  try {
    const [investments, exchangeRates] = await Promise.all([
      prisma.investment.findMany({
        where: { userId: user.clerkUserId },
      }),
      getLatestRates(),
    ]);

    const totalCapital = calculateTotalAmount(investments, exchangeRates);

    return {
      totalCapital: Math.round(totalCapital),
      exchangeRates,
      success: true,
    };
  } catch (error) {
    console.error('Error fetching initial simulator data:', error);
    return {
      totalCapital: 0,
      error: 'Failed to fetch investment totals',
    };
  }
}
