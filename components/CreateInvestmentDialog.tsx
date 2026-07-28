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
import { Calendar as CalendarIcon, Loader2, Building2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  formSchema,
  CreateInvestmentFormValues,
} from '@/types/investment-schema';
import { CURRENCY_OPTIONS, formatAmount } from '@/utils/currency-formatter';
import {
  investmentTypeOptions,
  INVESTMENT_TYPES,
  PROPERTY_TYPE_OPTIONS,
} from '@/utils/investment-constants';
import { createInvestment } from '@/app/actions/investmentActions';
import { useState, useEffect, useTransition, useMemo } from 'react';
import { ExpirationStatus } from '@/prisma/generated/prisma/enums';
import { useInvestmentStore } from '@/store/financialInvestmentsStore';
import { calculateMonthlyReturn } from '@/utils/investment-calculations';

export function CreateInvestmentDialog() {
  const { openCreateDialog, setOpenCreateDialog } = useInvestmentStore();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [rateManuallyEdited, setRateManuallyEdited] = useState(false);

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
      monthlyRent: 0,
      propertyType: '',
      tenantName: '',
    },
  });

  // Watch investment type to drive conditional rendering
  const watchedType = form.watch('investmentType');
  const isRealEstate = watchedType === INVESTMENT_TYPES.REAL_ESTATE;

  // Watch financial fields for live preview
  const watchedRent = form.watch('monthlyRent') ?? 0;
  const watchedTax = form.watch('incomeTax') ?? 0;
  const watchedAmount = form.watch('investmentAmount') ?? 0;
  const watchedRate = form.watch('interestRate') ?? 0;
  const watchedCurrency = form.watch('currency') ?? 'MDL';

  // Auto-calculate rental yield when monthlyRent and investmentAmount are both > 0
  useEffect(() => {
    if (
      isRealEstate &&
      !rateManuallyEdited &&
      watchedRent > 0 &&
      watchedAmount > 0
    ) {
      const autoYield =
        Math.round(((watchedRent * 12) / watchedAmount) * 100) / 100;
      form.setValue('interestRate', autoYield);
    }
  }, [isRealEstate, watchedRent, watchedAmount, rateManuallyEdited, form]);

  // Reset rateManuallyEdited flag when switching investment type
  useEffect(() => {
    setRateManuallyEdited(false);
  }, [watchedType]);

  // Live preview calculation
  const livePreview = useMemo(() => {
    if (isRealEstate) {
      if (watchedRent > 0) {
        const net = watchedRent * (1 - watchedTax / 100);
        return {
          label: 'Estimated monthly income after tax',
          value: Math.round(net * 100) / 100,
        };
      }
      return null;
    }
    // Bonds / deposits
    if (watchedAmount > 0 && watchedRate > 0) {
      const monthly = calculateMonthlyReturn(
        watchedAmount,
        watchedRate,
        watchedTax,
      );
      return {
        label: 'Estimated monthly return',
        value: monthly,
      };
    }
    return null;
  }, [isRealEstate, watchedRent, watchedTax, watchedAmount, watchedRate]);

  async function onSubmit(values: CreateInvestmentFormValues) {
    const { organisationName, investmentAmount, interestRate, currency } =
      values;

    startTransition(async () => {
      try {
        const investmentData = {
          ...values,
          organisationName: values.organisationName.trim(),
          expirationStatus: ExpirationStatus.ACTIVE,
          // For real estate, default interestRate to 0 if not set
          interestRate: values.interestRate ?? 0,
          // For real estate, default investmentAmount to 0 if not set
          investmentAmount: values.investmentAmount ?? 0,
        };

        const result = await createInvestment(investmentData);

        if (result.success) {
          if (isRealEstate) {
            const netMonthly =
              (values.monthlyRent ?? 0) * (1 - (values.incomeTax ?? 0) / 100);
            toast({
              title: 'Rental Property Added',
              description: `${organisationName} added. Net monthly income: ${formatAmount(
                Math.round(netMonthly * 100) / 100,
                currency!,
              )} after ${values.incomeTax}% tax`,
            });
          } else {
            toast({
              title: 'Investment Created',
              description: `A new ${organisationName} investment worth ${formatAmount(
                investmentAmount,
                currency!,
              )} has been created with ${interestRate}% annual return`,
            });
          }

          form.reset();
          setRateManuallyEdited(false);
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
          if (!open) {
            form.reset();
            setRateManuallyEdited(false);
          }
        }
      }}
    >
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='text-2xl font-bold'>
            {isRealEstate ? 'Add Rental Property' : 'Create New Investment'}
          </DialogTitle>
          <DialogDescription>
            {isRealEstate
              ? 'Enter your rental property and lease details below.'
              : 'Enter the details of your new investment instrument below.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-6 py-4'
          >
            {/* Organisation Name / Property Name */}
            <FormField
              control={form.control}
              name='organisationName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {isRealEstate
                      ? 'Property Name / Address'
                      : 'Organisation Name'}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={
                        isRealEstate
                          ? 'Garage - 123 Main St, Chisinau'
                          : 'MAIB, HSBC, Ministry of Finance, etc'
                      }
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

              {/* Related Data / Lease ID */}
              <FormField
                control={form.control}
                name='relatedData'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {isRealEstate
                        ? 'Lease / Agreement ID (Optional)'
                        : 'Related Data (Optional)'}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={
                          isRealEstate
                            ? 'Lease #12345'
                            : 'ISIC Nr., Deposit ID'
                        }
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

            {/* Rental Details Section — only visible for real estate */}
            {isRealEstate && (
              <div className='rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30 p-4 space-y-4'>
                <div className='flex items-center gap-2 text-sm font-medium text-muted-foreground'>
                  <Building2 className='h-4 w-4' />
                  <span>Rental Details</span>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  {/* Monthly Rent */}
                  <FormField
                    control={form.control}
                    name='monthlyRent'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monthly Rent</FormLabel>
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
                        <FormDescription>
                          Fixed monthly rental income (ground truth for
                          calculations)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Property Type */}
                  <FormField
                    control={form.control}
                    name='propertyType'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Property Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ''}
                          disabled={isPending}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Select type' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {PROPERTY_TYPE_OPTIONS.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Tenant Name */}
                  <FormField
                    control={form.control}
                    name='tenantName'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tenant Name (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='John Doe'
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
              </div>
            )}

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
                    {isRealEstate && (
                      <FormDescription>
                        Applied directly to your monthly rent
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              {/* Amount / Property Value */}
              <FormField
                control={form.control}
                name='investmentAmount'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {isRealEstate ? 'Property Value' : 'Amount'}
                    </FormLabel>
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
                    <FormDescription>
                      {isRealEstate
                        ? 'Estimated market value (optional, used for yield calc)'
                        : 'Principal invested'}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Interest Rate / Rental Yield */}
              <FormField
                control={form.control}
                name='interestRate'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {isRealEstate ? 'Rental Yield (%)' : 'Rate (%)'}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        step='0.01'
                        placeholder='0.00'
                        {...field}
                        onChange={(e) => {
                          field.onChange(e.target.valueAsNumber || 0);
                          if (isRealEstate) {
                            setRateManuallyEdited(true);
                          }
                        }}
                        value={field.value ?? ''}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormDescription>
                      {isRealEstate
                        ? 'Auto-calculated from rent & value, or enter manually'
                        : 'Annual interest rate'}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Expiration Date / Lease End Date */}
              <FormField
                control={form.control}
                name='expirationDate'
                render={({ field }) => (
                  <FormItem className='flex flex-col justify-end'>
                    <FormLabel className='mb-2'>
                      {isRealEstate ? 'Lease End Date' : 'Maturity Date'}
                    </FormLabel>
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
                          captionLayout='dropdown'
                          startMonth={new Date()}
                          endMonth={new Date(new Date().getFullYear() + 100, 11)}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Live Preview */}
            {livePreview && (
              <div className='rounded-md bg-muted/50 border border-border px-4 py-3 text-sm'>
                <span className='text-muted-foreground'>
                  {livePreview.label}:{' '}
                </span>
                <span className='font-semibold text-foreground'>
                  {formatAmount(livePreview.value, watchedCurrency)}
                </span>
              </div>
            )}

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
                {isPending
                  ? isRealEstate
                    ? 'Adding...'
                    : 'Creating...'
                  : isRealEstate
                    ? 'Add Property'
                    : 'Create Investment'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
