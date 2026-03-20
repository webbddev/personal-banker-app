import { SectionCards } from '@/components/section-cards';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset } from '@/components/ui/sidebar';

import { ChartBarInteractive } from '@/components/ChartBarInteractive';
import {
  getAllInvestmentsSortedByExpiration,
  getInvestmentsByType,
  getInvestmentsByCurrency,
  getAllInvestments,
} from '@/app/actions/investmentActions';
import {
  calculateMonthlyReturns,
  getInvestmentsExpiringIn30Days,
  getInvestmentsExpiringIn7Days,
  calculateCurrencyTotals,
  calculateMonthlyReturnsByInvestmentType,
  calculateTotalMonthlyRevenueInMDL,
  getExpiredInvestments,
  calculateAverageInterestRatesByType,
  calculateTotalInvestedByInvestmentType,
  calculateConvertedTotalsByType,
} from '@/utils/investment-calculations';
import { getLatestRates } from '@/utils/exchange-rate-service';
import { ChartPieLabel } from '@/components/ChartPieLabel';
import { ChartPieInteractive } from '@/components/ChartPieInteractive';
import { ExchangeRatesDisplay } from '@/components/ExchangeRatesDisplay';
import { MarketIntelligenceChart } from '@/components/MarketIntelligenceChart';
import { getMarketIntelligenceData } from '@/app/actions/marketIntelligenceActions';
// import { WorldClock } from '@/components/WorldClock';

export default async function DashboardPage() {
  const investments = await getAllInvestmentsSortedByExpiration();
  const allInvestments = await getAllInvestments();
  const investmentsByType = await getInvestmentsByType();
  const investmentsByCurrency = await getInvestmentsByCurrency();
  const monthlyReturns = calculateMonthlyReturns(allInvestments);
  const currencyTotals = calculateCurrencyTotals(allInvestments);

  const monthlyReturnsByType =
    calculateMonthlyReturnsByInvestmentType(allInvestments);
  const totalInvestedByType =
    calculateTotalInvestedByInvestmentType(allInvestments);
  const exchangeRates = await getLatestRates();

  // Correctly calculate totals in MDL equivalent for the pie chart proportions
  const convertedTotalsByType = calculateConvertedTotalsByType(
    totalInvestedByType,
    'MDL',
    exchangeRates,
  );

  // Transform for the chart component
  const pieChartData = Object.entries(convertedTotalsByType).map(
    ([type, data]) => ({
      type,
      total: data.total,
      breakdown: data.breakdown,
    }),
  );

  const totalMonthlyRevenue = calculateTotalMonthlyRevenueInMDL(
    monthlyReturns,
    exchangeRates,
  );
  const totalInvestments = allInvestments.length;
  const expiringIn7Days = getInvestmentsExpiringIn7Days(allInvestments);
  const expiringIn30Days = getInvestmentsExpiringIn30Days(allInvestments);
  const expiredInvestments = getExpiredInvestments(allInvestments);
  const averageInterestRatesByType =
    calculateAverageInterestRatesByType(allInvestments);
  const marketData = await getMarketIntelligenceData();

  return (
    <SidebarInset className='w-full'>
      <SiteHeader title='Dashboard' />
      <div className='flex flex-1 flex-col w-full'>
        <div className='flex flex-1 flex-col gap-2 w-full'>
          <div className='flex flex-col gap-4 py-4 px-4 md:gap-6 md:py-6 w-full'>
            {/* Section Cards - Full width */}
            <div className='w-full'>
              <SectionCards
                monthlyReturns={monthlyReturns}
                totalMonthlyRevenue={totalMonthlyRevenue}
                totalInvestments={totalInvestments}
                expiringIn7Days={expiringIn7Days}
                expiringIn30Days={expiringIn30Days}
                monthlyReturnsByType={monthlyReturnsByType}
                totalInvestedByType={totalInvestedByType}
                expiredInvestments={expiredInvestments}
                allInvestments={allInvestments}
                averageInterestRatesByType={averageInterestRatesByType}
                exchangeRates={exchangeRates}
              />
            </div>

            {/* Charts Grid Layout */}
            <div className='w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4'>
              {/* Bar Chart - Investment Portfolio Overview */}
              <div className='lg:col-span-1 xl:col-span-2'>
                <ChartBarInteractive
                  data={investments}
                  currencyTotals={currencyTotals}
                  monthlyReturns={monthlyReturns}
                />
              </div>

              {/* Pie Chart Label - Investments by Type */}
              <div className='lg:col-span-1 xl:col-span-2'>
                <ChartPieLabel data={pieChartData as any} />
              </div>

              {/* Pie Chart - Currency Exposure */}
              <div className='lg:col-span-1 xl:col-span-2'>
                <ChartPieInteractive
                  data={investmentsByCurrency}
                  exchangeRates={exchangeRates}
                />
              </div>

              {/* Currency Rates */}
              <div className='lg:col-span-2 xl:col-span-2'>
                <ExchangeRatesDisplay />
              </div>

              {/* World Markets Time Grid */}
              {/* <div className='md:col-span-2 lg:col-span-2 xl:col-span-4'>
                <h3 className="text-xl font-bold px-4 mb-2">Global Market Times</h3>
                <WorldClock className="md:grid-cols-3 lg:grid-cols-6" />
              </div> */}

              {/* Market Intelligence Chart - Full width */}
              <div className='md:col-span-2 lg:col-span-2 xl:col-span-4'>
                <MarketIntelligenceChart data={marketData} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarInset>
  );
}
