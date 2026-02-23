'use client';

import {
  CURRENCY_OPTIONS,
  formatAmount,
  convertCurrency,
  SupportedCurrencyCode,
  ExchangeRates,
} from '@/utils/currency-formatter';
import type { CurrencyTotals } from '@/utils/investment-calculations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Coins, ArrowRightLeft } from 'lucide-react';

type CurrencyEquivalentTotalProps = {
  totals: CurrencyTotals;
  exchangeRates: ExchangeRates;
};

export function CurrencyEquivalentTotal({
  totals,
  exchangeRates,
}: CurrencyEquivalentTotalProps) {
  const activeTotals = Object.entries(totals).filter(([, amount]) => amount > 0);

  if (activeTotals.length === 0) {
    return null; // Don't show the section header at all if no investments
  }

  return (
    <div className='mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
      {activeTotals.map(([currency, amount]) => {
        const from = currency as SupportedCurrencyCode;

        return (
          <Card key={currency} className="border-none shadow-md bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm transition-all hover:shadow-lg">
             <div className="absolute top-0 right-0 p-3 opacity-10 dark:opacity-5">
              <Coins className="h-12 w-12" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Total in {currency}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                {formatAmount(amount, currency.toLowerCase())}
              </div>

              <div className='space-y-2 border-t pt-4 dark:border-slate-800'>
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">
                  <ArrowRightLeft className="h-3 w-3" />
                  Equivalents
                </div>
                {CURRENCY_OPTIONS.filter((opt) => opt.label !== currency).map(
                  (opt) => {
                    const to = opt.label as SupportedCurrencyCode;
                    const converted = convertCurrency(
                      amount,
                      from,
                      to,
                      exchangeRates
                    );

                    return (
                      <div key={opt.value} className="flex justify-between items-center group">
                        <span className="text-xs text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
                          {opt.label}
                        </span>
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
                          {formatAmount(converted, opt.value)}
                        </span>
                      </div>
                    );
                  }
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// 'use client';

// import { useEffect } from 'react';
// import {
//   CURRENCY_OPTIONS,
//   formatAmount,
//   convertCurrency,
//   SupportedCurrencyCode,
// } from '@/utils/currency-formatter';
// import { useInvestmentStore } from '@/store/financialInvestmentsStore';
// import type { CurrencyTotals } from '@/utils/investment-calculations';

// type CurrencyEquivalentTotalProps = {
//   totals: CurrencyTotals; // passed from InvestmentsPage (same pattern as MonthlyReturnsDisplay)
// };

// export function CurrencyEquivalentTotal({
//   totals,
// }: CurrencyEquivalentTotalProps) {
//   // Only use the store for exchange rates
//   const exchangeRates = useInvestmentStore((s) => s.exchangeRates);
//   const exchangeRatesLoading = useInvestmentStore(
//     (s) => s.exchangeRatesLoading
//   );
//   const fetchExchangeRates = useInvestmentStore((s) => s.fetchExchangeRates);

//   // Load exchange rates once (service layer caches)
//   useEffect(() => {
//     if (!exchangeRates && !exchangeRatesLoading) {
//       fetchExchangeRates();
//     }
//   }, [exchangeRates, exchangeRatesLoading, fetchExchangeRates]);

//   if (exchangeRatesLoading) {
//     return (
//       <div className='mt-4 grid grid-cols-1 md:grid-cols-4 gap-4'>
//         <div className='space-y-1 border rounded-lg p-4 bg-card'>
//           <p className='text-sm text-muted-foreground'>
//             Loading exchange rates...
//           </p>
//         </div>
//       </div>
//     );
//   }

//   if (!exchangeRates) {
//     return (
//       <div className='mt-4 grid grid-cols-1 md:grid-cols-4 gap-4'>
//         <div className='space-y-1 border rounded-lg p-4 bg-card'>
//           <p className='text-sm text-destructive'>
//             Failed to load exchange rates
//           </p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className='mt-4 grid grid-cols-1 md:grid-cols-4 gap-4'>
//       {Object.entries(totals).map(([currency, amount]) => {
//         const from = currency as SupportedCurrencyCode;

//         return (
//           <div
//             key={currency}
//             className='space-y-1 border rounded-lg p-4 bg-card'
//           >
//             <p className='font-medium'>
//               Total invested in {currency}:{' '}
//               {formatAmount(amount, currency.toLowerCase())}
//             </p>

//             <div className='text-sm text-muted-foreground pl-4 space-y-1'>
//               {CURRENCY_OPTIONS.filter((opt) => opt.label !== currency).map(
//                 (opt) => {
//                   const to = opt.label as SupportedCurrencyCode;
//                   const converted = convertCurrency(
//                     amount,
//                     from,
//                     to,
//                     exchangeRates
//                   );

//                   return (
//                     <p key={opt.value}>
//                       {opt.label} equivalent:{' '}
//                       {formatAmount(converted, opt.value)}
//                     </p>
//                   );
//                 }
//               )}
//             </div>
//           </div>
//         );
//       })}
//     </div>
//   );
// }

// 'use client';

// import { useEffect } from 'react';
// import {
//   CURRENCY_OPTIONS,
//   formatAmount,
//   convertCurrency,
//   SupportedCurrencyCode,
// } from '@/utils/currency-formatter';
// import { useInvestmentStore } from '@/store/financialInvestmentsStore';
// import { CurrencyTotals } from '@/utils/investment-calculations';

// type CurrencyEquivalentTotalProps = {
//   totals: CurrencyTotals;
// };

// export function CurrencyEquivalentTotal({
//   totals,
// }: CurrencyEquivalentTotalProps) {
//   const currencyTotals = useInvestmentStore((state) => state.currencyTotals);
//   const exchangeRates = useInvestmentStore((state) => state.exchangeRates);
//   const exchangeRatesLoading = useInvestmentStore(
//     (state) => state.exchangeRatesLoading
//   );
//   const fetchExchangeRates = useInvestmentStore(
//     (state) => state.fetchExchangeRates
//   );

//   useEffect(() => {
//     if (!exchangeRates) {
//       fetchExchangeRates(); // Service layer handles caching automatically
//     }
//   }, [exchangeRates, fetchExchangeRates]);

//   if (exchangeRatesLoading) {
//     return (
//       <div className='mt-4 grid grid-cols-1 md:grid-cols-4 gap-4'>
//         <div className='space-y-1 border rounded-lg p-4 bg-card'>
//           <p className='text-sm text-muted-foreground'>
//             Loading exchange rates...
//           </p>
//         </div>
//       </div>
//     );
//   }

//   if (!exchangeRates) {
//     return (
//       <div className='mt-4 grid grid-cols-1 md:grid-cols-4 gap-4'>π
//         <div className='space-y-1 border rounded-lg p-4 bg-card'>
//           <p className='text-sm text-destructive'>
//             Failed to load exchange rates
//           </p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className='mt-4 grid grid-cols-1 md:grid-cols-4 gap-4'>
//       {Object.entries(currencyTotals).map(([currency, amount]) => (
//         <div key={currency} className='space-y-1 border rounded-lg p-4 bg-card'>
//           <p className='font-medium '>
//             Total invested in {currency}:{' '}
//             {formatAmount(amount, currency.toLowerCase())}
//           </p>
//           <div className='text-sm text-muted-foreground pl-4 space-y-1'>
//             {CURRENCY_OPTIONS.filter((option) => option.label !== currency).map(
//               (option) => {
//                 const convertedAmount = convertCurrency(
//                   amount,
//                   currency as SupportedCurrencyCode,
//                   option.label as SupportedCurrencyCode,
//                   exchangeRates
//                 );
//                 return (
//                   <p key={option.value}>
//                     {option.label} equivalent:{' '}
//                     {formatAmount(convertedAmount, option.value)}
//                   </p>
//                 );
//               }
//             )}
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }
