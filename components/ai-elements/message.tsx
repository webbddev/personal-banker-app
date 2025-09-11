import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { UIMessage } from "ai";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps, HTMLAttributes } from "react";

export type MessageProps = HTMLAttributes<HTMLDivElement> & {
  from: UIMessage['role'];
  displayName?: string;
};

export const Message = ({
  className,
  from,
  displayName,
  children,
  ...props
}: MessageProps) => (
  <div
    className={cn(
      'flex flex-col gap-2 py-2',
      from === 'user' ? 'items-end' : 'items-start'
    )}
  >
    {displayName && <div className='text-xs font-medium'>{displayName}</div>}
    <div
      className={cn(
        'group flex w-full items-end justify-end gap-2',
        from === 'user'
          ? 'is-user'
          : 'is-assistant flex-row-reverse justify-end',
        className
      )}
      {...props}
    >
      {children}
    </div>
  </div>
);

const messageContentVariants = cva(
  "is-user:dark flex flex-col gap-2 overflow-hidden rounded-lg text-sm",
  {
    variants: {
      variant: {
        contained: [
          "max-w-[80%] px-4 py-3",
          "group-[.is-user]:bg-primary group-[.is-user]:text-primary-foreground",
          "group-[.is-assistant]:bg-secondary group-[.is-assistant]:text-foreground",
        ],
        flat: [
          "group-[.is-user]:max-w-[80%] group-[.is-user]:bg-secondary group-[.is-user]:px-4 group-[.is-user]:py-3 group-[.is-user]:text-foreground",
          "group-[.is-assistant]:text-foreground",
        ],
      },
    },
    defaultVariants: {
      variant: "contained",
    },
  }
);

export type MessageContentProps = HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof messageContentVariants>;

export const MessageContent = ({
  children,
  className,
  variant,
  ...props
}: MessageContentProps) => (
  <div
    className={cn(messageContentVariants({ variant, className }))}
    {...props}
  >
    {children}
  </div>
);

export type MessageAvatarProps = ComponentProps<typeof Avatar> & {
  src?: string;
  name?: string;
};

export const MessageAvatar = ({
  src,
  name,
  className,
  children,
  ...props
}: MessageAvatarProps) => (
  <Avatar className={cn('size-8', className)} {...props}>
    {src && <AvatarImage alt='' className='mt-0 mb-0' src={src} />}
    <AvatarFallback>{children || name?.slice(0, 2) || 'ME'}</AvatarFallback>
  </Avatar>
);
