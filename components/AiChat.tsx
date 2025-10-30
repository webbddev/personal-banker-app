'use client';

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import { Message, MessageContent } from '@/components/ai-elements/message';
import { Actions, Action } from '@/components/ai-elements/actions';
import { Fragment } from 'react';
import { type UIMessage as AIMessage } from '@ai-sdk/react';
import { Response } from '@/components/ai-elements/response';
import { CopyIcon, RefreshCcwIcon } from 'lucide-react';
import {
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from '@/components/ai-elements/sources';
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from '@/components/ai-elements/reasoning';
import { Loader } from '@/components/ai-elements/loader';
import { useUser } from '@clerk/nextjs';
import Image from 'next/image';

interface AIChatProps {
  messages: AIMessage[];
  status: string;
  error: any;
  regenerate: () => void;
  isCopied: Record<string, boolean>;
  setIsCopied: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}

const AIChat = ({
  messages,
  status,
  error,
  regenerate,
  isCopied,
  setIsCopied,
}: AIChatProps) => {
  const { user } = useUser();
  const firstName = user?.firstName;

  return (
    <div className='max-w-4xl mx-auto relative size-full'>
      <Conversation className='h-full'>
        <ConversationContent>
          {messages.map((message) => (
            <div key={message.id}>
              {message.role === 'assistant' &&
                message.parts.filter((part) => part.type === 'source-url')
                  .length > 0 && (
                  <Sources>
                    <SourcesTrigger
                      count={
                        message.parts.filter(
                          (part) => part.type === 'source-url'
                        ).length
                      }
                    />
                    {message.parts
                      .filter((part) => part.type === 'source-url')
                      .map((part, i) => (
                        <SourcesContent key={`${message.id}-${i}`}>
                          <Source
                            key={`${message.id}-${i}`}
                            href={part.url}
                            title={part.url}
                          />
                        </SourcesContent>
                      ))}
                  </Sources>
                )}
              {message.parts.map((part, i) => {
                const partId = `${message.id}-${i}`;
                switch (part.type) {
                  case 'text':
                    return (
                      <Fragment key={partId}>
                        <Message
                          from={message.role}
                          displayName={
                            message.role === 'assistant'
                              ? 'Personal Banker'
                              : firstName || 'You'
                          }
                        >
                          <MessageContent>
                            <Response>{part.text}</Response>
                          </MessageContent>
                        </Message>
                        {message.role === 'assistant' &&
                          i === message.parts.length - 1 &&
                          message.id === messages.at(-1)?.id && (
                            <Actions>
                              <Action
                                onClick={() => regenerate()}
                                label='Retry'
                              >
                                <RefreshCcwIcon className='size-3' />
                              </Action>
                              <Action
                                onClick={() => {
                                  navigator.clipboard.writeText(part.text);
                                  setIsCopied((prev) => ({
                                    ...prev,
                                    [partId]: true,
                                  }));
                                  setTimeout(
                                    () =>
                                      setIsCopied((prev) => ({
                                        ...prev,
                                        [partId]: false,
                                      })),
                                    1000
                                  );
                                }}
                                label={isCopied[partId] ? 'Copied' : 'Copy'}
                              >
                                {isCopied[partId] ? (
                                  <span className='text-xs'>Copied</span>
                                ) : (
                                  <CopyIcon className='size-3' />
                                )}
                              </Action>
                            </Actions>
                          )}
                      </Fragment>
                    );
                  case 'reasoning':
                    return (
                      <Reasoning
                        key={`${message.id}-${i}`}
                        className='w-full'
                        isStreaming={
                          status === 'streaming' &&
                          i === message.parts.length - 1 &&
                          message.id === messages.at(-1)?.id
                        }
                      >
                        <ReasoningTrigger />
                        <ReasoningContent>{part.text}</ReasoningContent>
                      </Reasoning>
                    );
                  case 'file':
                    if (part.mediaType?.startsWith('image/')) {
                      return (
                        <Image
                          key={`${message.id}-${i}`}
                          src={part.url}
                          alt={part.filename ?? `Attachment ${i}`}
                          width={500}
                          height={500}
                        />
                      );
                    }
                    if (part.mediaType?.startsWith('application/pdf')) {
                      return (
                        <iframe
                          key={`${message.id}-${i}`}
                          src={part.url}
                          width={500}
                          height={600}
                          title={part.filename ?? `attachment-${i}`}
                        />
                      );
                    }
                  default:
                    return null;
                }
              })}
            </div>
          ))}
          {status === 'submitted' || (status === 'streaming' && <Loader />)}
          {error && (
            <Message from='assistant' displayName='Personal Banker'>
              <MessageContent>
                <div className='p-4 rounded-lg bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400'>
                  <h4 className='font-bold mb-1'>An error occurred</h4>
                  <p className='text-sm'>{error.message}</p>
                </div>
              </MessageContent>
            </Message>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
    </div>
  );
};

export default AIChat;
