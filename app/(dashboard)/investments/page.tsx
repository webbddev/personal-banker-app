'use client';

import BackButton from '@/components/BackButton';
import { columns } from './columns';
import { InvestmentsTable } from './data-table';
import { CurrencyEquivalentTotal } from '@/components/CurrencyEquivalentTotal';
import { MonthlyReturnsDisplay } from '@/components/MonthlyReturnsDisplay';
import { DeleteDialog } from '@/components/DeleteDialog';
import { useInvestmentStore } from '@/store/financialInvestmentsStore';

export default function InvestmentsPage() {
  const investments = useInvestmentStore((state) => state.investments);

  return (
    <>
      <BackButton text='Go Back' link='/dashboard' />
      <div className='container mx-auto w-full py-10'>
        <h1 className='text-2xl font-semibold mb-4'>Investments</h1>

        {/* Monthly Returns Display */}
        <div className='mb-6'>
          <h2 className='text-xl font-semibold mb-2'>Monthly Returns</h2>
          <MonthlyReturnsDisplay />
        </div>

        {/* Data table displaying investment details */}
        <InvestmentsTable columns={columns} data={investments} />
      </div>

      {/* Currency Totals Display */}
      <div className='mb-6'>
        <h2 className='text-xl font-semibold mb-2'>Investment Totals</h2>
        <CurrencyEquivalentTotal />
      </div>

      {/* Delete Dialog */}
      <DeleteDialog />
    </>
  );
}
