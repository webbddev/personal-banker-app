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

export function DeleteDialog() {
  const {
    openDialog,
    setOpenDialog,
    setSelectedInvestment,
    selectedInvestment,
    deleteInvestment,
  } = useInvestmentStore();

  const { toast } = useToast();

  async function deleteInvestmentFx() {
    if (selectedInvestment) {
      deleteInvestment(selectedInvestment.id);
      // Toast will show after deletion is complete
      toast({
        title: 'Investment Deleted',
        description: `The investment for ${selectedInvestment.organisationName} has been deleted successfully!`,
      });
    }
  }

  return (
    <AlertDialog
      open={openDialog}
      onOpenChange={(open) => {
        setOpenDialog(open);
        if (!open) setSelectedInvestment(null);
      }}
    >
      <AlertDialogContent className='p-8'>
        <AlertDialogHeader>
          <AlertDialogTitle className='text-xl'>
            Are you absolutely sure?
          </AlertDialogTitle>
          <AlertDialogDescription className='mt-2'>
            This action cannot be undone. This will permanently delete the
            investment record.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className='mt-8'>
          <AlertDialogCancel
            onClick={() => {
              setSelectedInvestment(null);
            }}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction onClick={deleteInvestmentFx}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
