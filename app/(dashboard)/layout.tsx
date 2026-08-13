import AppSidebar from '@/components/AppSidebar';
import { PropsWithChildren } from 'react';

export default async function DashboardLayout({ children }: PropsWithChildren) {
  return (
    <div className='flex min-h-screen w-full max-w-full overflow-x-hidden bg-background'>
      <AppSidebar />
      <main
        className='
          flex-1 min-w-0 w-full relative
          bg-background
          before:pointer-events-none before:absolute before:inset-0 before:z-0 before:opacity-100
          before:[background:
            radial-gradient(ellipse_at_top_right,hsl(171_62%_45%_/_0.18),transparent_55%),
            radial-gradient(ellipse_at_bottom_left,hsl(207_40%_25%_/_0.45),transparent_60%),
            linear-gradient(180deg,hsl(207_44%_12%),hsl(207_42%_11%))
          ]
          dark:before:opacity-100
          light:before:opacity-40
        '
      >
        <div className='relative z-[1]'>{children}</div>
      </main>
    </div>
  );
}
