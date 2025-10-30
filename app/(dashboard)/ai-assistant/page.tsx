import { AiChatPage } from '@/app/(dashboard)/ai-assistant/AiChatPage';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset } from '@/components/ui/sidebar';

const AiAssistant = () => {
  return (
    <SidebarInset className='w-full'>
      <SiteHeader title='AI Assistant' />
      <div className='p-4 lg:p-6'>
        <div className='border-stale-200/20 flex h-[80vh] flex-col rounded-xl border-2'>
          <AiChatPage />
        </div>
      </div>
    </SidebarInset>
  );
};

export default AiAssistant;
