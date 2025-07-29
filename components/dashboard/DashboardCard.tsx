import { LucideIcon, Newspaper } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '../ui/card';

interface DashboardCardProps {
  title: string;
  count: number;
  icon: React.ReactElement<LucideIcon>;
}

const DashboardCard = ({ title, count, icon }: DashboardCardProps) => {
  return (
    <Card className='bg-slate-100 dark:bg-slate-800 shadow-lg p-4 pb-0'>
      <CardHeader>
        <CardTitle className='text-2xl font-bold text-slate-500 dark:text-slate-200'>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='flex gap-5 justify-center items-center'>
          {icon}
          <h3 className='text-5xl font-semibold text-slate-500 dark:text-slate-200'>
            {count}
          </h3>
        </div>
      </CardContent>
      <CardFooter>
        <p className='text-sm text-muted-foreground'>View all posts</p>
      </CardFooter>
    </Card>
  );
};

export default DashboardCard;
