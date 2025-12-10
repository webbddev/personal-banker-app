import { SidebarInset } from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';

export default function InvestmentsLoading() {
  return (
    <SidebarInset className='w-full'>
      {/* Site Header Skeleton */}
      <div className='flex items-center gap-2 px-4 py-4 border-b'>
        <Skeleton className='h-8 w-32' />
      </div>

      <div className='flex flex-1 flex-col w-full'>
        <div className='flex flex-1 flex-col gap-2 w-full'>
          <div className='flex flex-col gap-4 py-4 md:gap-6 md:py-6 w-full px-4 lg:px-6'>
            {/* Monthly Returns Display Skeleton */}
            <div className='mb-6'>
              <Skeleton className='h-6 w-40 mb-4' />
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                {[...Array(3)].map((_, i) => (
                  <div key={i} className='bg-card rounded-lg border p-4'>
                    <Skeleton className='h-4 w-16 mb-2' />
                    <Skeleton className='h-8 w-32' />
                  </div>
                ))}
              </div>
            </div>

            {/* Data Table Skeleton */}
            <div className='w-full space-y-4'>
              {/* Header Row with Filter and Button */}
              <div className='flex justify-between items-center py-4'>
                <div className='flex items-center space-x-2'>
                  <Skeleton className='h-10 w-full md:w-72' />
                  <Skeleton className='h-10 w-24' />
                </div>
                <Skeleton className='h-10 w-40' />
              </div>

              {/* Table */}
              <div className='rounded-md border w-full'>
                {/* Table Header */}
                <div className='border-b bg-muted/50'>
                  <div className='flex items-center p-4 gap-4'>
                    {[...Array(9)].map((_, i) => (
                      <Skeleton key={i} className='h-5 w-24 flex-1' />
                    ))}
                  </div>
                </div>

                {/* Table Rows */}
                {[...Array(5)].map((_, rowIndex) => (
                  <div key={rowIndex} className='border-b p-4'>
                    <div className='flex items-center gap-4'>
                      {[...Array(9)].map((_, colIndex) => (
                        <Skeleton key={colIndex} className='h-6 w-24 flex-1' />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Skeleton */}
              <div className='flex items-center justify-between py-4'>
                <Skeleton className='h-5 w-32' />
                <div className='flex items-center space-x-2'>
                  <Skeleton className='h-10 w-24' />
                  <Skeleton className='h-10 w-8' />
                  <Skeleton className='h-10 w-8' />
                  <Skeleton className='h-10 w-8' />
                  <Skeleton className='h-10 w-8' />
                  <Skeleton className='h-10 w-24' />
                </div>
              </div>
            </div>

            {/* Currency Totals Display Skeleton */}
            <div className='mb-6'>
              <Skeleton className='h-6 w-96 mb-4' />
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                {[...Array(3)].map((_, i) => (
                  <div key={i} className='bg-card rounded-lg border p-4'>
                    <Skeleton className='h-4 w-16 mb-2' />
                    <Skeleton className='h-8 w-32 mb-2' />
                    <Skeleton className='h-3 w-24' />
                  </div>
                ))}
              </div>
            </div>

            {/* Exchange Rates Display Skeleton */}
            <div className='md:col-span-1'>
              <div className='bg-card rounded-lg border p-6'>
                <Skeleton className='h-6 w-40 mb-4' />
                <div className='space-y-3'>
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className='flex justify-between items-center'>
                      <Skeleton className='h-4 w-24' />
                      <Skeleton className='h-4 w-16' />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarInset>
  );
}
