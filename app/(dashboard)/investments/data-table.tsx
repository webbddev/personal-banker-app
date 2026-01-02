'use client';

import * as React from 'react';
import {
  ColumnDef,
  SortingState,
  VisibilityState,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SlidersHorizontal, Plus } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { FinancialInstrument } from '@/types/investment-schema';
import Link from 'next/link';
import { ExportButton } from '@/components/ExportButton';
import { CurrencyTotals } from '@/utils/investment-calculations';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  currencyTotals?: CurrencyTotals;
  monthlyReturns?: CurrencyTotals;
  investorName?: string;
}

export function InvestmentsTable<TData, TValue>({
  columns,
  data,
  currencyTotals,
  monthlyReturns,
  investorName,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
    initialState: {
      pagination: {
        pageSize: 5,
        pageIndex: 0,
      },
    },
    manualPagination: false,
  });

  const filteredInvestments = table
    .getFilteredRowModel()
    .rows.map((row) => row.original) as FinancialInstrument[];

  return (
    /* min-w-0 is critical on flex children to prevent them from pushing parents beyond 100% width */
    <div className='space-y-4 w-full max-w-full overflow-hidden min-w-0'>
      {/* Header Row: Responsive Layout */}
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 w-full min-w-0'>
        {/* Left: Search & Columns */}
        <div className='flex items-center space-x-2 w-full md:flex-1 md:max-w-md min-w-0'>
          <Input
            placeholder='Filter organisations...'
            value={
              (table
                .getColumn('organisationName')
                ?.getFilterValue() as string) ?? ''
            }
            onChange={(event) =>
              table
                .getColumn('organisationName')
                ?.setFilterValue(event.target.value)
            }
            className='w-full h-10'
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline' className='shrink-0 h-10 px-3 md:px-4'>
                <SlidersHorizontal className='h-4 w-4 md:mr-2' />
                <span className='hidden md:inline'>Columns</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className='capitalize'
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id.replace(/([A-Z])/g, ' $1').trim()}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Right: Export & Create Button */}
        <div className='flex items-center space-x-2 w-full md:w-auto shrink-0 min-w-0'>
          <div className='flex-1 md:flex-none'>
            <ExportButton
              investments={filteredInvestments}
              currencyTotals={currencyTotals}
              monthlyReturns={monthlyReturns}
              investorName={investorName}
              filename='investments-export'
            />
          </div>
          <Link
            href={'/create-financial-instrument'}
            className='flex-1 md:flex-none'
          >
            <Button className='w-full h-10'>
              <Plus className='mr-2 h-4 w-4' />
              <span className='whitespace-nowrap'>
                Create <span className='hidden sm:inline'>Investment</span>
              </span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Table Section: Isolated scroll */}
      <div className='rounded-md border bg-card overflow-hidden w-full'>
        <div className='overflow-x-auto w-full'>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className='whitespace-nowrap'>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className='whitespace-nowrap'>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className='h-24 text-center'
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}
