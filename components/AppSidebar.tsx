import {
  LayoutDashboard,
  Sparkle,
  Coins,
  User,
  CreditCard,
  Settings,
  ChevronUp,
  Plus,
  Projector,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from './ui/sidebar';
import Image from 'next/image';
import { SignedIn, UserButton } from '@clerk/nextjs';
import { currentUser } from '@clerk/nextjs/server';
import { Collapsible } from './ui/collapsible';
import { ModeToggle } from './ModeToggle';
import { AppearanceMenuItem } from './AppearanceMenuItem';
import { SidebarLink } from './SidebarLink';

// Suggestions section items
const suggestionItems = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Ask AI',
    url: '/ai-assistant',
    icon: Sparkle,
  },
  {
    title: 'Investments',
    url: '/investments',
    icon: Coins,
  },
];

// Settings section items
const settingsItems = [
  {
    title: 'Profile',
    url: '#',
    icon: User,
    shortcut: '⌘P',
  },
  {
    title: 'Billing',
    url: '#',
    icon: CreditCard,
    shortcut: '⌘B',
  },
  {
    title: 'Settings',
    url: '#',
    icon: Settings,
    shortcut: '⌘S',
  },
  {
    title: 'Appearance',
    url: '#',
    icon: Projector,
    shortcut: '⌘A',
  },
];

const AppSidebar = async () => {
  const user = await currentUser();
  const userName = user?.firstName;

  return (
    <Sidebar collapsible='icon'>
      <SidebarHeader className='py-4'>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className='h-auto py-3 px-2'>
              <SidebarLink
                href='/dashboard'
                className='flex items-center justify-center w-full'
              >
                <div className='w-full max-w-[200px] aspect-square relative group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:h-8'>
                  <Image
                    src='/logo/Colour-Logo_noBackground.webp'
                    alt='logo'
                    fill
                    className='object-contain'
                  />
                </div>
              </SidebarLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        {/* Suggestions Section */}
        <SidebarGroup>
          <SidebarGroupLabel className='lg:text-base'>
            Suggestions
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {suggestionItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <SidebarLink href={item.url}>
                      <item.icon />
                      <span className='lg:text-base'>{item.title}</span>
                    </SidebarLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Settings Section */}
        <SidebarGroup>
          <SidebarGroupLabel className='lg:text-base'>Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <SidebarLink href={item.url}>
                      <item.icon />
                      <span className='lg:text-base'>{item.title}</span>
                      {item.shortcut && (
                        <span className='ml-auto text-xs text-muted-foreground lg:text-sm'>
                          {item.shortcut}
                        </span>
                      )}
                    </SidebarLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Projects Section */}
        <SidebarGroup>
          <SidebarGroupLabel className='lg:text-base'>Projects</SidebarGroupLabel>
          <SidebarGroupAction>
            <Plus /> <span className='sr-only'>Add Project</span>
          </SidebarGroupAction>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <SidebarLink href='/#'>
                    <Projector />
                    <span className='lg:text-base'>See All Projects</span>
                  </SidebarLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <SidebarLink href='/#'>
                    <Plus />
                    <span className='lg:text-base'>Add Project</span>
                  </SidebarLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarSeparator />

      {/* User Section */}
      <SidebarFooter>
        <SidebarMenu>
          {/* Theme Toggle */}
          <SidebarMenuItem>
            <div className='flex items-center justify-start w-full py-2 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors group-data-[collapsible=icon]:justify-center'>
              <ModeToggle />
              <span className='group-data-[collapsible=icon]:hidden ml-2 text-sm lg:text-base'>
                Switch Theme
              </span>
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SignedIn>
              <div className='flex items-center justify-center w-full gap-2 p-0 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors group-data-[collapsible=icon]:justify-center'>
                <UserButton />
                <div className='flex-1 min-w-0 group-data-[collapsible=icon]:hidden'>
                  <div className='flex items-center justify-between'>
                    <span className='truncate text-sm lg:text-base'>
                      Welcome, {userName || 'User'}
                    </span>
                    <ChevronUp className='w-4 h-4 flex-shrink-0 opacity-60' />
                  </div>
                </div>
              </div>
            </SignedIn>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
