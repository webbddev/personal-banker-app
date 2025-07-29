'use client';

import { formatAmount } from '@/utils/currency-formatter';
import { useInvestmentStore } from '@/store/financialInvestmentsStore';

export function MonthlyReturnsDisplay() {
  const monthlyReturns = useInvestmentStore((state) => state.monthlyReturns);

  return (
    <div className='grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white rounded-lg shadow'>
      <div className='p-4 border rounded-md'>
        <h3 className='text-lg font-semibold text-gray-700'>
          MDL Monthly Return
        </h3>
        <p className='text-2xl font-normal dark:text-gray-500'>
          {formatAmount(monthlyReturns.MDL, 'MDL')}
        </p>
      </div>

      <div className='p-4 border rounded-md'>
        <h3 className='text-lg font-semibold text-gray-700'>
          EUR Monthly Return
        </h3>
        <p className='text-2xl font-normal dark:text-gray-500'>
          {formatAmount(monthlyReturns.EUR, 'EUR')}
        </p>
      </div>

      <div className='p-4 border rounded-md'>
        <h3 className='text-lg font-semibold text-gray-700'>
          GBP Monthly Return
        </h3>
        <p className='text-2xl font-normal dark:text-gray-500'>
          {formatAmount(monthlyReturns.GBP, 'GBP')}
        </p>
      </div>
    </div>
  );
}