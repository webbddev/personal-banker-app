'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';
import { MoreHorizontal } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { FinancialInstrument } from '@/types/investment-schema';
import {
  investmentTypeOptions,
  INVESTMENT_TYPES,
} from '@/utils/investment-constants';
import {
  calculateMonthlyReturn,
  calculateDaysUntilExpiration,
} from '@/utils/investment-calculations';
import cn from 'classnames';
import { useInvestmentStore } from '@/store/financialInvestmentsStore';
import { formatAmount } from '@/utils/currency-formatter';

// Define the columns of the table
export const columns: ColumnDef<FinancialInstrument>[] = [
  // Organisation Name
  {
    accessorKey: 'organisationName',
    header: ({ column }) => (
      <Button
        variant='ghost'
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Organisation Name
        <ArrowUpDown className='h-4 w-4' />
      </Button>
    ),
    cell: ({ row }) => {
      return (
        <div className='text-left'>{row.getValue('organisationName')}</div>
      );
    },
    sortingFn: 'basic',
  },
  // Investment Type
  {
    accessorKey: 'investmentType',
    header: ({ column }) => (
      <Button
        variant='ghost'
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Investment Type
        <ArrowUpDown className='h-4 w-4' />
      </Button>
    ),
    cell: ({ row }) => {
      const investmentType = row.getValue('investmentType') as string;
      const option = investmentTypeOptions.find(
        (opt) =>
          opt.value === investmentType ||
          opt.value ===
            INVESTMENT_TYPES[investmentType as keyof typeof INVESTMENT_TYPES]
      );
      return (
        <div className='text-center'>{option?.label || investmentType}</div>
      );
    },
  },

  // Related Data
  {
    accessorKey: 'relatedData',
    header: 'Related Data',
    cell: ({ row }) => {
      return (
        <div className='text-center'>
          {row.getValue('relatedData') || 'N/A'}
        </div>
      );
    },
    meta: {
      className: 'hidden sm:table-cell',
    },
  },

  // Investment Amount
  {
    accessorKey: 'investmentAmount',
    header: ({ column }) => (
      <Button
        variant='ghost'
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        <div className='text-center w-full'>Amount</div>
        <ArrowUpDown className='h-4 w-4' />
      </Button>
    ),
    cell: ({ row }) => {
      const investmentAmount = parseFloat(row.getValue('investmentAmount'));
      // const currency = row.getValue('currency') as string;
      // const formatted = new Intl.NumberFormat('en-US', {
      //   style: 'currency',
      //   currency: currency.toUpperCase(),
      // }).format(investmentAmount);
      const formatted = investmentAmount.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }); // Format the number with commas and 2 decimal places

      return <div className='text-center'>{formatted}</div>;
    },
    sortingFn: 'basic',
  },
  // Currency
  {
    accessorKey: 'currency',
    header: ({ column }) => (
      <Button
        variant='ghost'
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Currency
        <ArrowUpDown className='h-4 w-4' />
      </Button>
    ),
    cell: ({ row }) => {
      const currency = row.getValue('currency') as string;
      return <div className='text-center'>{currency.toUpperCase()}</div>;
    },
  },

  // Interest Rate
  {
    accessorKey: 'interestRate',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          <div className='text-center w-full'>Rate of Return (%)</div>
          <ArrowUpDown className='h-4 w-4' />
        </Button>
      );
    },
    cell: ({ row }) => {
      return <div className='text-center'>{row.getValue('interestRate')}</div>;
    },
  },
  // Income Tax
  {
    accessorKey: 'incomeTax',
    header: ({ column }) => (
      <Button
        variant='ghost'
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Income Tax (%)
        <ArrowUpDown className='h-4 w-4' />
      </Button>
    ),
    cell: ({ row }) => {
      return <div className='text-center'>{row.getValue('incomeTax')}</div>;
    },
    sortingFn: 'basic',
  },
  // Monthly Return
  {
    accessorKey: 'monthlyReturn',
    header: ({ column }) => (
      <Button
        variant='ghost'
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Monthly Return
        <ArrowUpDown className='h-4 w-4' />
      </Button>
    ),
    // Windsurf
    // cell: ({ row }) => {
    //   const monthlyReturn = calculateMonthlyReturn(
    //     row.original.investmentAmount,
    //     row.original.interestRate,
    //     row.original.incomeTax
    //   );
    //   return formatAmount(monthlyReturn, row.original.currency);
    // },
    // ChatGPT
    cell: ({ row }) => {
      const { investmentAmount, interestRate, incomeTax, currency } =
        row.original;

      const monthlyReturn = calculateMonthlyReturn(
        investmentAmount,
        interestRate,
        incomeTax
      );

      // Format and display the calculated monthly return
      return (
        <div className='text-center font-medium'>
          {formatAmount(monthlyReturn, currency)}
        </div>
      );
    },
    // Original
    // cell: ({ row }) => {
    //   const investmentAmount = parseFloat(row.getValue('investmentAmount'));
    //   const interestRate = parseFloat(row.getValue('interestRate'));
    //   const currency = row.getValue('currency') as string;

    //   const monthlyReturn = calculateMonthlyReturn(investmentAmount, interestRate);

    //   return (
    //     <div className='text-right font-medium'>
    //       {formatAmount(monthlyReturn, currency)}
    //     </div>
    //   );
    // },
  },

  // Maturity Date
  {
    accessorKey: 'expirationDate',
    header: ({ column }) => (
      <Button
        variant='ghost'
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Maturity Date
        <ArrowUpDown className='h-4 w-4' />
      </Button>
    ),
    cell: ({ row }) => {
      const rawDate = row.getValue('expirationDate') as string | null;
      if (!rawDate) {
        return <div>No date</div>;
      }

      const date = new Date(rawDate);
      if (isNaN(date.getTime())) {
        return <div>Invalid date</div>;
      }

      const daysUntilExpiration = calculateDaysUntilExpiration(date);

      // Define highlight conditions
      const isExpired = daysUntilExpiration <= 0;
      const isNearExpiration =
        daysUntilExpiration <= 30 && daysUntilExpiration > 0;
      const isInGreenRange =
        daysUntilExpiration >= 90 && daysUntilExpiration < 120;

      // Determine the appropriate class for styling
      const highlightClass = cn(
        'text-center font-medium rounded-lg px-2 py-1',
        isExpired &&
          'bg-red-300 dark:bg-red-400 dark:text-red-800 text-red-600',
        isNearExpiration && 'bg-yellow-100 dark:bg-yellow-600 text-yellow-800',
        isInGreenRange && 'bg-green-100 dark:bg-green-600 text-green-800'
      );

      return (
        <div className={highlightClass}>
          {date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </div>
      );
    },
  },

  // Actions (edit and delete)
  {
    id: 'actions',
    cell: ({ row }) => {
      const investment = row.original;
      const { setSelectedInvestment, setOpenDialog } = useInvestmentStore();

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-8 w-8 p-0'>
              <span className='sr-only'>Open menu</span>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(investment.id)}
            >
              Copy instrument ID
            </DropdownMenuItem>
            <Link href={`/investments/edit/${investment.id}`}>
              <DropdownMenuItem asChild>
                <span>Edit Details</span>
              </DropdownMenuItem>
            </Link>
            <DropdownMenuItem
              onClick={() => {
                setSelectedInvestment(investment);
                setOpenDialog(true);
              }}
              className='text-red-600'
            >
              Delete investment
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
