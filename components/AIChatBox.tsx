'use client';

import { cn } from '@/lib/utils';
import {
  Bot,
  BrainCog,
  Expand,
  GlobeIcon,
  Minimize,
  SquareIcon,
  Trash,
  X,
} from 'lucide-react';
import { Button } from './ui/button';
import AIChat from './AiChat';
import { useState } from 'react';
import { useChat, type UIMessage as AIMessage } from '@ai-sdk/react';
import { useUser } from '@clerk/nextjs';
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

interface AIChatBoxProps {
  open: boolean;
  onClose: () => void;
}

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

  const handleClearChat = () => {
    setMessages([]);
  };

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
            title={isExpanded ? 'Minimize' : 'Expand'}
          >
            {isExpanded ? <Minimize /> : <Expand />}
          </Button>
          <Button
            variant='ghost'
            size='icon'
            onClick={handleClearChat}
            className='text-primary-foreground hover:bg-transparent h-8 w-8'
            title='Clear chat'
          >
            <Trash />
          </Button>
          <Button
            variant='ghost'
            size='icon'
            onClick={onClose}
            className='text-primary-foreground hover:bg-transparent h-8 w-8'
          >
            <X className='size-4' />
          </Button>
        </div>
      </div>
      <div className='flex-1 space-y-4 overflow-y-auto p-3'>
        <AIChat
          messages={messages}
          status={status}
          error={error}
          regenerate={regenerate}
          isCopied={isCopied}
          setIsCopied={setIsCopied}
        />
      </div>
      <div className='border-t p-3'>
        {(status === 'submitted' || status === 'streaming') && (
          <div className='flex justify-center items-center p-4 bg-background'>
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
}
