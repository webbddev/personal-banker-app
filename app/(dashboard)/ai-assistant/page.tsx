'use client';

import AIChat from '@/components/AiChat';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset } from '@/components/ui/sidebar';
import { useState } from 'react';
import { useChat } from '@ai-sdk/react';

const AiPage = () => {
  const [isCopied, setIsCopied] = useState<Record<string, boolean>>({});

  const { messages, status, error, regenerate } = useChat();

  return (
    <SidebarInset className='w-full'>
      <SiteHeader title='AI Assistant' />
      <div className='flex flex-1 flex-col w-full'>
        <div className='flex flex-1 flex-col gap-2 w-full'>
          <div className='flex flex-col gap-4 py-4 md:gap-6 md:py-6 w-full'>
            <div className='w-full'>
              <AIChat
                messages={messages}
                status={status}
                error={error}
                regenerate={regenerate}
                isCopied={isCopied}
                setIsCopied={setIsCopied}
              />
            </div>
          </div>
        </div>
      </div>
    </SidebarInset>
  );
};

export default AiPage;
