// 'use client';

// import * as z from 'zod';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { useForm } from 'react-hook-form';
// import { cn } from '@/lib/utils';
// import { Button } from '@/components/ui/button';
// import {
//   Form,
//   FormControl,
//   FormDescription,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from '@/components/ui/form';
// import { Input } from '@/components/ui/input';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';
// import { format } from 'date-fns';
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from '@/components/ui/popover';
// import { Calendar } from '@/components/ui/calendar';
// import { Calendar as CalendarIcon } from 'lucide-react';
// import { useToast } from '@/hooks/use-toast';
// import {
//   formSchema,
//   CreateInvestmentFormValues,
//   FinancialInstrument,
// } from '@/types/investment-schema';
// import {
//   CURRENCY_OPTIONS,
//   formatAmount,
//   SupportedCurrencyCode,
// } from '@/utils/currency-formatter';
// import {
//   investmentTypeOptions,
//   InvestmentType,
// } from '@/utils/investment-constants';
// import { calculateDaysUntilExpiration } from '@/utils/investment-calculations';
// import { useInvestmentStore } from '@/store/financialInvestmentsStore';
// import { useRouter } from 'next/navigation';
// import BackButton from './BackButton';
// import { ExpirationStatus } from '@/lib/generated/prisma';

// const generateTempId = () => `temp_${Date.now()}_${Math.random().toString(36)}`;

// export default function CreateInvestmentForm() {
//   const { toast } = useToast();
//   const router = useRouter();

//   const addInvestment = useInvestmentStore((state) => state.addInvestment);

//   // Initialize form with react-hook-form and set default values
//   const form = useForm<z.infer<typeof formSchema>>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       expirationDate: new Date(),
//       investmentAmount: '',
//       interestRate: '',
//       incomeTax: '',
//       organisationName: '',
//       relatedData: '',
//       currency: undefined,
//       investmentType: undefined,
//     },
//   });

//   function onSubmit(values: CreateInvestmentFormValues) {
//     try {
//       // Console log each field with its type
//       // console.log('Form Submission Data Types:');
//       // Object.entries(values).forEach(([key, value]) => {
//       //   console.log(`${key}: ${typeof value} = ${JSON.stringify(value)}`);
//       // });

//       const investmentAmount = parseFloat(values.investmentAmount);
//       const interestRate = parseFloat(values.interestRate);
//       const incomeTax = parseFloat(values.incomeTax);

//       const expirationStatus = (() => {
//         const daysUntilExpiration = calculateDaysUntilExpiration(
//           values.expirationDate
//         );
//         if (daysUntilExpiration <= 0) return ExpirationStatus.EXPIRED;
//         if (daysUntilExpiration <= 30)
//           return ExpirationStatus.EXPIRING_IN_A_MONTH;
//         return ExpirationStatus.EXPIRING_LESS_THAN_3_MONTHS;
//       })();

//       // Create new investment object
//       const newInvestment: FinancialInstrument = {
//         id: generateTempId(),
//         organisationName: values.organisationName,
//         relatedData: values.relatedData || '',
//         investmentType: values.investmentType as InvestmentType,
//         currency: values.currency as SupportedCurrencyCode,
//         investmentAmount: investmentAmount,
//         interestRate: interestRate,
//         expirationDate: values.expirationDate,
//         expirationStatus,
//         incomeTax: incomeTax,
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       };

//       // Add the new investment to the context
//       addInvestment(newInvestment);

//       if (!values.currency) {
//         throw new Error('Currency is required');
//       }
//       const message = `A new investment worth ${formatAmount(
//         investmentAmount,
//         values.currency
//       )} has been created with ${interestRate}% annual return`;

//       toast({
//         title: 'Investment Created',
//         description: message,
//         variant: 'default',
//       });

//       // Reset form after successful submission
//       form.reset();

//       router.push('/investments');
//     } catch (error) {
//       console.error('Form submission error', error);
//       toast({
//         variant: 'destructive',
//         title: 'Error',
//         description: 'Failed to submit the form. Please try again.',
//       });
//     }
//   }

//   return (
//     <div className='max-w-3xl mx-auto p-4'>
//       <BackButton text='Go Back' link='/investments' />
//       <h1 className='text-2xl font-bold mt-6 mb-6'>Create Investment</h1>

//       <Form {...form}>
//         <form
//           // action={''}
//           onSubmit={form.handleSubmit(onSubmit)}
//           className='space-y-8 max-w-3xl mx-auto'
//         >
//           <FormField
//             control={form.control}
//             name='organisationName'
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Organisation Name</FormLabel>
//                 <FormControl>
//                   <Input
//                     placeholder='MAIB, HSBC, Ministry of Finance, etc'
//                     type='text'
//                     {...field}
//                   />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />

//           <FormField
//             control={form.control}
//             name='investmentType'
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Type of Investment Instrument</FormLabel>
//                 <Select
//                   onValueChange={field.onChange}
//                   defaultValue={field.value}
//                 >
//                   <FormControl>
//                     <SelectTrigger>
//                       <SelectValue placeholder='Select your instrument' />
//                     </SelectTrigger>
//                   </FormControl>
//                   <SelectContent>
//                     {investmentTypeOptions.map((option) => (
//                       <SelectItem key={option.value} value={option.value}>
//                         {option.label}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />

//           <FormField
//             control={form.control}
//             name='relatedData'
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>Related Data</FormLabel>
//                 <FormControl>
//                   <Input
//                     placeholder='ISIC Nr., Deposit ID'
//                     type='text'
//                     {...field}
//                   />
//                 </FormControl>
//                 <FormDescription>
//                   Enter specific details if you have any
//                 </FormDescription>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />

//           <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
//             {/* Investment Currency */}
//             <FormField
//               control={form.control}
//               name='currency'
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Investment Currency</FormLabel>
//                   <Select
//                     onValueChange={field.onChange}
//                     defaultValue={field.value}
//                   >
//                     <FormControl>
//                       <SelectTrigger className='max-w-full'>
//                         <SelectValue placeholder='Select currency' />
//                       </SelectTrigger>
//                     </FormControl>
//                     <SelectContent>
//                       {CURRENCY_OPTIONS.map((option) => (
//                         <SelectItem key={option.value} value={option.label}>
//                           {option.label}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             {/* Income Tax */}
//             <FormField
//               control={form.control}
//               name='incomeTax'
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Income Tax (%)</FormLabel>
//                   <FormControl>
//                     <Input
//                       type='number'
//                       placeholder='Enter income tax percentage'
//                       {...field}
//                       min='0'
//                       max='50'
//                       step='0.01'
//                     />
//                   </FormControl>
//                   <FormDescription>
//                     Enter the income tax rate as a percentage (0-50)
//                   </FormDescription>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//           </div>

//           {/* Investment Amount, Interest Rate, Maturity Date */}
//           <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
//             {/* Investment Amount */}
//             <FormField
//               control={form.control}
//               name='investmentAmount'
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Investment Amount</FormLabel>
//                   <FormControl>
//                     <Input
//                       placeholder='e.g. 100000 MDL'
//                       type='text'
//                       {...field}
//                       // onChange={(e) => field.onChange(Number(e.target.value))}
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             {/* Interest Rate */}
//             <FormField
//               control={form.control}
//               name='interestRate'
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Rate of Return</FormLabel>
//                   <FormControl>
//                     <Input
//                       placeholder='e.g. 5% annual return'
//                       type='text'
//                       {...field}
//                       // onChange={(e) => field.onChange(Number(e.target.value))}
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <FormField
//               control={form.control}
//               name='expirationDate'
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Instrument Maturity Date</FormLabel>
//                   <Popover>
//                     <PopoverTrigger asChild>
//                       <FormControl>
//                         <Button
//                           variant={'outline'}
//                           className={cn(
//                             'w-full pl-3 text-left font-normal',
//                             !field.value && 'text-muted-foreground'
//                           )}
//                         >
//                           {field.value ? (
//                             format(field.value, 'PPP')
//                           ) : (
//                             <span>Pick a date</span>
//                           )}
//                           <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
//                         </Button>
//                       </FormControl>
//                     </PopoverTrigger>
//                     <PopoverContent className='w-auto p-0' align='start'>
//                       <Calendar
//                         mode='single'
//                         selected={field.value}
//                         onSelect={field.onChange}
//                         initialFocus
//                       />
//                     </PopoverContent>
//                   </Popover>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//           </div>

//           <div className='flex gap-4'>
//             <Button
//               type='button'
//               variant='outline'
//               onClick={() => router.back()}
//               className='w-full'
//             >
//               Cancel
//             </Button>
//             <Button type='submit' className='w-full'>
//               Create New Investment
//             </Button>
//           </div>
//         </form>
//       </Form>
//     </div>
//   );
// }

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
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  formSchema,
  CreateInvestmentFormValues,
} from '@/types/investment-schema';
import { CURRENCY_OPTIONS, formatAmount } from '@/utils/currency-formatter';
import { investmentTypeOptions } from '@/utils/investment-constants';
import { calculateDaysUntilExpiration } from '@/utils/investment-calculations';
import { useRouter } from 'next/navigation';
import BackButton from './BackButton';
import { ExpirationStatus } from '@/lib/generated/prisma';
import { createInvestment } from '@/app/actions/investmentActions';
import { useState } from 'react';

export default function CreateInvestmentForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with react-hook-form and set default values
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      expirationDate: new Date(),
      investmentAmount: '',
      interestRate: '',
      incomeTax: '',
      organisationName: '',
      relatedData: '',
      currency: undefined,
      investmentType: undefined,
    },
  });

  async function onSubmit(values: CreateInvestmentFormValues) {
    setIsSubmitting(true);

    try {
      const investmentAmount = parseFloat(values.investmentAmount);
      const interestRate = parseFloat(values.interestRate);
      const incomeTax = parseFloat(values.incomeTax);

      // Calculate expiration status
      const expirationStatus = (() => {
        const daysUntilExpiration = calculateDaysUntilExpiration(
          values.expirationDate
        );
        if (daysUntilExpiration <= 0) return ExpirationStatus.EXPIRED;
        if (daysUntilExpiration <= 30)
          return ExpirationStatus.EXPIRING_IN_A_MONTH;
        return ExpirationStatus.EXPIRING_LESS_THAN_3_MONTHS;
      })();

      // Prepare data for database
      const investmentData = {
        organisationName: values.organisationName.trim(),
        relatedData: values.relatedData || '',
        investmentType: values.investmentType,
        currency: values.currency,
        investmentAmount: investmentAmount,
        interestRate: interestRate,
        incomeTax: incomeTax,
        expirationDate: values.expirationDate,
        expirationStatus: expirationStatus,
      };

      // Call server action to create investment
      const result = await createInvestment(investmentData);

      if (result.success) {
        toast({
          title: 'Investment Created',
          description: `A new investment worth ${formatAmount(
            investmentAmount,
            values.currency!
          )} has been created with ${interestRate}% annual return`,
          variant: 'default',
        });

        // Reset form after successful submission
        form.reset();

        // Redirect to investments page
        router.push('/investments');
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
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className='max-w-3xl mx-auto p-4'>
      <BackButton text='Go Back' link='/investments' />
      <h1 className='text-2xl font-bold mt-6 mb-6'>Create Investment</h1>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='space-y-8 max-w-3xl mx-auto'
        >
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
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='investmentType'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type of Investment Instrument</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select your instrument' />
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

          <FormField
            control={form.control}
            name='relatedData'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Related Data</FormLabel>
                <FormControl>
                  <Input
                    placeholder='ISIC Nr., Deposit ID'
                    type='text'
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormDescription>
                  Enter specific details if you have any
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* Investment Currency */}
            <FormField
              control={form.control}
              name='currency'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Investment Currency</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger className='max-w-full'>
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
                      placeholder='Enter income tax percentage'
                      {...field}
                      min='0'
                      max='50'
                      step='0.01'
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter the income tax rate as a percentage (0-50)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Investment Amount, Interest Rate, Maturity Date */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {/* Investment Amount */}
            <FormField
              control={form.control}
              name='investmentAmount'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Investment Amount</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='e.g. 100000'
                      type='number'
                      step='0.01'
                      {...field}
                      disabled={isSubmitting}
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
                  <FormLabel>Rate of Return (%)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='e.g. 5'
                      type='number'
                      step='0.01'
                      {...field}
                      disabled={isSubmitting}
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
                  <FormLabel>Instrument Maturity Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                          disabled={isSubmitting}
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
                        initialFocus
                        disabled={isSubmitting}
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
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type='submit' className='w-full' disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create New Investment'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
