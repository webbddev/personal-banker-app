'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSidebar } from './ui/sidebar';

interface SidebarLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export function SidebarLink({ href, children, className }: SidebarLinkProps) {
  const { setOpenMobile, isMobile } = useSidebar();
  const router = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isMobile) {
      e.preventDefault();
      setOpenMobile(false);
      router.push(href);
    }
  };

  return (
    <Link href={href} onClick={handleClick} className={className}>
      {children}
    </Link>
  );
}
