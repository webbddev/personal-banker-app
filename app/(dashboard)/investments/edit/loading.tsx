import { Skeleton } from '@/components/ui/skeleton';

export default function EditInvestmentSkeleton() {
  return (
    <div className='max-w-3xl mx-auto p-4'>
      {/* Back Button Skeleton */}
      <Skeleton className='h-10 w-24 mb-6' />

      {/* Page Title */}
      <Skeleton className='h-8 w-64 mb-8' />

      <div className='space-y-8'>
        {/* Organisation Name Field */}
        <div className='space-y-2'>
          <Skeleton className='h-4 w-32' /> {/* Label */}
          <Skeleton className='h-10 w-full' /> {/* Input */}
        </div>

        {/* Investment Type Field */}
        <div className='space-y-2'>
          <Skeleton className='h-4 w-48' />
          <Skeleton className='h-10 w-full' />
        </div>

        {/* Related Data Field */}
        <div className='space-y-2'>
          <Skeleton className='h-4 w-24' />
          <Skeleton className='h-10 w-full' />
          <Skeleton className='h-3 w-40' /> {/* Description */}
        </div>

        {/* Currency and Income Tax Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='space-y-2'>
            <Skeleton className='h-4 w-36' />
            <Skeleton className='h-10 w-full' />
          </div>
          <div className='space-y-2'>
            <Skeleton className='h-4 w-28' />
            <Skeleton className='h-10 w-full' />
          </div>
        </div>

        {/* Amount, Rate, and Date Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          <div className='space-y-2'>
            <Skeleton className='h-4 w-32' />
            <Skeleton className='h-10 w-full' />
          </div>
          <div className='space-y-2'>
            <Skeleton className='h-4 w-36' />
            <Skeleton className='h-10 w-full' />
          </div>
          <div className='space-y-2'>
            <Skeleton className='h-4 w-40' />
            <Skeleton className='h-10 w-full' />
          </div>
        </div>

        {/* Action Buttons */}
        <div className='flex gap-4 pt-4'>
          <Skeleton className='h-10 w-full' /> {/* Cancel button */}
          <Skeleton className='h-10 w-full' /> {/* Update button */}
        </div>
      </div>
    </div>
  );
}
