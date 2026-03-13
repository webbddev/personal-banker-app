'use client';

import { useState } from 'react';
import { Orb } from '@/components/ui/orb';
import { AIChatBox } from './AIChatBox';
import { AnimatePresence, motion } from 'framer-motion';

export function AIChatButton() {
  const [chatOpen, setChatOpen] = useState(false);
  const defaultColors: [string, string] = ["#40C1AC", "#B2FFF2"]; 

  return (
    <div className="fixed bottom-6 right-6 lg:right-12 z-50 flex flex-col items-end pointer-events-none">
      <div className="pointer-events-auto flex flex-col items-end">
        <AnimatePresence mode="wait">
          {chatOpen ? (
              <motion.div
              key="chatbox"
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="origin-bottom-right mb-4"
            >
              <AIChatBox onClose={() => setChatOpen(false)} />
            </motion.div>
          ) : (
            <motion.div
              key="launcher"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="flex items-end gap-3"
            >
              <div className="hidden md:flex bg-[#11453F] text-white px-4 py-3 rounded-2xl rounded-br-none text-sm shadow-lg mb-4">
                Hi, how can I help you
              </div>
              <button 
                onClick={() => setChatOpen(true)}
                className="h-16 w-16 mb-2 rounded-full overflow-hidden border-2 border-transparent hover:border-[#40C1AC] transition-all shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] bg-background flex items-center justify-center group"
              >
                 <div className="h-full w-full p-0.5 rounded-full shadow-[inset_0_0_12px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_0_12px_rgba(0,0,0,0.3)]">
                   <Orb colors={defaultColors} seed={100} agentState={null} />
                </div>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
