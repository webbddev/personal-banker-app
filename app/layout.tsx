import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { ClerkProvider, SignedIn } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { ConsoleWarningSuppressor } from '@/components/ConsoleWarningSuppressor';
import { SidebarProvider } from '@/components/ui/sidebar';
import { cookies } from 'next/headers';
import { AIChatButton } from '@/components/AIChatButton';
import { MobileFloatingTrigger } from '@/components/MobileFloatingTrigger';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Personal Banker App',
  description: 'Your investments tracked',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get('sidebar_state')?.value === 'true';

  return (
    <ClerkProvider
      afterSignOutUrl={'/'}
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: '#40C1AB', // Tailwind's teal-500
        },
        signIn: {
          baseTheme: dark,
        },
        signUp: {
          baseTheme: dark,
        },
      }}
    >
      <html lang='en' suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased relative`}
          suppressHydrationWarning
        >
          <ThemeProvider
            attribute='class'
            defaultTheme='dark'
            enableSystem={true}
            disableTransitionOnChange
          >
            <ConsoleWarningSuppressor />
            <SidebarProvider defaultOpen={defaultOpen}>
              <div className='w-full'>
                {children}
              </div>
              <MobileFloatingTrigger />
              <SignedIn>
                <AIChatButton />
              </SignedIn>
            </SidebarProvider>
          </ThemeProvider>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}

