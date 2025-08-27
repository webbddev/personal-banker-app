'use client';

import BackButton from '@/components/BackButton';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import {
  formatAmount,
  SupportedCurrencyCode,
} from '@/utils/currency-formatter';
import React, { useTransition, useEffect, useState, use } from 'react';
import { FinancialInstrument } from '@/types/investment-schema';
import {
  updateInvestmentAction,
  getInvestmentById,
} from '@/app/actions/investmentActions';

const formSchema = z.object({
  organisationName: z
    .string()
    .min(2, { message: 'Organisation Name is required' }),
  investmentAmount: z
    .number()
    .min(0.01, { message: 'Amount must be greater than 0' }),
  interestRate: z
    .number()
    .min(0, { message: 'Interest Rate must be 0 or greater' })
    .max(30, { message: 'Interest Rate cannot exceed 30%' }),
  expirationDate: z
    .date()
    .refine(
      (date) => date > new Date(),
      'Expiration date must be in the future'
    ),
  incomeTax: z
    .number()
    .min(0, { message: 'Income Tax must be 0 or greater' })
    .max(100, { message: 'Income Tax cannot exceed 100%' }),
  currency: z.string().min(1, { message: 'Currency is required' }),
  investmentType: z.string().min(1, { message: 'Investment Type is required' }),
});

type FormValues = z.infer<typeof formSchema>;

const FinancialInstrumentEditPage = ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = use(params);
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [investment, setInvestment] = useState<FinancialInstrument | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    const loadInvestment = async () => {
      setIsLoading(true);
      try {
        const foundInvestment = await getInvestmentById(id);
        if (foundInvestment) {
          setInvestment(foundInvestment);
          form.reset({
            organisationName: foundInvestment.organisationName,
            investmentAmount: foundInvestment.investmentAmount,
            interestRate: foundInvestment.interestRate,
            expirationDate: new Date(foundInvestment.expirationDate),
            incomeTax: foundInvestment.incomeTax,
            currency: foundInvestment.currency,
            investmentType: foundInvestment.investmentType,
          });
        }
      } catch (error) {
        console.error('Failed to load investment:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInvestment();
  }, [id, form]);

  if (isLoading) {
    return (
      <div className='max-w-3xl mx-auto p-4'>
        <div className='flex items-center justify-center h-32'>
          <div className='text-lg'>Loading investment details...</div>
        </div>
      </div>
    );
  }

  if (!investment) {
    return (
      <div className='max-w-3xl mx-auto p-4'>
        <BackButton text='Go Back' link='/investments' />
        <div className='flex items-center justify-center h-32'>
          <div className='text-lg text-red-600'>Investment not found</div>
        </div>
      </div>
    );
  }

  const onSubmit = async (values: FormValues) => {
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append('id', investment.id);
        formData.append('organisationName', values.organisationName);
        formData.append('investmentAmount', values.investmentAmount.toString());
        formData.append('interestRate', values.interestRate.toString());
        formData.append('incomeTax', values.incomeTax.toString());
        formData.append('expirationDate', values.expirationDate.toISOString());
        formData.append('currency', values.currency);
        formData.append('investmentType', values.investmentType);

        const result = await updateInvestmentAction(formData);

        if (result.success) {
          const message = `Investment for ${
            values.organisationName
          } has been updated to ${formatAmount(
            values.investmentAmount,
            values.currency as SupportedCurrencyCode
          )} with ${values.interestRate}% annual return`;

          toast({
            title: 'Investment Updated',
            description: message,
          });

          router.push('/investments');
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
    <div className='max-w-3xl mx-auto p-4'>
      <BackButton text='Go Back' link='/investments' />
      <h1 className='text-2xl font-bold mt-6 mb-6'>Edit Investment</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
          <FormField
            control={form.control}
            name='organisationName'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Organisation Name</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <FormField
              control={form.control}
              name='investmentAmount'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Investment Amount</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      {...field}
                      disabled={isPending}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='interestRate'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rate of Return (%)</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      step='0.01'
                      {...field}
                      disabled={isPending}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
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
                      disabled={isPending}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='expirationDate'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expiration Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant='outline'
                          disabled={isPending}
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
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

          <div className='flex gap-4'>
            <Button
              type='button'
              variant='outline'
              onClick={() => router.back()}
              disabled={isPending}
              className='w-full'
            >
              Cancel
            </Button>
            <Button type='submit' disabled={isPending} className='w-full'>
              {isPending ? 'Updating...' : 'Update Investment'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default FinancialInstrumentEditPage;
