'use client';

import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import {
  formatAmount,
  SupportedCurrencyCode,
  CURRENCY_OPTIONS,
} from '@/utils/currency-formatter';
import { investmentTypeOptions } from '@/utils/investment-constants';
import React, { useTransition, useEffect } from 'react';
import { updateInvestmentAction } from '@/app/actions/investmentActions';
import { useInvestmentStore } from '@/store/financialInvestmentsStore';

const formSchema = z.object({
  organisationName: z
    .string()
    .min(2, { message: 'Organisation Name is required' }),
  investmentType: z.string().min(1, { message: 'Investment Type is required' }),
  relatedData: z.string(),
  currency: z.string().min(1, { message: 'Currency is required' }),
  incomeTax: z
    .number()
    .min(0, { message: 'Income Tax must be 0 or greater' })
    .max(100, { message: 'Income Tax cannot exceed 100%' }),
  investmentAmount: z
    .number()
    .min(0.01, { message: 'Amount must be greater than 0' }),
  interestRate: z
    .number()
    .min(0, { message: 'Interest Rate must be 0 or greater' })
    .max(30, { message: 'Interest Rate cannot exceed 30%' }),
  expirationDate: z.date(),
});

type FormValues = z.infer<typeof formSchema>;

export function EditInvestmentDialog() {
  const {
    openEditDialog,
    setOpenEditDialog,
    selectedInvestment,
    setSelectedInvestment,
  } = useInvestmentStore();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      organisationName: '',
      investmentType: '',
      relatedData: '',
      currency: '',
      incomeTax: 0,
      investmentAmount: 0,
      interestRate: 0,
      expirationDate: new Date(),
    },
  });

  useEffect(() => {
    if (selectedInvestment && openEditDialog) {
      form.reset({
        organisationName: selectedInvestment.organisationName,
        investmentType: selectedInvestment.investmentType,
        relatedData: selectedInvestment.relatedData || '',
        currency: selectedInvestment.currency,
        incomeTax: selectedInvestment.incomeTax,
        investmentAmount: selectedInvestment.investmentAmount,
        interestRate: selectedInvestment.interestRate,
        expirationDate: new Date(selectedInvestment.expirationDate),
      });
    }
  }, [selectedInvestment, openEditDialog, form]);

  const onSubmit = async (values: FormValues) => {
    if (!selectedInvestment) return;

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append('id', selectedInvestment.id);
        formData.append('organisationName', values.organisationName.trim());
        formData.append('investmentType', values.investmentType);
        formData.append('relatedData', values.relatedData);
        formData.append('currency', values.currency);
        formData.append('incomeTax', values.incomeTax.toString());
        formData.append('investmentAmount', values.investmentAmount.toString());
        formData.append('interestRate', values.interestRate.toString());
        formData.append('expirationDate', values.expirationDate.toISOString());

        const result = await updateInvestmentAction(formData);

        if (result.success) {
          const message = `Investment for ${
            values.organisationName
          } has been updated to ${formatAmount(
            values.investmentAmount,
            values.currency as SupportedCurrencyCode,
          )} with ${values.interestRate}% annual return`;

          toast({
            title: 'Investment Updated',
            description: message,
          });

          setOpenEditDialog(false);
          setSelectedInvestment(null);
        } else {
          throw new Error(result.error || 'Update failed');
        }
      } catch (error) {
        toast({
          title: 'Error',
          description:
            error instanceof Error
              ? error.message
              : 'Failed to update investment',
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <Dialog
      open={openEditDialog}
      onOpenChange={(open) => {
        if (!isPending) {
          setOpenEditDialog(open);
          if (!open) setSelectedInvestment(null);
        }
      }}
    >
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='text-2xl font-bold'>
            Edit Investment
          </DialogTitle>
          <DialogDescription>
            Make changes to your investment details here. Click save when you're
            done.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-6 py-4'
          >
            {/* Organisation Name */}
            <FormField
              control={form.control}
              name='organisationName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organisation Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='e.g. MAIB, HSBC'
                      {...field}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {/* Investment Type */}
              <FormField
                control={form.control}
                name='investmentType'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Investment Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isPending}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select type' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {investmentTypeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Related Data */}
              <FormField
                control={form.control}
                name='relatedData'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Related Data (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='ISIC, Deposit ID...'
                        {...field}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {/* Currency */}
              <FormField
                control={form.control}
                name='currency'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isPending}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select currency' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CURRENCY_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.label}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Income Tax */}
              <FormField
                control={form.control}
                name='incomeTax'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Income Tax (%)</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        step='0.01'
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              {/* Amount */}
              <FormField
                control={form.control}
                name='investmentAmount'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        step='0.01'
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Interest Rate */}
              <FormField
                control={form.control}
                name='interestRate'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rate (%)</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        step='0.01'
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Expiration Date */}
              <FormField
                control={form.control}
                name='expirationDate'
                render={({ field }) => (
                  <FormItem className='flex flex-col justify-end'>
                    <FormLabel className='mb-2'>Maturity Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant='outline'
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground',
                            )}
                            disabled={isPending}
                          >
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className='w-auto p-0' align='start'>
                        <Calendar
                          mode='single'
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date() || isPending}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='flex justify-end gap-3 pt-4 border-t'>
              <Button
                type='button'
                variant='outline'
                onClick={() => setOpenEditDialog(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type='submit' disabled={isPending}>
                {isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                {isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
