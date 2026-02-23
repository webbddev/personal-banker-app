import {  SignUpButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Logo from '../assets/Colour-Logo_noBackground.svg';
import LandingImg from '../assets/main.svg';
import Link from 'next/link';

import { LandingLamp } from '@/components/LandingLamp';

export default function Home() {
  return (
    <main className='relative min-h-screen overflow-hidden'>
      <LandingLamp />
      
      <section className='max-w-7xl mx-auto mt-48 sm:mt-24 px-4 h-screen grid lg:grid-cols-[1fr,640px] lg:items-center relative z-10'>
        <div>
          <h1 className='capitalize text-4xl md:text-7xl xl:text-8xl font-bold -ml-2'>
            personal <span className='text-teal-500'>banker</span> app
          </h1>
          <p className='leading-loose max-w-md mt-4 text-muted-foreground'>
            Personal Banker is your all-in-one financial companion, seamlessly
            organizing and safeguarding your investments and savings. Manage,
            grow, and secure your wealth effortlessly with Personal Banker –
            where financial empowerment meets simplicity
          </p>
          <Button asChild className='mt-8 h-12 px-8 text-lg rounded-full hover:scale-105 transition-transform'>
            <SignUpButton >
              Get Started
            </SignUpButton>
          </Button>
        </div>
        <div className='relative'>
            <Image
            src={LandingImg}
            alt='landing'
            className='hidden lg:block w-full drop-shadow-2xl'
            />
            {/* Subtle light reflection on the safe when lamp is on */}
            <div className='absolute inset-0 bg-yellow-400/5 blur-[100px] rounded-full pointer-events-none opacity-0 dark:opacity-100 transition-opacity duration-1000' />
        </div>
      </section>
    </main>
  );
}

