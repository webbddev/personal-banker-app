import { SidebarInset } from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';

export default function WealthGrowthLoading() {
  return (
    <SidebarInset className='w-full'>
      {/* Site Header Skeleton */}
      <div className='flex items-center gap-2 px-4 py-4 border-b'>
        <Skeleton className='h-8 w-48' />
      </div>

      <div className='flex flex-1 flex-col p-4 lg:p-6 space-y-6'>
        {/* Top Section: Portfolio Summary & Parameters Side-by-Side */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {/* Portfolio Summary Card Skeleton */}
          <div className='bg-card rounded-xl border shadow-sm p-6 space-y-4'>
            <Skeleton className='h-6 w-40' />
            <div className='grid grid-cols-2 gap-4 mt-6'>
              <div className='space-y-2'>
                <Skeleton className='h-4 w-20' />
                <Skeleton className='h-8 w-32' />
              </div>
              <div className='space-y-2'>
                <Skeleton className='h-4 w-20' />
                <Skeleton className='h-8 w-32' />
              </div>
            </div>
            <div className='space-y-2 mt-4'>
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-20 w-full' />
            </div>
          </div>

          {/* Simulator Sidebar / Parameters Skeleton */}
          <div className='bg-card rounded-xl border shadow-sm p-6 space-y-6'>
            <div className='flex justify-between items-center'>
              <Skeleton className='h-6 w-32' />
              <Skeleton className='h-6 w-24' />
            </div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className='space-y-2'>
                <div className='flex justify-between'>
                  <Skeleton className='h-4 w-32' />
                  <Skeleton className='h-4 w-12' />
                </div>
                <Skeleton className='h-2 w-full' />
              </div>
            ))}
            <Skeleton className='h-10 w-full rounded-md' />
          </div>
        </div>

        {/* Main Visuals Section */}
        <div className='space-y-6'>
          {/* Status Cards Row */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className='p-6 bg-card rounded-xl border shadow-sm space-y-3'
              >
                <div className='flex items-center gap-2'>
                  <Skeleton className='h-4 w-4 rounded-full' />
                  <Skeleton className='h-4 w-32' />
                </div>
                <Skeleton className='h-8 w-28' />
              </div>
            ))}
          </div>

          {/* Growth Chart Skeleton */}
          <div className='w-full bg-card rounded-xl border shadow-sm p-6'>
            <div className='flex justify-between items-center mb-6'>
              <Skeleton className='h-6 w-48' />
              <div className='flex gap-2'>
                <Skeleton className='h-8 w-20' />
                <Skeleton className='h-8 w-20' />
              </div>
            </div>
            <Skeleton className='h-[400px] w-full' />
          </div>

          {/* Yearly Table Skeleton */}
          <div className='w-full bg-card rounded-xl border shadow-sm p-6'>
            <div className='flex justify-between items-center mb-6'>
              <Skeleton className='h-6 w-32' />
              <Skeleton className='h-9 w-32' />
            </div>
            <div className='space-y-3'>
              <div className='flex gap-4 border-b pb-2'>
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className='h-5 flex-1' />
                ))}
              </div>
              {[...Array(10)].map((_, i) => (
                <div key={i} className='flex gap-4 pt-2'>
                  {[...Array(5)].map((_, j) => (
                    <Skeleton key={j} className='h-6 flex-1' />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SidebarInset>
  );
}
