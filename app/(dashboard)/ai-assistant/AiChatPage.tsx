// 'use client';

// import { cn } from '@/lib/utils';
// import { CopyIcon, RefreshCcwIcon, GlobeIcon, SquareIcon } from 'lucide-react';
// import { Button } from '../../../components/ui/button';
// import { Fragment, useState } from 'react';
// import { useChat } from '@ai-sdk/react';
// import { useUser } from '@clerk/nextjs';
// import {
//   PromptInput,
//   PromptInputActionAddAttachments,
//   PromptInputActionMenu,
//   PromptInputActionMenuContent,
//   PromptInputActionMenuTrigger,
//   PromptInputAttachment,
//   PromptInputAttachments,
//   PromptInputBody,
//   PromptInputButton,
//   type PromptInputMessage,
//   PromptInputModelSelect,
//   PromptInputModelSelectContent,
//   PromptInputModelSelectItem,
//   PromptInputModelSelectTrigger,
//   PromptInputModelSelectValue,
//   PromptInputSubmit,
//   PromptInputTextarea,
//   PromptInputToolbar,
//   PromptInputTools,
// } from '@/components/ai-elements/prompt-input';
// import {
//   Conversation,
//   ConversationContent,
//   ConversationScrollButton,
// } from '../../../components/ai-elements/conversation';
// import {
//   Message,
//   MessageContent,
// } from '../../../components/ai-elements/message';
// import { Response } from '../../../components/ai-elements/response';
// import { Action, Actions } from '../../../components/ai-elements/actions';
// import {
//   Source,
//   Sources,
//   SourcesContent,
//   SourcesTrigger,
// } from '../../../components/ai-elements/sources';
// import {
//   Reasoning,
//   ReasoningContent,
//   ReasoningTrigger,
// } from '../../../components/ai-elements/reasoning';
// import { Loader } from '../../../components/ai-elements/loader';
// import Image from 'next/image';

// const models = [
//   {
//     name: 'Grok 4 Fast Reasoning',
//     value: 'xai/grok-4-fast-reasoning',
//   },
//   {
//     name: 'Gemini Flash',
//     value: 'google/gemini-2.5-flash',
//   },
//   {
//     name: 'Perplexity Sonar',
//     value: 'perplexity/sonar',
//   },
//   {
//     name: 'GPT 4o mini',
//     value: 'openai/gpt-4o-mini',
//   },
//   {
//     name: 'GPT 4o',
//     value: 'openai/gpt-4o',
//   },
//   {
//     name: 'GPT 4.1 Nano',
//     value: 'openai/gpt-4.1-nano',
//   },
//   {
//     name: 'Deepseek R1',
//     value: 'deepseek/deepseek-r1',
//   },
// ];

// export function AiChatPage() {
//   const { user } = useUser();
//   const firstName = user?.firstName;

//   const [prompt, setPrompt] = useState('');
//   const [model, setModel] = useState<string>(models[0].value);
//   const [webSearch, setWebSearch] = useState(false);
//   const [isCopied, setIsCopied] = useState<Record<string, boolean>>({});

//   const { messages, sendMessage, status, regenerate, error, stop } = useChat();

//   const handleSubmit = (message: PromptInputMessage) => {
//     const hasText = Boolean(message.text);
//     const hasAttachments = Boolean(message.files?.length);

//     if (!(hasText || hasAttachments)) {
//       return;
//     }

//     sendMessage(
//       {
//         text: message.text || 'Sent with attachments',
//         files: message.files,
//       },
//       {
//         body: {
//           model: model,
//           webSearch: webSearch,
//         },
//       }
//     );
//     setPrompt('');
//   };

//   return (
//     <div className='flex flex-col h-full'>
//       <div className='flex-1 space-y-4 overflow-y-auto p-3'>
//         <div className='max-w-4xl mx-auto relative size-full'>
//           <Conversation className='h-full'>
//             <ConversationContent>
//               {messages.map((message) => (
//                 <div key={message.id}>
//                   {message.role === 'assistant' &&
//                     message.parts.filter((part) => part.type === 'source-url')
//                       .length > 0 && (
//                       <Sources>
//                         <SourcesTrigger
//                           count={
//                             message.parts.filter(
//                               (part) => part.type === 'source-url'
//                             ).length
//                           }
//                         />
//                         {message.parts
//                           .filter((part) => part.type === 'source-url')
//                           .map((part, i) => (
//                             <SourcesContent key={`${message.id}-${i}`}>
//                               <Source
//                                 key={`${message.id}-${i}`}
//                                 href={part.url}
//                                 title={part.url}
//                               />
//                             </SourcesContent>
//                           ))}
//                       </Sources>
//                     )}
//                   {message.parts.map((part, i) => {
//                     const partId = `${message.id}-${i}`;
//                     switch (part.type) {
//                       case 'text':
//                         return (
//                           <Fragment key={partId}>
//                             <Message
//                               from={message.role}
//                               displayName={
//                                 message.role === 'assistant'
//                                   ? 'Personal Banker'
//                                   : firstName || 'You'
//                               }
//                             >
//                               <MessageContent>
//                                 <Response>{part.text}</Response>
//                               </MessageContent>
//                             </Message>
//                             {message.role === 'assistant' &&
//                               i === message.parts.length - 1 &&
//                               message.id === messages.at(-1)?.id && (
//                                 <Actions>
//                                   <Action
//                                     onClick={() => regenerate()}
//                                     label='Retry'
//                                   >
//                                     <RefreshCcwIcon className='size-3' />
//                                   </Action>
//                                   <Action
//                                     onClick={() => {
//                                       navigator.clipboard.writeText(part.text);
//                                       setIsCopied((prev) => ({
//                                         ...prev,
//                                         [partId]: true,
//                                       }));
//                                       setTimeout(
//                                         () =>
//                                           setIsCopied((prev) => ({
//                                             ...prev,
//                                             [partId]: false,
//                                           })),
//                                         1000
//                                       );
//                                     }}
//                                     label={isCopied[partId] ? 'Copied' : 'Copy'}
//                                   >
//                                     {isCopied[partId] ? (
//                                       <span className='text-xs'>Copied</span>
//                                     ) : (
//                                       <CopyIcon className='size-3' />
//                                     )}
//                                   </Action>
//                                 </Actions>
//                               )}
//                           </Fragment>
//                         );
//                       case 'reasoning':
//                         return (
//                           <Reasoning
//                             key={`${message.id}-${i}`}
//                             className='w-full'
//                             isStreaming={
//                               status === 'streaming' &&
//                               i === message.parts.length - 1 &&
//                               message.id === messages.at(-1)?.id
//                             }
//                           >
//                             <ReasoningTrigger />
//                             <ReasoningContent>{part.text}</ReasoningContent>
//                           </Reasoning>
//                         );
//                       case 'file':
//                         if (part.mediaType?.startsWith('image/')) {
//                           return (
//                             <Image
//                               key={`${message.id}-${i}`}
//                               src={part.url}
//                               alt={part.filename ?? `Attachment ${i}`}
//                               width={500}
//                               height={500}
//                             />
//                           );
//                         }
//                         if (part.mediaType?.startsWith('application/pdf')) {
//                           return (
//                             <iframe
//                               key={`${message.id}-${i}`}
//                               src={part.url}
//                               width={500}
//                               height={600}
//                               title={part.filename ?? `attachment-${i}`}
//                             />
//                           );
//                         }
//                       default:
//                         return null;
//                     }
//                   })}
//                 </div>
//               ))}
//               {status === 'submitted' || (status === 'streaming' && <Loader />)}
//               {error && (
//                 <Message from='assistant' displayName='Personal Banker'>
//                   <MessageContent>
//                     <div className='p-4 rounded-lg bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400'>
//                       <h4 className='font-bold mb-1'>An error occurred</h4>
//                       <p className='text-sm'>{error.message}</p>
//                     </div>
//                   </MessageContent>
//                 </Message>
//               )}
//             </ConversationContent>
//             <ConversationScrollButton />
//           </Conversation>
//         </div>
//       </div>
//       <div className='border-t p-3'>
//         {(status === 'submitted' || status === 'streaming') && (
//           <div className='flex justify-center items-center p-4 bg-background'>
//             <Button variant='secondary' onClick={stop}>
//               <SquareIcon className='mr-2 size-4' />
//               Stop generating
//             </Button>
//           </div>
//         )}

//         <PromptInput
//           onSubmit={handleSubmit}
//           className='mt-4'
//           globalDrop
//           multiple
//         >
//           <PromptInputBody>
//             <PromptInputAttachments>
//               {(attachment) => <PromptInputAttachment data={attachment} />}
//             </PromptInputAttachments>
//             <PromptInputTextarea
//               onChange={(e) => setPrompt(e.target.value)}
//               value={prompt}
//             />
//           </PromptInputBody>
//           <PromptInputToolbar>
//             <PromptInputTools>
//               <PromptInputActionMenu>
//                 <PromptInputActionMenuTrigger />
//                 <PromptInputActionMenuContent>
//                   <PromptInputActionAddAttachments />
//                 </PromptInputActionMenuContent>
//               </PromptInputActionMenu>
//               <PromptInputButton
//                 variant={webSearch ? 'default' : 'ghost'}
//                 onClick={() => setWebSearch(!webSearch)}
//               >
//                 <GlobeIcon size={16} />
//                 <span>Search</span>
//               </PromptInputButton>
//               <PromptInputModelSelect
//                 onValueChange={(value) => {
//                   setModel(value);
//                 }}
//                 value={model}
//               >
//                 <PromptInputModelSelectTrigger>
//                   <PromptInputModelSelectValue />
//                 </PromptInputModelSelectTrigger>
//                 <PromptInputModelSelectContent>
//                   {models.map((model) => (
//                     <PromptInputModelSelectItem
//                       key={model.value}
//                       value={model.value}
//                     >
//                       {model.name}
//                     </PromptInputModelSelectItem>
//                   ))}
//                 </PromptInputModelSelectContent>
//               </PromptInputModelSelect>
//             </PromptInputTools>
//             <PromptInputSubmit
//               disabled={
//                 !prompt || status === 'submitted' || status === 'streaming'
//               }
//               status={status}
//             />
//           </PromptInputToolbar>
//         </PromptInput>
//       </div>
//     </div>
//   );
// }
