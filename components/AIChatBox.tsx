'use client';

import { cn } from '@/lib/utils';
import {
  BrainCog,
  Expand,
  GlobeIcon,
  Minimize,
  SquareIcon,
  Trash,
  X,
  CopyIcon,
  RefreshCcwIcon,
} from 'lucide-react';
import { Button } from './ui/button';
import { Fragment, useState } from 'react';
import { useChat, type UIMessage as AIMessage } from '@ai-sdk/react';
import { useUser } from '@clerk/nextjs';
import {
  // LobeHub Icons - Importing the components directly
  Grok,
  Gemini,
  Perplexity,
  OpenAI,
  DeepSeek,
} from '@lobehub/icons';

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
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from '@/components/ai-elements/prompt-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from './ai-elements/conversation';
import { Message, MessageContent } from './ai-elements/message';
import { Response } from './ai-elements/response';
import { Action, Actions } from './ai-elements/actions';
import {
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from './ai-elements/sources';
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from './ai-elements/reasoning';
import { Loader } from './ai-elements/loader';
import Image from 'next/image';

interface AIChatBoxProps {
  open: boolean;
  onClose: () => void;
}

// Define available llm models using LobeHub Icon components
const models = [
  {
    name: 'Grok 4.1 Fast Non-Reasoning',
    shortName: 'Grok 4.1',
    value: 'xai/grok-4.1-fast-non-reasoning',
    Icon: Grok,
  },
  {
    name: 'Gemini Flash 2.5',
    shortName: 'Gemini Flash',
    value: 'google/gemini-2.5-flash',
    Icon: Gemini.Color,
  },
  {
    name: 'Perplexity Sonar',
    shortName: 'Perplexity',
    value: 'perplexity/sonar',
    Icon: Perplexity.Color,
  },
  {
    name: 'GPT 4o mini',
    shortName: 'GPT 4o mini',
    value: 'openai/gpt-4o-mini',
    Icon: OpenAI,
  },
  {
    name: 'Deepseek R1',
    shortName: 'Deepseek R1',
    value: 'deepseek/deepseek-r1',
    Icon: DeepSeek.Color,
  },
  {
    name: 'Deepseek V3.2',
    shortName: 'Deepseek V3.2',
    value: 'deepseek/deepseek-v3.2',
    Icon: DeepSeek.Color,
  },
];

export function AIChatBox({ open, onClose }: AIChatBoxProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { user } = useUser();
  const firstName = user?.firstName;

  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState<string>(models[0].value);
  const [webSearch, setWebSearch] = useState(false);
  const [isCopied, setIsCopied] = useState<Record<string, boolean>>({});

  const {
    messages,
    sendMessage,
    status,
    regenerate,
    error,
    stop,
    setMessages,
  } = useChat();

  const handleSubmit = (message: PromptInputMessage) => {
    const hasText = Boolean(message.text);
    const hasAttachments = Boolean(message.files?.length);

    if (!(hasText || hasAttachments)) return;

    sendMessage(
      {
        text: message.text || 'Sent with attachments',
        files: message.files,
      },
      {
        body: { model, webSearch },
      }
    );
    setPrompt('');
  };

  const handleClearChat = () => setMessages([]);

  const currentModel = models.find((m) => m.value === model) || models[0];

  if (!open) return null;

  return (
    <div
      className={cn(
        'animate-in slide-in-from-bottom-10 bg-card fixed right-4 bottom-4 z-50 flex flex-col rounded-lg border shadow-lg duration-300 2xl:right-16',
        isExpanded
          ? 'h-[950px] max-h-[90vh] w-[550px] max-w-[90vw]'
          : 'h-[500px] max-h-[80vh] w-80 sm:w-96'
      )}
    >
      {/* Header */}
      <div className='bg-[#40C1AC] text-primary-foreground flex items-center justify-between rounded-t-lg border-b p-3'>
        <div className='flex items-center gap-2'>
          <BrainCog size={18} />
          <h3 className='font-medium'>Personal Banker</h3>
        </div>
        <div className='flex items-center gap-1'>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => setIsExpanded(!isExpanded)}
            className='text-primary-foreground hover:bg-transparent h-8 w-8'
          >
            {isExpanded ? <Minimize size={18} /> : <Expand size={18} />}
          </Button>
          <Button
            variant='ghost'
            size='icon'
            onClick={handleClearChat}
            className='text-primary-foreground hover:bg-transparent h-8 w-8'
          >
            <Trash size={18} />
          </Button>
          <Button
            variant='ghost'
            size='icon'
            onClick={onClose}
            className='text-primary-foreground hover:bg-transparent h-8 w-8'
          >
            <X size={18} />
          </Button>
        </div>
      </div>

      {/* Conversation Area */}
      <div className='flex-1 space-y-4 overflow-y-auto p-3'>
        <div className='max-w-4xl mx-auto relative size-full'>
          <Conversation className='h-full'>
            <ConversationContent>
              {messages.map((message) => (
                <div key={message.id}>
                  {/* Sources logic */}
                  {message.role === 'assistant' &&
                    message.parts.some((p) => p.type === 'source-url') && (
                      <Sources>
                        <SourcesTrigger
                          count={
                            message.parts.filter((p) => p.type === 'source-url')
                              .length
                          }
                        />
                        {message.parts
                          .filter((part) => part.type === 'source-url')
                          .map((part, i) => (
                            <SourcesContent key={`${message.id}-${i}`}>
                              <Source href={part.url} title={part.url} />
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
                            {/* Actions (Copy/Retry) */}
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
                                        2000
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
                            key={partId}
                            className='w-full'
                            isStreaming={status === 'streaming'}
                          >
                            <ReasoningTrigger />
                            <ReasoningContent>{part.text}</ReasoningContent>
                          </Reasoning>
                        );
                      case 'file':
                        if (part.mediaType?.startsWith('image/')) {
                          return (
                            <Image
                              key={partId}
                              src={part.url}
                              alt='upload'
                              width={500}
                              height={500}
                              className='rounded-lg my-2'
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
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>
        </div>
      </div>

      {/* Input Area */}
      <div className='border-t p-3'>
        {['submitted', 'streaming'].includes(status) && (
          <div className='flex justify-center items-center pb-3'>
            <Button variant='secondary' size='sm' onClick={stop}>
              <SquareIcon className='mr-2 size-3' /> Stop generating
            </Button>
          </div>
        )}

        <PromptInput onSubmit={handleSubmit} globalDrop multiple>
          <PromptInputBody>
            <PromptInputAttachments>
              {(attachment) => <PromptInputAttachment data={attachment} />}
            </PromptInputAttachments>
            <PromptInputTextarea
              onChange={(e) => setPrompt(e.target.value)}
              value={prompt}
              placeholder='Ask your banker anything...'
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

              <Select value={model} onValueChange={setModel}>
                <SelectTrigger
                  className={cn(
                    'border-none bg-transparent font-medium text-muted-foreground shadow-none transition-colors h-9',
                    'hover:bg-accent hover:text-foreground max-w-[140px]'
                  )}
                >
                  <div className='flex items-center gap-2 min-w-0'>
                    {/* Using Lobe Icon Component */}
                    <currentModel.Icon size={16} />
                    <span className='truncate text-sm'>
                      {isExpanded ? currentModel.name : currentModel.shortName}
                    </span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {models.map((m) => (
                    <SelectItem
                      key={m.value}
                      value={m.value}
                      className='cursor-pointer'
                    >
                      <div className='flex items-center gap-2'>
                        <m.Icon size={16} />
                        <span>{m.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </PromptInputTools>
            <PromptInputSubmit
              disabled={!prompt || ['submitted', 'streaming'].includes(status)}
              status={status}
            />
          </PromptInputToolbar>
        </PromptInput>
      </div>
    </div>
  );
}
