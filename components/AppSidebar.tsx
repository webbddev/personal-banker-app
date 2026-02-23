import {
  LayoutDashboard,
  Sparkle,
  FileText,
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
import { currentUser } from '@clerk/nextjs/server';
import { ModeToggle } from './ModeToggle';
import { SidebarLink } from './SidebarLink';
import { NavUser } from './NavUser';

// Suggestions section items
const suggestionItems = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Investments',
    url: '/investments',
    icon: Coins,
  },
  {
    title: 'Documents',
    url: '/upload',
    icon: FileText,
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
                <div className='w-full max-w-[200px] aspect-square relative group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:h-8 rounded-full overflow-hidden bg-sidebar-accent/50 p-1'>
                  <Image
                    src='/logo/colour-logo_no-background.webp'
                    alt='logo'
                    fill
                    className='object-contain p-2'
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
          <SidebarGroupLabel className='lg:text-base'>
            Settings
          </SidebarGroupLabel>
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
          <SidebarGroupLabel className='lg:text-base'>
            Projects
          </SidebarGroupLabel>
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
          <SidebarMenuItem>
            <SidebarMenuButton size='lg' asChild>
              <ModeToggle showLabel />
            </SidebarMenuButton>
          </SidebarMenuItem>
          <NavUser />
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};


export default AppSidebar;

