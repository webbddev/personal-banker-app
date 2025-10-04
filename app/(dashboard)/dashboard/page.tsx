import { AppSidebar } from '@/components/app-sidebar';
import { ChartAreaInteractive } from '@/components/chart-area-interactive';
import { DataTable } from '@/components/data-table';
import { SectionCards } from '@/components/section-cards';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset } from '@/components/ui/sidebar';

import data from './data.json';
import { ChartBarInteractive } from '@/components/ui/chart-bar-interactive';
import { getAllInvestmentsSortedByExpiration } from '@/app/actions/investmentActions';
import Sidebar from '@/components/Sidebar';

export default async function DashboardPage() {
  const investments = await getAllInvestmentsSortedByExpiration();

  return (
    <SidebarInset className='w-full'>
      <SiteHeader title='Dashboard' />
      <div className='flex flex-1 flex-col w-full'>
        <div className=' flex flex-1 flex-col gap-2 w-full'>
          <div className='flex flex-col gap-4 py-4 md:gap-6 md:py-6 w-full'>
            {/* Full width sections */}
            <div className='w-full'>
              <SectionCards />
            </div>
            {/* Full width chart without additional padding */}
            <div className='w-full'>
              <ChartBarInteractive data={investments} />
            </div>
          </div>
        </div>
      </div>
    </SidebarInset>
  );
}
