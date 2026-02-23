import { SignUpButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import LandingImg from '../assets/main.svg';
import { LandingLamp } from '@/components/LandingLamp';
import { ShineBorder } from '@/components/ui/shine-border';

export default function Home() {
  return (
    <main className='relative min-h-screen overflow-hidden'>
      <LandingLamp />
      
      <section className='max-w-7xl mx-auto mt-48 sm:mt-24 px-4 lg:px-10 h-screen grid lg:grid-cols-[1fr,540px] xl:grid-cols-[1fr,640px] lg:items-center relative z-10'>
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
          
          <ShineBorder
            className="mt-8 p-0 min-h-0 min-w-0 bg-transparent hover:scale-105 transition-transform duration-300"
            borderRadius={40}
            borderWidth={2}
            color={["#14b8a6", "#ffffff", "#14b8a6"]}
            duration={10}
          >
            <Button asChild className='h-12 px-8 text-lg rounded-full bg-teal-600 hover:bg-teal-500 text-white border-none shadow-none'>
              <SignUpButton >
                Get Started
              </SignUpButton>
            </Button>
          </ShineBorder>
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

