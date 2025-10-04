import {
  Home,
  LayoutDashboard,
  Sparkle,
  Coins,
  User,
  CreditCard,
  Settings,
  ChevronUp,
  Plus,
  Projector,
  ChevronDown,
  LogOut,
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
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
} from './ui/sidebar';
import Link from 'next/link';
import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './ui/collapsible';
import {
  SignedIn,
  SignOutButton,
  UserButton,
  RedirectToUserProfile,
} from '@clerk/nextjs';
import { currentUser } from '@clerk/nextjs/server';

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
  const userImage = user?.imageUrl;

  return (
    <Sidebar collapsible='icon'>
      <SidebarHeader className='py-4'>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className='h-auto py-3 px-2'>
              <Link
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
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        {/* Suggestions Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Suggestions</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {suggestionItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Settings Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                      {item.shortcut && (
                        <span className='ml-auto text-xs text-muted-foreground'>
                          {item.shortcut}
                        </span>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Projects Section (Optional - keep if you need it) */}
        <SidebarGroup>
          <SidebarGroupLabel>Projects</SidebarGroupLabel>
          <SidebarGroupAction>
            <Plus /> <span className='sr-only'>Add Project</span>
          </SidebarGroupAction>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href='/#'>
                    <Projector />
                    See All Projects
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href='/#'>
                    <Plus />
                    Add Project
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarSeparator />

      {/* Clean User Dropdown */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SignedIn>
              <div className='flex w-full items-center gap-2 p-2 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors'>
                <UserButton />

                {/* Show name and chevron only when sidebar is expanded */}
                <div className='flex-1 min-w-0 group-data-[collapsible=icon]:hidden'>
                  <div className='flex items-center justify-between'>
                    <span className='truncate text-sm'>
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
