'use client';

import { Button } from '@/components/ui/button';
import { BrainCog } from 'lucide-react';
import { useState } from 'react';
import { AIChatBox } from './AIChatBox';

export function AIChatButton() {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setChatOpen(!chatOpen)}
        className='bg-slate-600 text-primary-foreground hover:bg-primary/90 dark:bg-secondary dark:text-secondary-foreground dark:hover:bg-secondary/80 '
      >
        <BrainCog className='' />
        <span>Ask AI</span>
      </Button>
      <AIChatBox open={chatOpen} onClose={() => setChatOpen(false)} />
    </>
  );
}
