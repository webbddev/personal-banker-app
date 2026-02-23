'use client';

import { formatAmount } from '@/utils/currency-formatter';
import type { CurrencyTotals } from '@/utils/investment-calculations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Landmark, Euro, PoundSterling, DollarSign, TrendingUp } from 'lucide-react';

type MonthlyReturnsDisplayProps = {
  totals: CurrencyTotals;
};

export function MonthlyReturnsDisplay({ totals }: MonthlyReturnsDisplayProps) {
  const returnData = [
    {
      label: 'MDL Monthly Return',
      value: totals.MDL,
      currency: 'MDL',
      icon: <Landmark className="h-4 w-4 text-emerald-500" />,
      gradient: 'from-emerald-500/10 to-teal-500/10',
    },
    {
      label: 'EUR Monthly Return',
      value: totals.EUR,
      currency: 'EUR',
      icon: <Euro className="h-4 w-4 text-blue-500" />,
      gradient: 'from-blue-500/10 to-indigo-500/10',
    },
    {
      label: 'GBP Monthly Return',
      value: totals.GBP,
      currency: 'GBP',
      icon: <PoundSterling className="h-4 w-4 text-purple-500" />,
      gradient: 'from-purple-500/10 to-pink-500/10',
    },
    {
      label: 'USD Monthly Return',
      value: totals.USD,
      currency: 'USD',
      icon: <DollarSign className="h-4 w-4 text-amber-500" />,
      gradient: 'from-amber-500/10 to-orange-500/10',
    },
  ].filter(item => item.value > 0);

  if (returnData.length === 0) {
    return (
      <div className="p-8 text-center border-2 border-dashed rounded-xl border-slate-200 dark:border-slate-800">
        <p className="text-slate-500 dark:text-slate-400">No monthly returns to display for your current active investments.</p>
      </div>
    );
  }

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
      {returnData.map((item) => (
        <Card key={item.label} className="overflow-hidden border-none shadow-md bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm transition-all hover:shadow-lg hover:-translate-y-1">
          <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-50`} />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              {item.label}
            </CardTitle>
            <div className="p-2 bg-white dark:bg-slate-800 rounded-full shadow-sm">
              {item.icon}
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {formatAmount(item.value, item.currency)}
            </div>
            <div className="flex items-center pt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>Monthly Return</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}


