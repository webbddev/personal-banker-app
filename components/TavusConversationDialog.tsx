'use client';

import { useState, useCallback, useRef } from 'react';
import { Video, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ShineBorder } from '@/components/ui/shine-border';
import { Conversation } from '@/app/components/cvi/components/conversation';
import {
  createTavusConversation,
  endTavusConversation,
} from '@/app/components/cvi/lib/tavus-client';

type TavusConversation = {
  conversation_id: string;
  conversation_url: string;
};

export function TavusConversationDialog() {
  const [conversation, setConversation] = useState<TavusConversation | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const isStartingRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  async function startConversation() {
    if (isStartingRef.current || conversation) return;
    
    setIsStarting(true);
    isStartingRef.current = true;
    setError(null);
    setIsOpen(true);

    try {
      const result = await createTavusConversation({
        pal_id: 'pe6482f50ca0',
        conversation_name: 'Personal Banker Landing',
      });
      setConversation(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start conversation');
    } finally {
      setIsStarting(false);
      isStartingRef.current = false;
    }
  }

  const handleLeave = useCallback(async () => {
    if (conversation) {
      await endTavusConversation(conversation.conversation_id).catch(() => undefined);
    }
    setConversation(null);
    setIsStarting(false);
    setIsOpen(false);
  }, [conversation]);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        handleLeave();
      }
    },
    [handleLeave],
  );

  return (
    <>
      <ShineBorder
        className="p-0 min-h-0 min-w-0 bg-transparent hover:scale-105 transition-transform duration-300"
        borderRadius={40}
        borderWidth={2}
        color={['#14b8a6', '#ffffff', '#14b8a6']}
        duration={10}
      >
        <Button
          onClick={startConversation}
          disabled={isStarting || conversation !== null}
          className="h-12 px-8 text-lg rounded-full bg-transparent hover:bg-teal-500/10 text-teal-400 border border-teal-500/30 hover:border-teal-400/50 shadow-none"
        >
          {isStarting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Connecting…
            </>
          ) : (
            <>
              <Video className="mr-2 h-5 w-5" />
              Talk to My Banker
            </>
          )}
        </Button>
      </ShineBorder>

      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-5xl w-[95vw] sm:w-[90vw] p-0 border-teal-500/20 bg-background/95 backdrop-blur-md overflow-hidden shadow-2xl">
          <DialogTitle className="sr-only">AI Banker Conversation</DialogTitle>
          <DialogDescription className="sr-only">Interactive video conversation with your personal AI banker.</DialogDescription>

          {error ? (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 p-8">
              <div className="rounded-full bg-red-500/10 p-4">
                <Video className="h-8 w-8 text-red-400" />
              </div>
              <p className="text-red-400 text-center max-w-md">{error}</p>
              <Button
                onClick={() => {
                  setError(null);
                  setIsOpen(false);
                  setIsStarting(false);
                }}
                variant="outline"
                className="border-teal-500/30 hover:bg-teal-500/10"
              >
                Close
              </Button>
            </div>
          ) : !conversation ? (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-teal-400" />
              <p className="text-muted-foreground">Starting conversation with your AI Banker…</p>
            </div>
          ) : (
            <div className="w-full">
              <Conversation
                conversationUrl={conversation.conversation_url}
                onLeave={handleLeave}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
