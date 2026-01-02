import AppSidebar from '@/components/AppSidebar';
import Navbar from '@/components/Navbar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { cookies } from 'next/headers';
import { PropsWithChildren } from 'react';

export default async function DashboardLayout({ children }: PropsWithChildren) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get('sidebar_state')?.value === 'true';

  return (
    <>
      <SidebarProvider defaultOpen={defaultOpen}>
        <div className='flex min-h-screen w-full max-w-full overflow-x-hidden'>
          <AppSidebar />
          <main className='flex-1 min-w-0 w-full relative'>{children}</main>
        </div>
      </SidebarProvider>
    </>
  );
}
