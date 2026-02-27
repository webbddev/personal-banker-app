'use server';

import { prisma } from '@/lib/prisma';
import { checkUser } from '@/lib/checkUser';

export type MarketIntelligenceDataPoint = {
  date: string; // ISO string or formatted
  month: string; // Display label e.g. "Jan 2024"
  baseRate: number | null;
  inflation: number | null;
  mdlGovBondAvg: number | null;
  mdlDepositAvg: number | null;
};

/**
 * Fetches all market intelligence data:
 * - Historical BNM Base Rate
 * - Historical Inflation
 * - MDL Government Bond average interest rates (per month based on active investments)
 * - MDL Bank Deposit average interest rates (per month based on active investments)
 *
 * Returns a merged time series for the chart.
 */
export async function getMarketIntelligenceData(): Promise<
  MarketIntelligenceDataPoint[]
> {
  const user = await checkUser();
  if (!user) return [];

  try {
    // 1. Fetch all market indicators
    const marketIndicators = await prisma.marketIndicator.findMany({
      orderBy: { date: 'asc' },
    });

    // 2. Fetch all ACTIVE MDL investments (government bonds & bank deposits)
    const investments = await prisma.investment.findMany({
      where: {
        userId: user.clerkUserId,
        currency: 'MDL',
        investmentType: { in: ['governmentBond', 'bankDeposit'] },
      },
      select: {
        investmentType: true,
        interestRate: true,
        createdAt: true,
        expirationDate: true,
      },
    });

    // 3. Build a map of all dates from market indicators
    const dateMap = new Map<
      string,
      {
        baseRate: number | null;
        inflation: number | null;
        mdlGovBondRates: number[];
        mdlDepositRates: number[];
      }
    >();

    for (const indicator of marketIndicators) {
      const key = getMonthKey(indicator.date);
      if (!dateMap.has(key)) {
        dateMap.set(key, {
          baseRate: null,
          inflation: null,
          mdlGovBondRates: [],
          mdlDepositRates: [],
        });
      }

      const entry = dateMap.get(key)!;
      if (indicator.name === 'BASE_RATE') {
        entry.baseRate = indicator.value;
      } else if (indicator.name === 'INFLATION') {
        entry.inflation = indicator.value;
      }
    }

    // 4. For each month key, calculate average interest rates for active investments
    // An investment is "active" for a month if its createdAt <= end of month AND expirationDate >= start of month
    for (const [key] of dateMap) {
      const [year, month] = key.split('-').map(Number);
      const monthStart = new Date(year, month - 1, 1);
      const monthEnd = new Date(year, month, 0, 23, 59, 59, 999);

      for (const inv of investments) {
        const created = new Date(inv.createdAt);
        const expires = new Date(inv.expirationDate);

        // Check if investment was active during this month
        if (created <= monthEnd && expires >= monthStart) {
          const entry = dateMap.get(key)!;
          if (inv.investmentType === 'governmentBond') {
            entry.mdlGovBondRates.push(inv.interestRate);
          } else if (inv.investmentType === 'bankDeposit') {
            entry.mdlDepositRates.push(inv.interestRate);
          }
        }
      }
    }

    // 5. Forward-fill logic
    const sortedKeys = Array.from(dateMap.keys()).sort();
    let lastBaseRate: number | null = null;
    let lastInflation: number | null = null;

    // Get current month/year to prevent "future" inflation fill
    const now = new Date();
    const currentMonthKey = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;

    for (const key of sortedKeys) {
      const entry = dateMap.get(key)!;

      // Base Rate: Always forward-fill as it's a persistent policy benchmark
      if (entry.baseRate !== null) {
        lastBaseRate = entry.baseRate;
      } else if (lastBaseRate !== null) {
        entry.baseRate = lastBaseRate;
      }

      // Inflation: Forward-fill ONLY up to the month PREVIOUS to current
      // (as current month data is typically released in the next month)
      if (entry.inflation !== null) {
        lastInflation = entry.inflation;
      } else if (lastInflation !== null && key < currentMonthKey) {
        entry.inflation = lastInflation;
      }
    }

    const result: MarketIntelligenceDataPoint[] = sortedKeys.map((key) => {
      const entry = dateMap.get(key)!;
      const [year, month] = key.split('-').map(Number);
      const date = new Date(Date.UTC(year, month - 1, 1));

      const monthLabel = date.toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
        timeZone: 'UTC', // Ensure label generation also uses UTC
      });

      const govBondAvg =
        entry.mdlGovBondRates.length > 0
          ? entry.mdlGovBondRates.reduce((a, b) => a + b, 0) /
            entry.mdlGovBondRates.length
          : null;

      const depositAvg =
        entry.mdlDepositRates.length > 0
          ? entry.mdlDepositRates.reduce((a, b) => a + b, 0) /
            entry.mdlDepositRates.length
          : null;

      return {
        date: date.toISOString(),
        month: monthLabel,
        baseRate: entry.baseRate,
        inflation: entry.inflation,
        mdlGovBondAvg:
          govBondAvg !== null ? Math.round(govBondAvg * 100) / 100 : null,
        mdlDepositAvg:
          depositAvg !== null ? Math.round(depositAvg * 100) / 100 : null,
      };
    });

    return result;
  } catch (error) {
    console.error('Error fetching market intelligence data:', error);
    return [];
  }
}

function getMonthKey(date: Date): string {
  const year = date.getUTCFullYear();
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  return `${year}-${month}`;
}
