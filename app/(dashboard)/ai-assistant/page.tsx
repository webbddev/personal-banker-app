import AIChat from '@/components/AiChat';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset } from '@/components/ui/sidebar';

const AiPage = () => {
  return (
    <SidebarInset className='w-full'>
      <SiteHeader title='AI Assistant' />
      <div className='flex flex-1 flex-col w-full'>
        <div className='flex flex-1 flex-col gap-2 w-full'>
          <div className='flex flex-col gap-4 py-4 md:gap-6 md:py-6 w-full'>
            <div className='w-full'>
              <AIChat />
            </div>
          </div>
        </div>
      </div>
    </SidebarInset>
  );
};

export default AiPage;
