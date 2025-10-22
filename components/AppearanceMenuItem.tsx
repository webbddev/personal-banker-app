'use client';

import * as React from 'react';
import { SidebarMenuItem } from './ui/sidebar';
import { ModeToggle } from './ModeToggle';

export function AppearanceMenuItem() {
  return (
    <SidebarMenuItem>
      <div className='flex h-10 w-full items-center justify-between rounded-md px-2 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors'>
        <div className='flex items-center'>
          {/* ModeToggle now acts as the icon */}
          <div className='mr-3 flex-shrink-0'>
            <ModeToggle />
          </div>
          <span className='group-data-[collapsible=icon]:hidden'>
            Switch Theme
          </span>
        </div>
        {/* The ModeToggle is now part of the main content, so this div is no longer needed */}
      </div>
    </SidebarMenuItem>
  );
}
