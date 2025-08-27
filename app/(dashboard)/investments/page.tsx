// 'use client';

import BackButton from '@/components/BackButton';
import { columns } from './columns';
import { InvestmentsTable } from './data-table';
import { CurrencyEquivalentTotal } from '@/components/CurrencyEquivalentTotal';
import { MonthlyReturnsDisplay } from '@/components/MonthlyReturnsDisplay';
import { DeleteDialog } from '@/components/DeleteDialog';
// import { useInvestmentStore } from '@/store/financialInvestmentsStore';
import {
  countAllInvestments,
  getAllInvestments,
} from '@/app/actions/investmentActions';
import {
  calculateCurrencyTotals,
  calculateMonthlyReturns,
  CurrencyTotals,
} from '@/utils/investment-calculations';
import { getLatestRates } from '@/utils/exchange-rate-service';

export default async function InvestmentsPage() {
  // const investments = useInvestmentStore((state) => state.investments);

  const investments = await getAllInvestments();
  const exchangeRates = await getLatestRates();
  const instrumentsCount = await countAllInvestments();

  // Compute totals on the server
  const currencyTotals: CurrencyTotals = calculateCurrencyTotals(investments);
  const monthlyReturns: CurrencyTotals = calculateMonthlyReturns(investments);

  return (
    <>
      <BackButton text='Go Back' link='/dashboard' />
      <div className='container mx-auto w-full py-10'>
        <h1 className='text-2xl font-semibold mb-4'>Investments</h1>

        {/* Monthly Returns Display */}
        <div className='mb-6'>
          <h2 className='text-xl font-semibold mb-2'>Monthly Returns</h2>
          <MonthlyReturnsDisplay totals={monthlyReturns} />
        </div>

        {/* Data table displaying investment details */}
        <InvestmentsTable columns={columns} data={investments} />
      </div>

      {/* Currency Totals Display */}
      <div className='mb-6'>
        <h2 className='text-xl font-semibold mb-2'>
          Investment Totals - You have {instrumentsCount} investment instruments in your
          portfolio
        </h2>
        <CurrencyEquivalentTotal
          totals={currencyTotals}
          exchangeRates={exchangeRates}
        />
      </div>

      {/* Delete Dialog */}
      <DeleteDialog />
    </>
  );
}

// 'use client';

// import { useEffect } from 'react';
// import BackButton from '@/components/BackButton';
// import { columns } from './columns';
// import { InvestmentsTable } from './data-table';
// import { CurrencyEquivalentTotal } from '@/components/CurrencyEquivalentTotal';
// import { MonthlyReturnsDisplay } from '@/components/MonthlyReturnsDisplay';
// import { DeleteDialog } from '@/components/DeleteDialog';
// import { useInvestmentStore } from '@/store/financialInvestmentsStore';

// export default function InvestmentsPage() {
//   const { investments, isLoading, fetchInvestments } = useInvestmentStore();

//   // Fetch investments when component mounts
//   useEffect(() => {
//     fetchInvestments();
//   }, [fetchInvestments]);

//   if (isLoading) {
//     return (
//       <div className='container mx-auto w-full py-10'>
//         <div className='flex justify-center items-center h-64'>
//           <div className='text-lg'>Loading investments...</div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <>
//       <BackButton text='Go Back' link='/dashboard' />
//       <div className='container mx-auto w-full py-10'>
//         <h1 className='text-2xl font-semibold mb-4'>Investments</h1>

//         {/* Monthly Returns Display */}
//         <div className='mb-6'>
//           <h2 className='text-xl font-semibold mb-2'>Monthly Returns</h2>
//           <MonthlyReturnsDisplay />
//         </div>

//         {/* Data table displaying investment details */}
//         <InvestmentsTable columns={columns} data={investments} />
//       </div>

//       {/* Currency Totals Display */}
//       <div className='mb-6'>
//         <h2 className='text-xl font-semibold mb-2'>Investment Totals</h2>
//         <CurrencyEquivalentTotal />
//       </div>

//       {/* Delete Dialog */}
//       <DeleteDialog />
//     </>
//   );
// }
