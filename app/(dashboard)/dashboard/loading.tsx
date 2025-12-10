import { SidebarInset } from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLoading() {
  return (
    <SidebarInset className='w-full'>
      {/* Site Header Skeleton */}
      <div className='flex items-center gap-2 px-4 py-4 border-b'>
        <Skeleton className='h-8 w-32' />
      </div>

      <div className='flex flex-1 flex-col w-full'>
        <div className='flex flex-1 flex-col gap-2 w-full'>
          <div className='flex flex-col gap-4 py-4 px-4 md:gap-6 md:py-6 w-full'>
            {/* Section Cards Skeleton - 4 cards in a row */}
            <div className='w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4'>
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className='bg-card rounded-lg border p-6 space-y-3'
                >
                  <Skeleton className='h-4 w-24' />
                  <Skeleton className='h-8 w-32' />
                  <Skeleton className='h-3 w-20' />
                </div>
              ))}
            </div>

            {/* Charts Grid Layout Skeleton */}
            <div className='w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4'>
              {/* Bar Chart - Investment Portfolio Overview */}
              <div className='lg:col-span-1 xl:col-span-2 bg-card rounded-lg border p-6'>
                <Skeleton className='h-6 w-48 mb-4' />
                <Skeleton className='h-[300px] w-full' />
              </div>

              {/* Pie Chart Label - Investments by Type */}
              <div className='lg:col-span-1 xl:col-span-2 bg-card rounded-lg border p-6'>
                <Skeleton className='h-6 w-48 mb-4' />
                <Skeleton className='h-[300px] w-full' />
              </div>

              {/* Pie Chart - Currency Exposure */}
              <div className='lg:col-span-1 xl:col-span-2 bg-card rounded-lg border p-6'>
                <Skeleton className='h-6 w-40 mb-4' />
                <Skeleton className='h-[300px] w-full' />
              </div>

              {/* Maturities Calendar - Upcoming Expirations */}
              <div className='lg:col-span-2 xl:col-span-2 bg-card rounded-lg border p-6'>
                <Skeleton className='h-6 w-56 mb-4' />
                <Skeleton className='h-[300px] w-full' />
              </div>

              {/* Additional Chart Area - Full width */}
              <div className='lg:col-span-2 xl:col-span-4 bg-card rounded-lg border p-6'>
                <Skeleton className='h-6 w-40 mb-4' />
                <Skeleton className='h-[300px] w-full' />
              </div>

              {/* Additional smaller metrics */}
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className='bg-primary-foreground p-4 rounded-lg lg:col-span-1 xl:col-span-1'
                >
                  <div className='h-full flex items-center justify-center'>
                    <Skeleton className='h-4 w-32' />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SidebarInset>
  );
}
