'use client';

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
  User as UserIcon,
} from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { SignOutButton, useUser } from '@clerk/nextjs';

export function NavUser() {
  const { isMobile } = useSidebar();
  const { user, isLoaded } = useUser();

  if (!isLoaded || !user) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size='lg' disabled>
            <div className='h-8 w-8 rounded-lg bg-muted animate-pulse' />
            <div className='flex-1 space-y-1 group-data-[collapsible=icon]:hidden'>
              <div className='h-4 w-24 bg-muted animate-pulse rounded' />
              <div className='h-3 w-32 bg-muted animate-pulse rounded' />
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  const initials = `${user.firstName?.charAt(0) || ''}${
    user.lastName?.charAt(0) || ''
  }` || 'U';

  return (
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton
            size='lg'
            asChild
            className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground transition-all duration-200'
          >
            <div className="flex items-center gap-2 px-2 h-12">
              <Avatar className='h-8 w-8 rounded-full border border-sidebar-border shadow-sm'>
                <AvatarImage src={user.imageUrl} alt={user.fullName || ''} />
                <AvatarFallback className='rounded-full bg-teal-500 text-white font-medium'>
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className='grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden'>
                <span className='truncate font-semibold text-sidebar-foreground'>
                  Welcome, {user.firstName || 'User'}
                </span>
                <span className='truncate text-xs text-muted-foreground'>
                  {user.primaryEmailAddress?.emailAddress}
                </span>
              </div>
              <ChevronsUpDown className='ml-auto size-4 opacity-50 group-data-[collapsible=icon]:hidden' />
            </div>
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className='w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl p-2 shadow-xl border-sidebar-border dark:bg-slate-900'
          side={isMobile ? 'bottom' : 'right'}
          align='end'
          sideOffset={8}
        >
          <DropdownMenuLabel className='p-0 font-normal'>
            <div className='flex items-center gap-3 px-2 py-3 text-left text-sm'>
              <Avatar className='h-10 w-10 rounded-full border border-sidebar-border'>
                <AvatarImage src={user.imageUrl} alt={user.fullName || ''} />
                <AvatarFallback className='rounded-full bg-teal-500 text-white'>
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className='grid flex-1 text-left text-sm leading-tight'>
                <span className='truncate font-bold text-sidebar-foreground'>
                  {user.fullName}
                </span>
                <span className='truncate text-xs text-muted-foreground'>
                  {user.primaryEmailAddress?.emailAddress}
                </span>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className='bg-sidebar-border/50' />
          <DropdownMenuGroup>
            <DropdownMenuItem className='gap-3 px-3 py-2 cursor-pointer hover:bg-sidebar-accent rounded-md transition-colors'>
              <Sparkles className='size-4 text-teal-500' />
              <span className='font-medium'>Upgrade to Pro</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator className='bg-sidebar-border/50' />
          <DropdownMenuGroup>
            <DropdownMenuItem className='gap-3 px-3 py-2 cursor-pointer hover:bg-sidebar-accent rounded-md transition-colors'>
              <UserIcon className='size-4 opacity-70' />
              <span className='font-medium'>Account Info</span>
            </DropdownMenuItem>
            <DropdownMenuItem className='gap-3 px-3 py-2 cursor-pointer hover:bg-sidebar-accent rounded-md transition-colors'>
              <CreditCard className='size-4 opacity-70' />
              <span className='font-medium'>Billing</span>
            </DropdownMenuItem>
            <DropdownMenuItem className='gap-3 px-3 py-2 cursor-pointer hover:bg-sidebar-accent rounded-md transition-colors'>
              <Bell className='size-4 opacity-70' />
              <span className='font-medium'>Notifications</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator className='bg-sidebar-border/50' />
          <SignOutButton>
            <DropdownMenuItem className='gap-3 px-3 py-2 cursor-pointer text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition-colors'>
              <LogOut className='size-4' />
              <span className='font-semibold'>Log out</span>
            </DropdownMenuItem>
          </SignOutButton>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );

}
