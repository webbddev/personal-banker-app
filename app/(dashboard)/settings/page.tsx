import { TelegramSettings } from '@/components/TelegramSettings';
import { Settings } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className='p-8 max-w-4xl mx-auto'>
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
  );
}
