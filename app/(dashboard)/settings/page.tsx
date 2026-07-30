import { TelegramSettings } from '@/components/TelegramSettings';
import { Settings } from 'lucide-react';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset } from '@/components/ui/sidebar';

export default function SettingsPage() {
  return (
    <SidebarInset className='w-full'>
      <SiteHeader title='Settings' />
      <div className='flex flex-1 flex-col w-full'>
        <div className='p-8 max-w-4xl mx-auto w-full'>
          <div className='mb-8'>
            <h1 className='text-3xl font-bold mb-2 flex items-center gap-3'>
              <Settings className='h-8 w-8' />
              Settings
            </h1>
            <p className='text-muted-foreground'>
              Manage your account preferences and notification channels.
            </p>
          </div>

          <div className='grid gap-6'>
            {/* Telegram Integration */}
            <TelegramSettings />
          </div>
        </div>
      </div>
    </SidebarInset>
  );
}
