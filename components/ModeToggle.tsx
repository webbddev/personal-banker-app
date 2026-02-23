'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

interface ModeToggleProps extends React.HTMLAttributes<HTMLDivElement> {
  showLabel?: boolean;
}

export function ModeToggle({
  showLabel = false,
  className,
  ...props
}: ModeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className='h-8 w-8 rounded-full' />;
  }

  const toggleTheme = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div
      onClick={toggleTheme}
      className={cn(
        'group flex-1 flex items-center justify-start gap-2 outline-none px-2 h-12',
        className
      )}
      {...props}
    >
      <div
        className={cn(
          'relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-teal-600 border-teal-400 dark:border-teal-500 transition-colors group-hover:bg-teal-500 shadow-sm'
        )}
      >
        <Moon
          className={cn(
            'absolute h-4 w-4 transition-all text-teal-200',
            theme === 'light'
              ? 'opacity-100 rotate-0 scale-100'
              : 'opacity-0 rotate-90 scale-0'
          )}
        />
        <Sun
          className={cn(
            'absolute h-4 w-4 transition-all text-gray-200',
            theme === 'dark'
              ? 'opacity-100 rotate-0 scale-100'
              : 'opacity-0 rotate-90 scale-0'
          )}
        />
        <span className='sr-only'>Toggle theme</span>
      </div>
      {showLabel && (
        <div className='grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden'>
          <span className='truncate font-semibold text-sidebar-foreground'>
            Switch Theme
          </span>
          <span className='truncate text-xs text-muted-foreground'>
            Toggle Dark/Light Mode
          </span>
        </div>
      )}
    </div>
  );
}
