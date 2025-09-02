'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

export function ModeToggle() {
  const commonClasses = 'h-7 w-7 rounded-3xl';

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Only show the toggle after mounting to avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything until mounted to avoid hydration mismatch
  if (!mounted) {
    // Render a placeholder to prevent layout shift.
    // Use a div to avoid rendering an interactive element.
    return <div className={commonClasses} />;
  }

  return (
    <Button
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      className={`relative border bg-teal-600 border-teal-400 dark:border-teal-500 p-1 hover:bg-teal-500 dark:hover:bg-teal-500 ${commonClasses}`}
      variant='outline'
    >
      <Moon
        className={`absolute h-[0.9rem] w-[0.9rem] transition-all ${
          theme === 'light'
            ? 'opacity-100 rotate-0 scale-100'
            : 'opacity-0 rotate-90 scale-0'
        } text-teal-200`}
      />
      <Sun
        className={`absolute h-[0.9rem] w-[0.9rem] transition-all ${
          theme === 'dark'
            ? 'opacity-100 rotate-0 scale-100'
            : 'opacity-0 rotate-90 scale-0'
        } text-gray-200`}
      />
      <span className='sr-only'>Toggle theme</span>
    </Button>
  );
}
