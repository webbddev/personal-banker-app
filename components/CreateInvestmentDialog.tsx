'use client';

import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
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
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  formSchema,
  CreateInvestmentFormValues,
} from '@/types/investment-schema';
import { CURRENCY_OPTIONS, formatAmount } from '@/utils/currency-formatter';
import { investmentTypeOptions } from '@/utils/investment-constants';
import { createInvestment } from '@/app/actions/investmentActions';
import { useState, useTransition } from 'react';
import { ExpirationStatus } from '@/prisma/generated/prisma/enums';
import { useInvestmentStore } from '@/store/financialInvestmentsStore';

export function CreateInvestmentDialog() {
  const { openCreateDialog, setOpenCreateDialog } = useInvestmentStore();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  // Initialize form with react-hook-form and set default values
  const form = useForm<CreateInvestmentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      organisationName: '',
      investmentType: 'bankDeposit',
      relatedData: '',
      currency: 'MDL',
      incomeTax: 0,
      investmentAmount: 0,
      interestRate: 0,
      expirationDate: new Date(),
    },
  });

  async function onSubmit(values: CreateInvestmentFormValues) {
    const { organisationName, investmentAmount, interestRate, currency } =
      values;

    startTransition(async () => {
      try {
        const investmentData = {
          ...values,
          organisationName: values.organisationName.trim(),
          expirationStatus: ExpirationStatus.ACTIVE,
        };

        const result = await createInvestment(investmentData);

        if (result.success) {
          toast({
            title: 'Investment Created',
            description: `A new ${organisationName} investment worth ${formatAmount(
              investmentAmount,
              currency!,
            )} has been created with ${interestRate}% annual return`,
          });

          form.reset();
          setOpenCreateDialog(false);
        } else {
          throw new Error(result.error || 'Failed to create investment');
        }
      } catch (error) {
        console.error('Form submission error', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description:
            error instanceof Error
              ? error.message
              : 'Failed to create investment. Please try again.',
        });
      }
    });
  }

  return (
    <Dialog
      open={openCreateDialog}
      onOpenChange={(open) => {
        if (!isPending) {
          setOpenCreateDialog(open);
          if (!open) form.reset();
        }
      }}
    >
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='text-2xl font-bold'>
            Create New Investment
          </DialogTitle>
          <DialogDescription>
            Enter the details of your new investment instrument below.
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
                      placeholder='MAIB, HSBC, Ministry of Finance, etc'
                      type='text'
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
                      defaultValue={field.value}
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
                        placeholder='ISIC Nr., Deposit ID'
                        type='text'
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
                      defaultValue={field.value}
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
                        placeholder='0.00'
                        {...field}
                        onChange={(e) =>
                          field.onChange(e.target.valueAsNumber || 0)
                        }
                        value={field.value ?? ''}
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
                        placeholder='0.00'
                        {...field}
                        onChange={(e) =>
                          field.onChange(e.target.valueAsNumber || 0)
                        }
                        value={field.value ?? ''}
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
                        placeholder='0.00'
                        {...field}
                        onChange={(e) =>
                          field.onChange(e.target.valueAsNumber || 0)
                        }
                        value={field.value ?? ''}
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
                onClick={() => setOpenCreateDialog(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type='submit' disabled={isPending}>
                {isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                {isPending ? 'Creating...' : 'Create Investment'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
