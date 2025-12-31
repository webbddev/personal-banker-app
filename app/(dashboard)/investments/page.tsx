import { columns } from './columns';
import { InvestmentsTable } from './data-table';
import { CurrencyEquivalentTotal } from '@/components/CurrencyEquivalentTotal';
import { MonthlyReturnsDisplay } from '@/components/MonthlyReturnsDisplay';
import { DeleteDialog } from '@/components/DeleteDialog';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset } from '@/components/ui/sidebar';
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
import { ExchangeRatesDisplay } from '@/components/ExchangeRatesDisplay';
import DynamicEurUsdChart from '@/components/DynamicEurUsdChart';

export default async function InvestmentsPage() {
  const investments = await getAllInvestments();
  const exchangeRates = await getLatestRates();
  const instrumentsCount = await countAllInvestments();

  // Compute totals on the server
  const currencyTotals: CurrencyTotals = calculateCurrencyTotals(investments);
  const monthlyReturns: CurrencyTotals = calculateMonthlyReturns(investments);

  return (
    <SidebarInset className='w-full'>
      <SiteHeader title='Investments' />
      <div className='flex flex-1 flex-col w-full'>
        <div className='flex flex-1 flex-col gap-2 w-full'>
          <div className='flex flex-col gap-4 py-4 md:gap-6 md:py-6 w-full px-4 lg:px-6'>
            {/* Monthly Returns Display */}
            <div className='mb-6'>
              <h2 className='text-xl font-semibold mb-2'>Monthly Returns</h2>
              <MonthlyReturnsDisplay totals={monthlyReturns} />
            </div>

            <div className='mb-6'>
              <DynamicEurUsdChart />
            </div>

            {/* Data table displaying investment details */}
            <div className='w-full'>
              <InvestmentsTable columns={columns} data={investments} />
            </div>

            {/* Currency Totals Display */}
            <div className='mb-6'>
              <h2 className='text-xl font-semibold mb-2'>
                Investment Totals - You have {instrumentsCount} investment
                instruments in your portfolio
              </h2>
              <CurrencyEquivalentTotal
                totals={currencyTotals}
                exchangeRates={exchangeRates}
              />
            </div>

            {/* Exchange Rates Display */}
            <div className='md:col-span-1'>
              <ExchangeRatesDisplay />
            </div>
          </div>
        </div>
      </div>

      {/* Delete Dialog */}
      <DeleteDialog />
    </SidebarInset>
  );
}
