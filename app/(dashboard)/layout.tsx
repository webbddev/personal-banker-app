// import Navbar from '@/components/Navbar';
// import Sidebar from '@/components/Sidebar';

// import { PropsWithChildren } from 'react';
// import Page from './dashboard/page';
// import AppSidebar from '@/components/AppSidebar';

// export default function DashboardLayout({ children }: PropsWithChildren) {
//   return (
//     <main>
//       <Navbar />
//       <div className='flex'>
//         <div className='hidden md:block h-[100vh] w-[300px]'>
//           {/* <Sidebar /> */}
//           <AppSidebar/>
//         </div>
//         <div className='p-5 w-full lg:max-w-[1570px] overflow-hidden'>
//           {children}
//         </div>
//       </div>
//     </main>
//   );
// }

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
      <Navbar />
      <SidebarProvider defaultOpen={defaultOpen}>
        <div className='flex min-h-screen w-full'>
          <AppSidebar />
          <main className='flex-1 w-full'>{children}</main>
        </div>
      </SidebarProvider>
    </>
  );
}
