'use client';

import {
  formatAmount,
  ExchangeRates,
  convertCurrency,
} from '@/utils/currency-formatter';
import type { CurrencyTotals } from '@/utils/investment-calculations';
import {
  Landmark,
  Euro,
  PoundSterling,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

type MonthlyReturnsDisplayProps = {
  totals: CurrencyTotals;
  exchangeRates: ExchangeRates;
};

const CURRENCY_META = {
  MDL: {
    label: 'MDL',
    icon: Landmark,
    accent: 'bg-emerald-500',
    text: 'text-emerald-600 dark:text-emerald-400',
    light: 'bg-emerald-50 dark:bg-emerald-950/20',
  },
  EUR: {
    label: 'EUR',
    icon: Euro,
    accent: 'bg-blue-500',
    text: 'text-blue-600 dark:text-blue-400',
    light: 'bg-blue-50 dark:bg-blue-950/20',
  },
  GBP: {
    label: 'GBP',
    icon: PoundSterling,
    accent: 'bg-purple-500',
    text: 'text-purple-600 dark:text-purple-400',
    light: 'bg-purple-50 dark:bg-purple-950/20',
  },
  USD: {
    label: 'USD',
    icon: DollarSign,
    accent: 'bg-amber-500',
    text: 'text-amber-600 dark:text-amber-400',
    light: 'bg-amber-50 dark:bg-amber-950/20',
  },
};

export function MonthlyReturnsDisplay({
  totals,
  exchangeRates,
}: MonthlyReturnsDisplayProps) {
  const returnData = (Object.keys(CURRENCY_META) as Array<keyof CurrencyTotals>)
    .filter((currency) => totals[currency] > 0)
    .map((currency) => ({
      currency,
      value: totals[currency],
      ...CURRENCY_META[currency],
    }));

  const totalInMDL = returnData.reduce((sum, item) => {
    return (
      sum + convertCurrency(item.value, item.currency, 'MDL', exchangeRates)
    );
  }, 0);

  if (returnData.length === 0) {
    return (
      <div className='p-8 text-center border-2 border-dashed rounded-xl border-muted'>
        <p className='text-muted-foreground'>
          No monthly returns to display for your current active investments.
        </p>
      </div>
    );
  }

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
      {returnData.map((item) => {
        const Icon = item.icon;
        const valueInMDL = convertCurrency(
          item.value,
          item.currency,
          'MDL',
          exchangeRates,
        );
        const shareOfTotal =
          totalInMDL > 0 ? (valueInMDL / totalInMDL) * 100 : 0;

        return (
          <Card
            key={item.currency}
            className='relative overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow'
          >
            <div
              className={`absolute top-0 left-0 right-0 h-1 ${item.accent}`}
            />
            <CardContent className='p-5'>
              <div className='flex items-start justify-between mb-3'>
                <div className={`p-2 rounded-lg ${item.light}`}>
                  <Icon className={`h-4 w-4 ${item.text}`} />
                </div>
                <div className='flex items-center gap-1 text-xs font-semibold text-muted-foreground'>
                  <TrendingUp className='h-3 w-3' />
                  {shareOfTotal.toFixed(0)}%
                </div>
              </div>

              <div className='space-y-1'>
                <p className='text-xs font-medium text-muted-foreground'>
                  {item.label} Monthly Return
                </p>
                <p className='text-2xl font-bold tracking-tight'>
                  {formatAmount(item.value, item.currency)}
                </p>
              </div>

              <div className='mt-4 pt-3 border-t border-border/60'>
                <p className='text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2'>
                  Equivalents
                </p>
                <div className='flex flex-wrap gap-1.5'>
                  {(Object.keys(CURRENCY_META) as Array<keyof CurrencyTotals>)
                    .filter((c) => c !== item.currency)
                    .map((targetCurrency) => (
                      <span
                        key={targetCurrency}
                        className='inline-flex items-center px-1.5 py-0.5 rounded bg-muted text-[10px] font-medium'
                      >
                        <span className='text-muted-foreground mr-1'>
                          {targetCurrency}
                        </span>
                        {formatAmount(
                          convertCurrency(
                            item.value,
                            item.currency,
                            targetCurrency,
                            exchangeRates,
                          ),
                          targetCurrency,
                        )}
                      </span>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
