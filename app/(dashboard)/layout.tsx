import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';

import { PropsWithChildren } from 'react';

export default function DashboardLayout({ children }: PropsWithChildren) {
  return (
    <main>
      <Navbar />
      <div className='flex'>
        <div className='hidden md:block h-[100vh] w-[300px]'>
          <Sidebar />
        </div>
        <div className='p-5 w-full lg:max-w-[1570px] overflow-hidden'>
          {children}
        </div>
      </div>
    </main>
  );
}
