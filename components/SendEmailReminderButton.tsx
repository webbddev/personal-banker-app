'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Mail, Loader2 } from 'lucide-react';
import { sendReminderEmail } from '@/app/actions/send-reminder-email';

export function SendEmailReminderButton() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSendReminder = async () => {
    setIsLoading(true);

    try {
      const result = await sendReminderEmail();

      if (result.success) {
        toast({
          title: 'Reminder Sent! ✉️',
          description: result.message,
          duration: 5000,
        });
      } else {
        toast({
          title: 'Failed to Send',
          description: result.error,
          variant: 'destructive',
          duration: 5000,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSendReminder}
      disabled={isLoading}
      variant='outline'
      className='w-full sm:w-auto gap-2 text-sm sm:text-base py-2 sm:py-2 px-4'
    >
      {isLoading ? (
        <>
          <Loader2 className='h-4 w-4 sm:h-5 sm:w-5 animate-spin' />
          <span className='text-xs sm:text-sm'>Sending...</span>
        </>
      ) : (
        <>
          <Mail className='h-4 w-4 sm:h-5 sm:w-5' />
          <span className='text-xs sm:text-sm'>Send Myself A Reminder</span>
        </>
      )}
    </Button>
  );
}
