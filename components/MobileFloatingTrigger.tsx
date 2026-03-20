'use client';

import { useSidebar } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { PanelRightClose } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function MobileFloatingTrigger() {
  const { toggleSidebar, isMobile } = useSidebar();
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(true);
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        setIsVisible(false);
      }, 2000);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  if (!isMobile) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed left-0 top-1/2 -translate-y-1/2 z-[100]"
        >
          <button
            onClick={toggleSidebar}
            className="group flex h-14 w-8 items-center justify-center rounded-r-xl border border-l-0 bg-background/95 backdrop-blur-md shadow-lg transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <PanelRightClose className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
