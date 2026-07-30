'use client';

import { useState, useEffect, useTransition } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  Send,
  LinkIcon,
  Unlink,
  Loader2,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';
import {
  getTelegramStatus,
  generateTelegramConnectionCode,
  unlinkTelegramAccount,
} from '@/app/actions/telegram';

export function TelegramSettings() {
  const [linked, setLinked] = useState(false);
  const [deepLink, setDeepLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  // Fetch current status on mount
  useEffect(() => {
    getTelegramStatus().then((status) => {
      setLinked(status.linked);
      setLoading(false);
    });
  }, []);

  const handleGenerateLink = async () => {
    startTransition(async () => {
      const result = await generateTelegramConnectionCode();

      if (result.success && result.deepLink) {
        setDeepLink(result.deepLink);
        toast({
          title: 'Link Generated! 🔗',
          description:
            'Click the link below to open Telegram and connect your account.',
          duration: 5000,
        });
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Could not generate connection link.',
          variant: 'destructive',
          duration: 5000,
        });
      }
    });
  };

  const handleUnlink = async () => {
    startTransition(async () => {
      const result = await unlinkTelegramAccount();

      if (result.success) {
        setLinked(false);
        setDeepLink(null);
        toast({
          title: 'Telegram Unlinked',
          description: 'You will no longer receive Telegram notifications.',
          duration: 5000,
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to unlink Telegram account.',
          variant: 'destructive',
          duration: 5000,
        });
      }
    });
  };

  const handleCopyLink = async () => {
    if (!deepLink) return;
    await navigator.clipboard.writeText(deepLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className='flex items-center justify-center py-10'>
          <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Send className='h-5 w-5 text-blue-500' />
          Telegram Notifications
        </CardTitle>
        <CardDescription>
          Link your Telegram account to receive investment reminders directly on
          your phone.
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Status indicator */}
        <div className='flex items-center gap-3 rounded-lg border p-4'>
          <div
            className={`h-3 w-3 rounded-full ${
              linked
                ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                : 'bg-zinc-400'
            }`}
          />
          <div className='flex-1'>
            <p className='text-sm font-medium'>
              {linked ? 'Connected' : 'Not Connected'}
            </p>
            <p className='text-xs text-muted-foreground'>
              {linked
                ? 'Your Telegram account is linked. You will receive notifications.'
                : 'Link your Telegram to get started.'}
            </p>
          </div>
          {linked && (
            <CheckCircle2 className='h-5 w-5 text-emerald-500 shrink-0' />
          )}
        </div>

        {/* Actions */}
        {linked ? (
          <Button
            variant='outline'
            className='w-full gap-2 text-destructive hover:text-destructive'
            onClick={handleUnlink}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              <Unlink className='h-4 w-4' />
            )}
            Unlink Telegram Account
          </Button>
        ) : (
          <div className='space-y-3'>
            {!deepLink ? (
              <Button
                className='w-full gap-2'
                onClick={handleGenerateLink}
                disabled={isPending}
              >
                {isPending ? (
                  <Loader2 className='h-4 w-4 animate-spin' />
                ) : (
                  <LinkIcon className='h-4 w-4' />
                )}
                Link Telegram Account
              </Button>
            ) : (
              <div className='space-y-3'>
                <div className='rounded-lg border border-blue-500/20 bg-blue-500/5 p-4'>
                  <p className='mb-3 text-sm font-medium'>
                    Click the button below to open Telegram and link your
                    account:
                  </p>
                  <div className='flex flex-col gap-2 sm:flex-row'>
                    <Button asChild className='flex-1 gap-2'>
                      <a
                        href={deepLink}
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        <ExternalLink className='h-4 w-4' />
                        Open in Telegram
                      </a>
                    </Button>
                    <Button
                      variant='outline'
                      size='icon'
                      onClick={handleCopyLink}
                      className='shrink-0'
                    >
                      {copied ? (
                        <Check className='h-4 w-4 text-emerald-500' />
                      ) : (
                        <Copy className='h-4 w-4' />
                      )}
                    </Button>
                  </div>
                </div>
                <p className='text-xs text-muted-foreground'>
                  After clicking &quot;Start&quot; in Telegram, return here and
                  refresh the page to confirm the connection.
                </p>
              </div>
            )}
          </div>
        )}

        {/* How it works */}
        <div className='rounded-lg bg-muted/30 p-4'>
          <p className='mb-2 text-sm font-medium'>How it works</p>
          <ol className='list-inside list-decimal space-y-1 text-xs text-muted-foreground'>
            <li>
              Click &quot;Link Telegram Account&quot; to generate a unique link.
            </li>
            <li>
              Open the link — it will take you to the bot in Telegram.
            </li>
            <li>
              Press &quot;Start&quot; in Telegram to complete the connection.
            </li>
            <li>
              You&apos;ll receive investment reminders directly in Telegram!
            </li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}
