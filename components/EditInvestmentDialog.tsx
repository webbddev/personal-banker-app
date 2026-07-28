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
import { CalendarIcon, Loader2, Building2 } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import {
  formatAmount,
  SupportedCurrencyCode,
  CURRENCY_OPTIONS,
} from '@/utils/currency-formatter';
import { investmentTypeOptions, INVESTMENT_TYPES, PROPERTY_TYPE_OPTIONS } from '@/utils/investment-constants';
import { formSchema, CreateInvestmentFormValues as FormValues } from '@/types/investment-schema';
import React, { useTransition, useEffect } from 'react';
import { updateInvestmentAction } from '@/app/actions/investmentActions';
import { useInvestmentStore } from '@/store/financialInvestmentsStore';



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

  useEffect(() => {
    if (selectedInvestment && openEditDialog) {
      form.reset({
        organisationName: selectedInvestment.organisationName,
        investmentType: selectedInvestment.investmentType as FormValues['investmentType'],
        relatedData: selectedInvestment.relatedData || '',
        currency: selectedInvestment.currency as FormValues['currency'],
        incomeTax: selectedInvestment.incomeTax,
        investmentAmount: selectedInvestment.investmentAmount,
        interestRate: selectedInvestment.interestRate,
        expirationDate: new Date(selectedInvestment.expirationDate),
        monthlyRent: selectedInvestment.monthlyRent || 0,
        propertyType: selectedInvestment.propertyType || '',
        tenantName: selectedInvestment.tenantName || '',
      });
    }
  }, [selectedInvestment, openEditDialog, form]);

  const isRealEstate = form.watch('investmentType') === INVESTMENT_TYPES.REAL_ESTATE;

  const onSubmit = async (values: FormValues) => {
    if (!selectedInvestment) return;

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append('id', selectedInvestment.id);
        formData.append('organisationName', values.organisationName.trim());
        formData.append('investmentType', values.investmentType);
        formData.append('relatedData', values.relatedData || '');
        formData.append('currency', values.currency);
        formData.append('incomeTax', values.incomeTax.toString());
        formData.append('investmentAmount', values.investmentAmount.toString());
        formData.append('interestRate', values.interestRate.toString());
        formData.append('expirationDate', values.expirationDate.toISOString());
        if (values.monthlyRent !== undefined) formData.append('monthlyRent', values.monthlyRent.toString());
        if (values.propertyType) formData.append('propertyType', values.propertyType);
        if (values.tenantName) formData.append('tenantName', values.tenantName);

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
                  <FormLabel>{isRealEstate ? 'Property Name / Address' : 'Organisation Name'}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={isRealEstate ? 'Garage - 123 Main St, Chisinau' : 'e.g. MAIB, HSBC'}
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
                    <FormLabel>{isRealEstate ? 'Lease / Agreement ID (Optional)' : 'Related Data (Optional)'}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={isRealEstate ? 'Lease #12345' : 'ISIC, Deposit ID...'}
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
                    <FormLabel>{isRealEstate ? 'Property Value' : 'Amount'}</FormLabel>
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
                    <FormLabel>{isRealEstate ? 'Rental Yield (%)' : 'Rate (%)'}</FormLabel>
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
                    <FormLabel className='mb-2'>{isRealEstate ? 'Lease End Date' : 'Maturity Date'}</FormLabel>
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
                          startMonth={new Date(new Date().getFullYear() - 5, 0)}
                          endMonth={new Date(new Date().getFullYear() + 100, 11)}
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
