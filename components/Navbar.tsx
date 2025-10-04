import Image from 'next/image';
import Link from 'next/link';
import logo from '@/assets/White-Logo_noBackground.svg';
import { SignedIn, SignOutButton, UserButton } from '@clerk/nextjs';
import { ModeToggle } from './ModeToggle';
import { currentUser } from '@clerk/nextjs/server';
import { SidebarTrigger, useSidebar } from './ui/sidebar';

const Navbar = async () => {
  const user = await currentUser();
  const userName = user?.firstName;

  return (
    <div className='w-full max-w-screen bg-primary dark:bg-slate-700 text-white py-2 px-5 flex justify-between overflow-x-auto'>
      {/* LEFT SECTION - Logo and SidebarTrigger */}
      {/* <div className='flex items-center gap-x-4'>
        <Link href='/'>
          <Image src={logo} width={100} height={50} alt='Logo' />
        </Link>
      </div> */}

      {/* RIGHT SECTION - User info and controls */}
      <div className='ml-auto flex items-center gap-x-2 md:gap-x-4'>
        <SignedIn>
          {userName && (
            <span className='hidden sm:inline text-white'>
              Welcome, {userName}
            </span>
          )}
          <UserButton />
        </SignedIn>
        <ModeToggle />
      </div>

      {/* Mobile Navigation Menu */}
      <div className='fixed bottom-0 left-0 w-full bg-primary dark:bg-slate-700 text-white block md:hidden z-50'>
        <nav className='flex flex-col items-center py-4'>
          {/* Add your mobile nav links here */}
          <SignOutButton />
        </nav>
      </div>
    </div>
  );
};

export default Navbar;
