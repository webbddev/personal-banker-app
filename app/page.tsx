import { SignUpButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import LandingImg from '../assets/main.svg';
import { LandingLamp } from '@/components/LandingLamp';
import { ShineBorder } from '@/components/ui/shine-border';
import { TavusConversationDialog } from '@/components/TavusConversationDialog';

export default function Home() {
  return (
    <main
      className='
        relative min-h-screen overflow-hidden
        before:pointer-events-none before:absolute before:inset-0 before:-z-0 before:opacity-100
        before:[background:
          radial-gradient(ellipse_at_top_right,hsl(171_62%_45%_/_0.22),transparent_55%),
          radial-gradient(ellipse_at_bottom_left,hsl(207_40%_30%_/_0.35),transparent_60%)
        ]
        dark:before:opacity-100
        light:before:opacity-50
      '
    >
      <LandingLamp />

      <section className='max-w-7xl mx-auto pt-32 sm:pt-24 lg:pt-0 px-4 lg:px-10 min-h-screen lg:h-screen flex flex-col lg:grid lg:grid-cols-[1fr,540px] xl:grid-cols-[1fr,640px] lg:items-center justify-center gap-12 lg:gap-0 relative z-10'>
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

          <div className='flex flex-wrap items-center gap-4 mt-8'>
            <ShineBorder
              className='p-0 min-h-0 min-w-0 bg-transparent hover:scale-105 transition-transform duration-300'
              borderRadius={40}
              borderWidth={2}
              color={['#14b8a6', '#ffffff', '#14b8a6']}
              duration={10}
            >
              <Button
                asChild
                className='h-12 px-8 text-lg rounded-full bg-teal-600 hover:bg-teal-500 text-white border-none shadow-none'
              >
                <SignUpButton>Get Started</SignUpButton>
              </Button>
            </ShineBorder>
            <TavusConversationDialog />
          </div>
        </div>
        <div className='relative'>
          <Image
            src={LandingImg}
            alt='landing'
            className='w-full max-w-md mx-auto lg:max-w-none drop-shadow-2xl'
            priority
          />
          {/* Subtle light reflection on the safe when lamp is on */}
          <div className='absolute inset-0 bg-yellow-400/5 blur-[100px] rounded-full pointer-events-none opacity-0 dark:opacity-100 transition-opacity duration-1000' />
        </div>
      </section>
    </main>
  );
}
