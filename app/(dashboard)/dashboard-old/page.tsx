import DashboardCard from '@/components/dashboard/DashboardCard';
// import InvestmentsTable from '@/app/investments/InvestmentsTable';
import PostsTable from '@/components/posts/PostsTable';
import { Folder, Folders, MessageCircle, Newspaper, User } from 'lucide-react';
import AnalyticsChart from '@/components/dashboard/AnalyticsChart';
import InvestmentsPage from '../investments/page';

export default function Home() {
  return (
    <>
      <div className='flex flex-col md:flex-row justify-between gap-5 mb-5'>
        <DashboardCard
          title='Posts'
          count={10}
          icon={
            <Newspaper
              className='text-slate-500 dark:text-slate-200'
              size={72}
            />
          }
        />
        <DashboardCard
          title='Categories'
          count={12}
          icon={
            <Folders className='text-slate-500 dark:text-slate-200' size={72} />
          }
        />
        <DashboardCard
          title='Users'
          count={750}
          icon={
            <User className='text-slate-500 dark:text-slate-200' size={72} />
          }
        />
        <DashboardCard
          title='Comments'
          count={1200}
          icon={
            <MessageCircle
              className='text-slate-500 dark:text-slate-200'
              size={72}
            />
          }
        />
      </div>
      <AnalyticsChart />
      <PostsTable title='Latest Posts' limit={5} />
      {/* <InvestmentsTable /> */}
      <InvestmentsPage/>
    </>
  );
}
