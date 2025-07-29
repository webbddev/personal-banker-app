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
import { useInvestmentStore } from '@/store/financialInvestmentsStore';
import {
  InvestmentType,
} from '@/utils/investment-constants';
import {
  formatAmount,
  SupportedCurrency,
} from '@/utils/currency-formatter';
import React, { use } from 'react';
import { FinancialInstrument } from '@/types/investment-schema';

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
  const { investments, updateInvestment } = useInvestmentStore();

  const investment = investments.find((inv) => inv.id === id);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: investment
      ? {
          organisationName: investment.organisationName,
          investmentAmount: investment.investmentAmount,
          interestRate: investment.interestRate,
          expirationDate: new Date(investment.expirationDate),
          incomeTax: investment.incomeTax,
          currency: investment.currency,
          investmentType: investment.investmentType,
        }
      : undefined,
  });

  if (!investment) {
    return <div>Investment not found</div>;
  }

  const onSubmit = async (values: FormValues) => {
    try {
      const updatedInvestment: FinancialInstrument = {
        ...investment,
        ...values,
        investmentType: values.investmentType as InvestmentType,
        currency: values.currency as SupportedCurrency,
      };

      updateInvestment(id, updatedInvestment);

      const message = `Investment for ${
        values.organisationName
      } has been updated to ${formatAmount(
        values.investmentAmount,
        values.currency as SupportedCurrency
      )} with ${values.interestRate}% annual return`;

      toast({
        title: 'Investment Updated',
        description: message,
      });

      router.push('/investments');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update investment',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className='max-w-3xl mx-auto p-4'>
      <BackButton text='Go Back' link='/investments'/>
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
                  <Input {...field} />
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
                        disabled={(date) => date < new Date()}
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
              className='w-full'
            >
              Cancel
            </Button>
            <Button type='submit' className='w-full'>
              Update Investment
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default FinancialInstrumentEditPage;
