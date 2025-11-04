import { ChartAreaInteractive } from '@/components/chart-area-interactive';
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
  calculateMonthlyReturnsByInvestmentType,
  calculateTotalMonthlyRevenueInMDL,
  getExpiredInvestments,
} from '@/utils/investment-calculations';
import { getLatestRates } from '@/utils/exchange-rate-service';
import { ChartPieLabel } from '@/components/ChartPieLabel';
import { ChartPieInteractive } from '@/components/ChartPieInteractive';

export default async function DashboardPage() {
  const investments = await getAllInvestmentsSortedByExpiration();
  const allInvestments = await getAllInvestments();
  const investmentsByType = await getInvestmentsByType();
  const investmentsByCurrency = await getInvestmentsByCurrency();
  const monthlyReturns = calculateMonthlyReturns(allInvestments);
  const monthlyReturnsByType =
    calculateMonthlyReturnsByInvestmentType(allInvestments);
  const exchangeRates = await getLatestRates();
  const totalMonthlyRevenue = calculateTotalMonthlyRevenueInMDL(
    monthlyReturns,
    exchangeRates
  );
  const totalInvestments = allInvestments.length;
  const expiringIn7Days = getInvestmentsExpiringIn7Days(allInvestments);
  const expiringIn30Days = getInvestmentsExpiringIn30Days(allInvestments);
    const expiredInvestments = getExpiredInvestments(allInvestments);


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
                expiredInvestments={expiredInvestments}
              />
            </div>

            {/* Charts Grid Layout */}
            <div className='w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4'>
              {/* Bar Chart - Investment Portfolio Overview */}
              <div className='lg:col-span-1 xl:col-span-2'>
                <ChartBarInteractive data={investments} />
              </div>

              {/* Pie Chart Label - Investments by Type */}
              <div className='lg:col-span-1 xl:col-span-2'>
                <ChartPieLabel data={investmentsByType} />
              </div>

              {/* Pie Chart - Currency Exposure */}
              <div className='lg:col-span-1 xl:col-span-2'>
                <ChartPieInteractive data={investmentsByCurrency} />
              </div>

              {/* Additional Chart Area - Full width on large screens */}
              <div className='lg:col-span-2 xl:col-span-4'>
                <ChartAreaInteractive />
              </div>

              {/* Optional: Additional smaller charts or components */}
              <div className='bg-primary-foreground p-4 rounded-lg lg:col-span-1 xl:col-span-1'>
                <div className='h-full flex items-center justify-center'>
                  <p className='text-muted-foreground'>Additional Metric</p>
                </div>
              </div>

              <div className='bg-primary-foreground p-4 rounded-lg lg:col-span-1 xl:col-span-1'>
                <div className='h-full flex items-center justify-center'>
                  <p className='text-muted-foreground'>Additional Metric</p>
                </div>
              </div>

              <div className='bg-primary-foreground p-4 rounded-lg lg:col-span-1 xl:col-span-1'>
                <div className='h-full flex items-center justify-center'>
                  <p className='text-muted-foreground'>Additional Metric</p>
                </div>
              </div>

              <div className='bg-primary-foreground p-4 rounded-lg lg:col-span-1 xl:col-span-1'>
                <div className='h-full flex items-center justify-center'>
                  <p className='text-muted-foreground'>Additional Metric</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarInset>
  );
}
