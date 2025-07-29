import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';
import Link from 'next/link';
import {
  LayoutDashboard,
  Newspaper,
  Folders,
  CreditCard,
  Settings,
  User,
  Coins,
} from 'lucide-react';

const Sidebar = () => {
  return (
    <Command className='rounded-none'>
      <CommandInput placeholder='Type a command or search...' />
      <CommandList className='overflow-y-hidden'>
        <CommandEmpty>No results found.</CommandEmpty>
        {/* Suggestions section */}
        <CommandGroup
          className='p-4'
          heading={<span className='font-bold text-md '>Suggestions</span>}
        >
          <CommandItem>
            <LayoutDashboard className='mr-2 h-4 w-4' />
            <Link href={'/dashboard'}>Dashboard</Link>
          </CommandItem>
          <CommandItem>
            <Newspaper className='mr-2 h-4 w-4' />
            <Link href={'/posts'}>Posts</Link>
          </CommandItem>
          <CommandItem>
            <Coins className='mr-2 h-4 w-4' />
            <Link href={'/investments'}>Investments</Link>
          </CommandItem>
          <CommandItem>
            <Folders className='mr-2 h-4 w-4' />
            <Link href={'#'}>Categories</Link>
          </CommandItem>
        </CommandGroup>
        {/* Settings section */}
        <CommandSeparator />
        <CommandGroup
          className='p-4'
          heading={<span className='font-bold text-md'>Settings</span>}
        >
          <CommandItem>
            <User className='mr-2 h-4 w-4' />
            <span>Profile</span>
            <CommandShortcut>⌘P</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <CreditCard className='mr-2 h-4 w-4' />
            <span>Billing</span>
            <CommandShortcut>⌘B</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <Settings className='mr-2 h-4 w-4' />
            <span>Settings</span>
            <CommandShortcut>⌘S</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  );
};

export default Sidebar;
