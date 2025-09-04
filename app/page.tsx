import {  SignUpButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Logo from '../assets/Colour-Logo_noBackground.svg';
import LandingImg from '../assets/main.svg';
import Link from 'next/link';

export default function Home() {
  return (
    <main>
      <section className='max-w-7xl mx-auto mt-48 sm:mt-24 px-4 h-screen grid lg:grid-cols-[1fr,640px] lg:items-center'>
        <div>
          <h1 className='capitalize text-4xl md:text-7xl xl:text-8xl font-bold -ml-2'>
            personal <span className='text-teal-500'>banker</span> app
          </h1>
          <p className='leading-loose max-w-md mt-4'>
            Personal Banker is your all-in-one financial companion, seamlessly
            organizing and safeguarding your investments and savings. Manage,
            grow, and secure your wealth effortlessly with Personal Banker –
            where financial empowerment meets simplicity
          </p>
          <Button asChild className='mt-4'>
            <SignUpButton >
              Get Started
              {/* <Link href='/investments'>Get Started</Link> */}
            </SignUpButton>
          </Button>
        </div>
        <Image
          src={LandingImg}
          alt='landing'
          className='hidden lg:block w-full'
        />
      </section>
    </main>
  );
}
