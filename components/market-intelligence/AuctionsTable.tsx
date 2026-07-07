'use client';

import * as React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Landmark, CalendarDays, TrendingUp, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ─────────────────────────────────────────────────────────────
type BondAuction = {
  id: string;
  title: string;
  auctionDate: string;
  gsType: string;
  maturity: string;
  interestRate: number | null;
  createdAt: string;
};

// ─── Column Definitions ────────────────────────────────────────────────
const columns: ColumnDef<BondAuction>[] = [
  {
    accessorKey: 'title',
    header: 'Title',
    cell: ({ row }) => (
      <span className='text-sky-400/90 font-medium text-xs sm:text-sm leading-tight block max-w-[280px] truncate'>
        {row.original.title}
      </span>
    ),
  },
  {
    accessorKey: 'auctionDate',
    header: 'Auction Date',
    cell: ({ row }) => {
      const date = new Date(row.original.auctionDate);
      return (
        <div className='flex items-center gap-2 text-muted-foreground'>
          <CalendarDays className='h-3.5 w-3.5 flex-shrink-0 opacity-50' />
          <span className='text-xs sm:text-sm font-mono whitespace-nowrap'>
            {date.toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'gsType',
    header: 'Type of GS',
    cell: ({ row }) => {
      const gsType = row.original.gsType;
      const isBill = gsType.toLowerCase().includes('bill');
      return (
        <span
          title={gsType}
          className={cn(
            'inline-block px-2.5 py-1 rounded-md text-[10px] sm:text-xs font-bold uppercase tracking-wider truncate max-w-[140px] align-middle',
            isBill
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
          )}
        >
          {gsType}
        </span>
      );
    },
  },
  {
    accessorKey: 'maturity',
    header: 'Maturity',
    cell: ({ row }) => (
      <span className='text-xs sm:text-sm text-muted-foreground font-mono'>
        {row.original.maturity}
      </span>
    ),
  },
  {
    accessorKey: 'interestRate',
    header: 'Interest Rate',
    cell: ({ row }) => {
      const rate = row.original.interestRate;
      if (rate === null || rate === undefined) {
        return (
          <span className='text-xs text-muted-foreground/40 italic'>—</span>
        );
      }
      return (
        <div className='flex items-center gap-1.5'>
          <TrendingUp className='h-3.5 w-3.5 text-emerald-400 flex-shrink-0' />
          <span className='text-sm font-mono font-bold text-emerald-400'>
            {rate.toFixed(2)}%
          </span>
        </div>
      );
    },
  },
];

// ─── Skeleton Loader ───────────────────────────────────────────────────
function TableSkeleton() {
  return (
    <div className='space-y-3'>
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className='flex items-center gap-4 px-4 py-3 animate-pulse'
        >
          <div className='h-4 w-[200px] bg-slate-800/60 rounded' />
          <div className='h-4 w-[100px] bg-slate-800/60 rounded' />
          <div className='h-4 w-[120px] bg-slate-800/60 rounded' />
          <div className='h-4 w-[60px] bg-slate-800/60 rounded' />
          <div className='h-4 w-[80px] bg-slate-800/60 rounded' />
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────
export function AuctionsTable() {
  const [data, setData] = React.useState<BondAuction[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchAuctions() {
      try {
        const res = await fetch('/api/market-intelligence/auctions');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        setLoading(false);
      }
    }
    fetchAuctions();
  }, []);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Card className='flex flex-col h-full'>
      <CardHeader>
        <CardTitle className='flex items-center gap-3 text-xl sm:text-2xl font-black tracking-tight'>
          <div className='p-2 bg-sky-500/10 rounded-lg'>
            <Landmark className='h-6 w-6 text-sky-400' />
          </div>
          GS Auction Results
        </CardTitle>
        <CardDescription className='text-sm sm:text-base font-medium text-muted-foreground'>
          Latest State Securities (VMS) auctions from the Ministry of Finance
        </CardDescription>
      </CardHeader>

      <CardContent className='flex-1'>
        <div className='rounded-md border overflow-hidden'>
          {loading ? (
            <div className='h-[400px] flex flex-col items-center justify-center gap-4'>
              <Loader2 className='h-8 w-8 animate-spin text-sky-500' />
              <p className='text-sm text-muted-foreground font-medium'>
                Loading auction data...
              </p>
            </div>
          ) : error ? (
            <div className='h-[400px] flex flex-col items-center justify-center gap-2 text-center px-4'>
              <AlertCircle className='h-8 w-8 text-destructive/80 mb-2' />
              <p className='text-sm text-destructive font-bold uppercase tracking-wider'>
                Failed to load auctions
              </p>
              <p className='text-xs text-muted-foreground font-medium'>
                {error}
              </p>
            </div>
          ) : data.length === 0 ? (
            <div className='h-[400px] flex flex-col items-center justify-center gap-2 text-center px-4'>
              <p className='text-sm text-muted-foreground font-bold uppercase tracking-wider'>
                No auctions available
              </p>
              <p className='text-xs text-muted-foreground/60'>
                Data will populate after the next sync cycle.
              </p>
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <Table className='w-full min-w-[700px]'>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow
                      key={headerGroup.id}
                      className='border-b hover:bg-transparent'
                    >
                      {headerGroup.headers.map((header) => (
                        <TableHead
                          key={header.id}
                          className='text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground/70 py-3 px-4 first:pl-6 last:pr-6'
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      className='border-b hover:bg-muted/5 transition-colors duration-200'
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className='py-3 px-4 first:pl-6 last:pr-6'
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </CardContent>

      {/* ─── Footer ─── */}
      {!loading && !error && data.length > 0 && (
        <CardFooter className='flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/40 pt-6 mt-auto'>
          <div className='flex items-center gap-2'>
            <div className='h-1.5 w-1.5 rounded-full bg-sky-400 animate-ping' />
            <p className='text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-wider'>
              Showing {data.length} most recent auctions
            </p>
          </div>
          <p className='text-[10px] text-muted-foreground font-medium'>
            Source: mf.gov.md
          </p>
        </CardFooter>
      )}
    </Card>
  );
}
