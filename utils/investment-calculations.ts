import { FinancialInstrument } from '@/types/investment-schema';
// import { convertCurrency, SupportedCurrencyCode } from './currency-formatter';
import {
  convertCurrency,
  ExchangeRates,
  SupportedCurrencyCode,
} from './currency-formatter';

export { convertCurrency };

export type CurrencyTotals = {
  MDL: number;
  EUR: number;
  GBP: number;
  USD: number;
};

/**
 * Calculate total amounts invested in each currency
 */
export function calculateCurrencyTotals(
  investments: FinancialInstrument[]
): CurrencyTotals {
  return investments.reduce(
    (totals, investment) => {
      const amount = Number(investment.investmentAmount);
      switch (investment.currency) {
        case 'MDL':
          totals.MDL += amount;
          break;
        case 'EUR':
          totals.EUR += amount;
          break;
        case 'GBP':
          totals.GBP += amount;
          break;
        case 'USD':
          totals.USD += amount;
          break;
      }
      return totals;
    },
    { MDL: 0, EUR: 0, GBP: 0, USD: 0 }
  );
}
// worked well
// export function calculateCurrencyTotals(
//   data: FinancialInstrument[]
// ): CurrencyTotals {
//   return data.reduce(
//     (acc, investment) => {
//       const currency = investment.currency as SupportedCurrency;
//       acc[currency] = (acc[currency] || 0) + investment.investmentAmount;
//       return acc;
//     },
//     { MDL: 0, EUR: 0, GBP: 0 } as CurrencyTotals
//   );
// }

/**
 * Calculate total amount in MDL (legacy function)
 */
// export function calculateTotalAmount(data: FinancialInstrument[]): number {
export function calculateTotalAmount(
  data: FinancialInstrument[],
  exchangeRates: ExchangeRates
): number {
  return data.reduce((acc, investment) => {
    const amountInMDL = convertCurrency(
      investment.investmentAmount,
      investment.currency as SupportedCurrencyCode,
      'MDL',
      exchangeRates
    );
    return acc + amountInMDL;
  }, 0);
}

/**
 * Calculate the monthly return for an investment
 * Formula: (days in month × interest rate × investment amount) / 365
 * @param investmentAmount - The principal investment amount
 * @param annualInterestRate - Annual interest rate as a percentage (e.g., 2.5 for 2.5%)
 * @param date - Optional date to calculate for specific month (defaults to current month)
 * @returns The calculated monthly return amount
 */
export function calculateMonthlyReturn(
  investmentAmount: number,
  annualInterestRate: number,
  incomeTax: number,
  date: Date = new Date()
): number {
  // Get the number of days in the specified month
  const daysInMonth = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0
  ).getDate();

  // Convert annual interest rate from percentage to decimal
  const interestRateDecimal = annualInterestRate / 100;
  // Calculate monthly return using the formula
  const monthlyReturn =
    (daysInMonth * interestRateDecimal * investmentAmount) / 365;

  // Apply income tax if provided
  const taxAmount = monthlyReturn * (incomeTax / 100);
  const netReturn = monthlyReturn - taxAmount;

  // Round to 2 decimal places
  return Math.round(netReturn * 100) / 100;
}

/** COULD BE DELETED LATER IF NOT NEEDED
 * Format a monetary amount with currency symbol
 * @param amount - The amount to format
 * @param currency - The currency code (e.g., 'USD', 'EUR')
 * @returns Formatted string with currency symbol
 */
// export function formatAmount(amount: number, currency: string): string {
//   return new Intl.NumberFormat('en-US', {
//     style: 'currency',
//     currency: currency.toUpperCase(),
//   }).format(amount);
// }

/**
 * Calculate the number of days until expiration
 * @param expirationDate - The date when the investment expires
 * @returns The number of days until expiration (negative if already expired)
 */
export function calculateDaysUntilExpiration(expirationDate: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time component for accurate day comparison

  const expDate = new Date(expirationDate);
  expDate.setHours(0, 0, 0, 0);

  const diffTime = expDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Filters investments that are expiring within the next 7 days.
 * @param investments - An array of financial instruments.
 * @returns An array of investments expiring within 7 days.
 */
export function getInvestmentsExpiringIn7Days(
  investments: FinancialInstrument[]
): FinancialInstrument[] {
  return investments.filter((inv) => {
    const days = calculateDaysUntilExpiration(inv.expirationDate);
    return days > 0 && days <= 7;
  });
}

/**
 * Filters investments that are expiring within the next 30 days.
 * @param investments - An array of financial instruments.
 * @returns An array of investments expiring within 30 days.
 */
export function getInvestmentsExpiringIn30Days(
  investments: FinancialInstrument[]
): FinancialInstrument[] {
  return investments.filter((inv) => {
    const days = calculateDaysUntilExpiration(inv.expirationDate);
    return days > 7 && days <= 30;
  });
}

/**
 * Filters investments that have already expired.
 * @param investments - An array of financial instruments.
 * @returns An array of expired investments.
 */
export function getExpiredInvestments(
  investments: FinancialInstrument[]
): FinancialInstrument[] {
  return investments.filter((inv) => {
    const days = calculateDaysUntilExpiration(inv.expirationDate);
    return days <= 0;
  });
}


// Calculate monthly returns by currency
export function calculateMonthlyReturns(
  investments: FinancialInstrument[]
): CurrencyTotals {
  return investments.reduce(
    (totals, investment) => {
      const monthlyReturn = calculateMonthlyReturn(
        Number(investment.investmentAmount),
        Number(investment.interestRate),
        Number(investment.incomeTax)
      );

      switch (investment.currency) {
        case 'MDL':
          totals.MDL += monthlyReturn;
          break;
        case 'EUR':
          totals.EUR += monthlyReturn;
          break;
        case 'GBP':
          totals.GBP += monthlyReturn;
          break;
        case 'USD':
          totals.USD += monthlyReturn;
          break;
      }
      return totals;
    },
    { MDL: 0, EUR: 0, GBP: 0, USD: 0 }
  );
}

// Calculate monthly returns by investment type
export type MonthlyReturnsByInvestmentType = Record<string, CurrencyTotals>;

export function calculateMonthlyReturnsByInvestmentType(
  investments: FinancialInstrument[]
): MonthlyReturnsByInvestmentType {
  return investments.reduce((acc, investment) => {
    const { investmentType, currency } = investment;
    const monthlyReturn = calculateMonthlyReturn(
      Number(investment.investmentAmount),
      Number(investment.interestRate),
      Number(investment.incomeTax)
    );

    if (!acc[investmentType]) {
      acc[investmentType] = { MDL: 0, EUR: 0, GBP: 0, USD: 0 };
    }

    (acc[investmentType] as any)[currency as keyof CurrencyTotals] +=
      monthlyReturn;
    return acc;
  }, {} as MonthlyReturnsByInvestmentType);
}

// Average interest rates by investment type and currency
export type AverageInterestRatesByType = Record<string, Record<string, number>>;

/**
 * Calculate average interest rates by investment type and currency
 * Returns the average interest rate for each type and currency that has investments
 */
export function calculateAverageInterestRatesByType(
  investments: FinancialInstrument[]
): AverageInterestRatesByType {
  type GroupData = { totalRate: number; count: number };
  const typeGroups: Record<string, Record<string, GroupData>> = {};

  investments.forEach((investment) => {
    const { investmentType, currency, interestRate } = investment;
    if (!typeGroups[investmentType]) {
      typeGroups[investmentType] = {};
    }
    if (!typeGroups[investmentType][currency]) {
      typeGroups[investmentType][currency] = { totalRate: 0, count: 0 };
    }
    typeGroups[investmentType][currency].totalRate += Number(interestRate);
    typeGroups[investmentType][currency].count += 1;
  });

  const result: AverageInterestRatesByType = {};
  Object.entries(typeGroups).forEach(([type, currencies]) => {
    result[type] = {};
    Object.entries(currencies).forEach(([currency, data]) => {
      result[type][currency] = data.totalRate / data.count;
    });
  });

  return result;
}

// Calculate total monthly revenue in MDL
export function calculateTotalMonthlyRevenueInMDL(
  monthlyReturns: CurrencyTotals,
  exchangeRates: ExchangeRates
): number {
  return Object.entries(monthlyReturns).reduce((total, [currency, amount]) => {
    return (
      total +
      convertCurrency(
        amount,
        currency as SupportedCurrencyCode,
        'MDL',
        exchangeRates
      )
    );
  }, 0);
}