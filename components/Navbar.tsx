import Image from 'next/image';
import Link from 'next/link';
import logo from '@/assets/White-Logo_noBackground.svg';
import { SignedIn, UserButton } from '@clerk/nextjs';
import { ModeToggle } from './ModeToggle';
import { currentUser } from '@clerk/nextjs/server';

const Navbar = async () => {
  const user = await currentUser();
  const userName = user?.firstName;

  return (
    <div className='w-full max-w-screen bg-primary dark:bg-slate-700 text-white py-2 px-5 flex justify-between overflow-x-auto'>
      <Link href='/'>
        <Image src={logo} width={100} height={50} alt='Logo' />
      </Link>

      <div className='flex items-center gap-x-2 md:gap-x-4'>
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
    </div>
  );
};

export default Navbar;
