import { ChartAreaInteractive } from '@/components/chart-area-interactive';
import { SectionCards } from '@/components/section-cards';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset } from '@/components/ui/sidebar';

import { ChartBarInteractive } from '@/components/ChartBarInteractive';
import {
  getAllInvestmentsSortedByExpiration,
  getInvestmentsByType,
} from '@/app/actions/investmentActions';
import { ChartPieLabel } from '@/components/ChartPieLabel';

export default async function DashboardPage() {
  const investments = await getAllInvestmentsSortedByExpiration();
  const investmentsByType = await getInvestmentsByType(); // Add this line

  return (
    <SidebarInset className='w-full'>
      <SiteHeader title='Dashboard' />
      <div className='flex flex-1 flex-col w-full'>
        <div className='flex flex-1 flex-col gap-2 w-full'>
          <div className='flex flex-col gap-4 py-4 px-4 md:gap-6 md:py-6 w-full'>
            {/* Section Cards - Full width */}
            <div className='w-full'>
              <SectionCards />
            </div>

            {/* Charts Grid Layout */}
            <div className='w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4'>
              {/* Investment Portfolio Overview Chart - Takes half width on large screens */}
              <div className='lg:col-span-1 xl:col-span-2'>
                <ChartBarInteractive data={investments} />
              </div>

              {/* Pie Chart */}
              <div className='lg:col-span-1 xl:col-span-1'>
                <ChartPieLabel data={investmentsByType} />
              </div>

              {/* Placeholder for Donut Chart */}
              <div className='bg-primary-foreground p-4 rounded-lg lg:col-span-1 xl:col-span-1'>
                <div className='h-full flex items-center justify-center'>
                  <p className='text-muted-foreground'>Donut Chart</p>
                </div>
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
