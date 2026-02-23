'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

export function LandingLamp() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = theme === 'dark';

  return (
    <div className={cn(
        'absolute top-0 z-50 flex flex-col items-center pointer-events-auto transition-all duration-500',
        // Mobile: far right
        'right-[2.5rem] top-[-2.75rem] sm:top-2 sm:right-4',
        // Tablet (iPad Mini/Pro): push to more empty space on the right to avoid title overlap
        'md:right-[3.5rem] lg:right-auto lg:left-[47%] lg:top-[17%] xl:left-[52%] xl:top-[12%] 2xl:left-[52%] 2xl:top-[10%]'
    )}>
      {/* Wire - Using vh units to remain synced with vertically centered hero content */}
      <div className={cn(
          'w-px bg-gradient-to-b from-transparent via-gray-400 to-gray-500 dark:via-gray-600 dark:to-gray-700 transition-all duration-500',
          'h-[15vh] md:h-[18vh] lg:h-[22vh] xl:h-[24vh]'
      )} />
      
      {/* Lamp Head */}
      <button
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        className='relative group flex flex-col items-center focus:outline-none'
      >
        <div className='w-10 h-6 md:w-12 md:h-8 bg-teal-500 dark:bg-teal-400 rounded-t-full relative z-10 shadow-lg transition-colors duration-500'>
            {/* Lamp base circle */}
            <div className='absolute -bottom-1 left-1/2 -translate-x-1/2 w-12 md:w-14 h-1.5 md:h-2 bg-gray-700 dark:bg-gray-200 rounded-full' />
        </div>

        {/* Bulb - Subtle glow instead of heavy pulsing */}
        <motion.div
            animate={{
              opacity: isDark ? [0.9, 1, 0.9] : [0.5, 0.6, 0.5],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className={cn(
                'w-4 h-5 rounded-b-full -mt-1 relative z-0 transition-colors duration-500',
                isDark 
                  ? 'bg-yellow-300 shadow-[0_0_20px_rgba(250,204,21,0.5)]' 
                  : 'bg-gray-200'
            )}
        />

        {/* Pull Cord - Primary interactive element with strong pulsing scale */}
        <div className='flex flex-col items-center mt-1 group-hover:translate-y-2 transition-transform duration-300'>
            <div className='w-0.5 h-12 bg-gradient-to-b from-gray-400/50 to-gray-300/30 dark:from-gray-600 dark:to-gray-500/20' />
            <motion.div
                animate={{
                    scale: [1, 1.5, 1],
                    boxShadow: [
                      "0 0 0px rgba(20, 184, 166, 0)",
                      "0 0 15px rgba(20, 184, 166, 0.6)",
                      "0 0 0px rgba(20, 184, 166, 0)"
                    ]
                }}
                whileHover={{ scale: 1.7 }}
                transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className='w-3 h-3 rounded-full bg-teal-600 dark:bg-teal-400 border border-teal-500/30 cursor-pointer relative z-10'
            />
        </div>

        {/* Light Glows - Now synchronized with bulb heartbeat */}
        <motion.div 
            animate={{
                scale: isDark ? [1.4, 1.6, 1.4] : [0, 0, 0],
                opacity: isDark ? [0.2, 0.4, 0.2] : [0, 0, 0],
            }}
            transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
            }}
            className={cn(
                'absolute top-8 w-48 h-48 rounded-full blur-[70px] transition-all duration-700 mix-blend-screen pointer-events-none bg-yellow-200/30'
            )} 
        />
        
        <motion.div
            animate={{
                scale: isDark ? [1, 1.2, 1] : [0, 0, 0],
                opacity: isDark ? [0.1, 0.3, 0.1] : [0, 0, 0],
            }}
            transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
            }}
            className={cn(
                'absolute top-10 w-32 h-32 rounded-full blur-[50px] transition-all duration-700 mix-blend-screen pointer-events-none bg-yellow-400/20'
            )}
        />
        
        {/* Interaction hint (Invisible hit area) */}
        <div className='absolute inset-0 w-32 h-48 -left-10 -top-8 rounded-full cursor-pointer' />
      </button>
    </div>
  );
}
