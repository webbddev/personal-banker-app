'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { sendOneDayTestEmail, sendSevenDayTestEmail } from '@/app/actions/send-reminders';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Mail, Clock, ShieldAlert } from 'lucide-react';

export default function TestRemindersPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const handleTest = async (type: '1day' | '7day') => {
    setLoading(type);
    try {
      const res = type === '1day' ? await sendOneDayTestEmail() : await sendSevenDayTestEmail();
      if (res.success) {
        toast({
          title: "Test email sent!",
          description: "Check your inbox for the notification.",
        });
      } else {
        toast({
          title: "Error",
          description: res.error || "Failed to send email",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className='p-8 max-w-4xl mx-auto'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold mb-2'>Email Notification Testing</h1>
        <p className='text-muted-foreground'>
          Use this page to verify that the new expiration reminder templates look correct in your email client.
        </p>
      </div>

      <div className='grid gap-6 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <ShieldAlert className='text-red-500' />
              1-Day Reminder
            </CardTitle>
            <CardDescription>
              Sends the "Urgent: Investment Expiring Tomorrow!" template.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className='w-full' 
              variant='destructive'
              onClick={() => handleTest('1day')}
              disabled={loading !== null}
            >
              <Mail className='mr-2 h-4 w-4' />
              {loading === '1day' ? 'Sending...' : 'Send Test (1 Day)'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Clock className='text-blue-500' />
              7-Day Reminder
            </CardTitle>
            <CardDescription>
              Sends the "Investment Reminder: 7 days to go" template.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className='w-full'
              onClick={() => handleTest('7day')}
              disabled={loading !== null}
            >
              <Mail className='mr-2 h-4 w-4' />
              {loading === '7day' ? 'Sending...' : 'Send Test (7 Days)'}
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <div className='mt-12 p-4 border rounded-lg bg-muted/30 text-sm text-muted-foreground'>
        <p><strong>Note:</strong> These tests use mock data for "MobiasBanca" or "MAIB" and will be sent to your primary email address associated with your account.</p>
      </div>
    </div>
  );
}
