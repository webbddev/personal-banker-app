'use client';

import { useInvestmentStore } from '@/store/financialInvestmentsStore';
import { cn } from '@/lib/utils';

export function PageContentWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { openDialog, openEditDialog } = useInvestmentStore();
  const isBlurry = openDialog || openEditDialog;

  return (
    <div
      className={cn(
        'transition-all duration-300',
        isBlurry ? 'blur-sm pointer-events-none' : '',
      )}
    >
      {children}
    </div>
  );
}
