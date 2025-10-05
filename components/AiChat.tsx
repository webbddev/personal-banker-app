'use client';

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import { Message, MessageContent } from '@/components/ai-elements/message';
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputButton,
  type PromptInputMessage,
  PromptInputModelSelect,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from '@/components/ai-elements/prompt-input';
import { Actions, Action } from '@/components/ai-elements/actions';
import { Fragment, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { Response } from '@/components/ai-elements/response';
import {
  Bot,
  CopyIcon,
  GlobeIcon,
  RefreshCcwIcon,
  SquareIcon,
} from 'lucide-react';
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
import { Button } from './ui/button';
import Image from 'next/image';

// Define available llm models
const models = [
  {
    name: 'Grok 4 Fast Reasoning',
    value: 'xai/grok-4-fast-reasoning',
  },
  {
    name: 'Gemini Flash',
    value: 'google/gemini-2.5-flash',
  },
  {
    name: 'Perplexity Sonar',
    value: 'perplexity/sonar',
  },
  {
    name: 'GPT 4o mini',
    value: 'openai/gpt-4o-mini',
  },
  {
    name: 'GPT 4o',
    value: 'openai/gpt-4o',
  },
  {
    name: 'GPT 4.1 Nano',
    value: 'openai/gpt-4.1-nano',
  },
  {
    name: 'Deepseek R1',
    value: 'deepseek/deepseek-r1',
  },
];

const AIChat = () => {
  const { user } = useUser();
  const firstName = user?.firstName;

  const [prompt, setPrompt] = useState('');
  // const [model, setModel] = useState<string>('');
  const [model, setModel] = useState<string>(models[0].value);
  const [webSearch, setWebSearch] = useState(false);
  const [isCopied, setIsCopied] = useState<Record<string, boolean>>({});

  const { messages, sendMessage, status, regenerate, error, stop } = useChat();

  const handleSubmit = (message: PromptInputMessage) => {
    const hasText = Boolean(message.text);
    const hasAttachments = Boolean(message.files?.length);

    if (!(hasText || hasAttachments)) {
      return;
    }

    sendMessage(
      {
        text: message.text || 'Sent with attachments',
        files: message.files,
      },
      {
        body: {
          model: model,
          webSearch: webSearch,
        },
      }
    );
    setPrompt('');
  };

  return (
    <div className='max-w-4xl mx-auto p-6 relative size-full h-screen'>
      <div className='flex flex-col h-[80vh]'>
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

        {(status === 'submitted' || status === 'streaming') && (
          <div className='flex justify-center items-center p-4 border-t bg-background'>
            <Button variant='secondary' onClick={stop}>
              <SquareIcon className='mr-2 size-4' />
              Stop generating
            </Button>
          </div>
        )}

        <PromptInput
          onSubmit={handleSubmit}
          className='mt-4'
          globalDrop
          multiple
        >
          <PromptInputBody>
            <PromptInputAttachments>
              {(attachment) => <PromptInputAttachment data={attachment} />}
            </PromptInputAttachments>
            <PromptInputTextarea
              onChange={(e) => setPrompt(e.target.value)}
              value={prompt}
            />
          </PromptInputBody>
          <PromptInputToolbar>
            <PromptInputTools>
              <PromptInputActionMenu>
                <PromptInputActionMenuTrigger />
                <PromptInputActionMenuContent>
                  <PromptInputActionAddAttachments />
                </PromptInputActionMenuContent>
              </PromptInputActionMenu>
              <PromptInputButton
                variant={webSearch ? 'default' : 'ghost'}
                onClick={() => setWebSearch(!webSearch)}
              >
                <GlobeIcon size={16} />
                <span>Search</span>
              </PromptInputButton>
              <PromptInputModelSelect
                onValueChange={(value) => {
                  setModel(value);
                }}
                value={model}
              >
                <PromptInputModelSelectTrigger>
                  <PromptInputModelSelectValue />
                </PromptInputModelSelectTrigger>
                <PromptInputModelSelectContent>
                  {models.map((model) => (
                    <PromptInputModelSelectItem
                      key={model.value}
                      value={model.value}
                    >
                      {model.name}
                    </PromptInputModelSelectItem>
                  ))}
                </PromptInputModelSelectContent>
              </PromptInputModelSelect>
            </PromptInputTools>
            <PromptInputSubmit
              disabled={
                !prompt || status === 'submitted' || status === 'streaming'
              }
              status={status}
            />
          </PromptInputToolbar>
        </PromptInput>
      </div>
    </div>
  );
};

export default AIChat;
