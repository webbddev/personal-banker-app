'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileSpreadsheet, FileText, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { exportToExcel, exportToPDF } from '@/utils/export-utils';
import { FinancialInstrument } from '@/types/investment-schema';
import { CurrencyTotals } from '@/utils/investment-calculations';

interface ExportButtonProps {
  investments: FinancialInstrument[];
  currencyTotals?: CurrencyTotals;
  monthlyReturns?: CurrencyTotals;
  filename?: string;
}

export function ExportButton({
  investments,
  currencyTotals,
  monthlyReturns,
  filename = 'investments-export',
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleExportExcel = async () => {
    if (investments.length === 0) {
      toast({
        title: 'No data to export',
        description: 'There are no investments to export.',
        variant: 'destructive',
      });
      return;
    }

    setIsExporting(true);
    try {
      exportToExcel(investments, currencyTotals, monthlyReturns, filename);
      toast({
        title: 'Export Successful',
        description: `Exported ${investments.length} investment(s) to Excel.`,
      });
    } catch (error) {
      console.error('Excel export error:', error);
      toast({
        title: 'Export Failed',
        description:
          error instanceof Error ? error.message : 'Failed to export to Excel',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    if (investments.length === 0) {
      toast({
        title: 'No data to export',
        description: 'There are no investments to export.',
        variant: 'destructive',
      });
      return;
    }

    setIsExporting(true);
    try {
      exportToPDF(investments, currencyTotals, monthlyReturns, filename);
      toast({
        title: 'Export Successful',
        description: `Exported ${investments.length} investment(s) to PDF.`,
      });
    } catch (error) {
      console.error('PDF export error:', error);
      toast({
        title: 'Export Failed',
        description:
          error instanceof Error ? error.message : 'Failed to export to PDF',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='outline' disabled={isExporting}>
          {isExporting ? (
            <>
              <Loader2 className='h-4 w-4 animate-spin' />
              Exporting...
            </>
          ) : (
            <>
              <Download className='h-4 w-4' />
              Export Data
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-48'>
        <DropdownMenuLabel>Export Format</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleExportExcel} disabled={isExporting}>
          <FileSpreadsheet className='mr-2 h-4 w-4' />
          <span>Export as Excel</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportPDF} disabled={isExporting}>
          <FileText className='mr-2 h-4 w-4' />
          <span>Export as PDF</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
    