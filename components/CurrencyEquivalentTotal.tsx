'use client';

import {
  CURRENCY_OPTIONS,
  formatAmount,
  convertCurrency,
  SupportedCurrencyCode,
  ExchangeRates,
} from '@/utils/currency-formatter';
import type { CurrencyTotals } from '@/utils/investment-calculations';

type CurrencyEquivalentTotalProps = {
  totals: CurrencyTotals;
  exchangeRates: ExchangeRates;
};

export function CurrencyEquivalentTotal({
  totals,
  exchangeRates,
}: CurrencyEquivalentTotalProps) {
  return (
    <div className='mt-4 grid grid-cols-1 md:grid-cols-4 gap-4'>
      {Object.entries(totals).map(([currency, amount]) => {
        const from = currency as SupportedCurrencyCode;

        return (
          <div
            key={currency}
            className='space-y-1 border rounded-lg p-4 bg-card'
          >
            <p className='font-medium'>
              Total invested in {currency}:{' '}
              {formatAmount(amount, currency.toLowerCase())}
            </p>

            <div className='text-sm text-muted-foreground pl-4 space-y-1'>
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
                    <p key={opt.value}>
                      {opt.label} equivalent:{' '}
                      {formatAmount(converted, opt.value)}
                    </p>
                  );
                }
              )}
            </div>
          </div>
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
