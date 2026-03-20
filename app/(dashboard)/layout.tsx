import AppSidebar from '@/components/AppSidebar';
import { PropsWithChildren } from 'react';

export default async function DashboardLayout({ children }: PropsWithChildren) {
  return (
    <div className='flex min-h-screen w-full max-w-full overflow-x-hidden'>
      <AppSidebar />
      <main className='flex-1 min-w-0 w-full relative'>{children}</main>
    </div>
  );
}
