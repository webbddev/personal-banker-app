'use client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useInvestmentStore } from '@/store/financialInvestmentsStore';
import { deleteInvestment } from '@/app/actions/investmentActions';
import { useState } from 'react';

export function DeleteDialog() {
  const {
    openDialog,
    setOpenDialog,
    setSelectedInvestment,
    selectedInvestment,
  } = useInvestmentStore();

  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  async function deleteInvestmentFx() {
    if (!selectedInvestment) return;

    setIsDeleting(true);

    try {
      const result = await deleteInvestment(selectedInvestment.id);

      if (result.success) {
        toast({
          title: 'Investment Deleted',
          description: `The investment for ${selectedInvestment.organisationName} has been deleted successfully!`,
        });

        // Close dialog and clear selected investment
        setOpenDialog(false);
        setSelectedInvestment(null);
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to delete investment',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Delete investment error:', error);
      toast({
        title: 'Error',
        description:
          'An unexpected error occurred while deleting the investment',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <AlertDialog
      open={openDialog}
      onOpenChange={(open) => {
        if (!isDeleting) {
          setOpenDialog(open);
          if (!open) setSelectedInvestment(null);
        }
      }}
    >
      <AlertDialogContent className='p-8'>
        <AlertDialogHeader>
          <AlertDialogTitle className='text-xl'>
            Are you absolutely sure?
          </AlertDialogTitle>
          <AlertDialogDescription className='mt-2'>
            This action cannot be undone. This will permanently delete the
            investment record for{' '}
            <span className='font-semibold'>
              {selectedInvestment?.organisationName}
            </span>
            .
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className='mt-8'>
          <AlertDialogCancel
            onClick={() => {
              setSelectedInvestment(null);
            }}
            disabled={isDeleting}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={deleteInvestmentFx}
            disabled={isDeleting}
            className='bg-red-600 hover:bg-red-700 focus:ring-red-600'
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
