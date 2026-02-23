'use client';

import { useState } from 'react';
import * as React from 'react';
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
import { exportToExcel, exportToPDF, exportToCSV } from '@/utils/export-utils';
import { FinancialInstrument } from '@/types/investment-schema';
import { CurrencyTotals } from '@/utils/investment-calculations';

interface ExportButtonProps {
  investments: FinancialInstrument[];
  currencyTotals?: CurrencyTotals;
  monthlyReturns?: CurrencyTotals;
  investorName?: string;
  filename?: string;
}

export function ExportButton({
  investments,
  currencyTotals,
  monthlyReturns,
  investorName,
  filename = 'investments-export',
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  // Debug logging
  React.useEffect(() => {
    console.log('ExportButton received investor name:', investorName);
    console.log('Type of investorName:', typeof investorName);
    console.log('Is investorName truthy?', !!investorName);
  }, [investorName]);

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
      exportToExcel(
        investments,
        currencyTotals,
        monthlyReturns,
        investorName,
        filename
      );
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
      console.log('Starting PDF export with investor name:', investorName);
      console.log('Investor name type:', typeof investorName);
      console.log('Investor name value:', JSON.stringify(investorName));

      exportToPDF(
        investments,
        currencyTotals,
        monthlyReturns,
        investorName,
        filename
      );
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
  
  const handleExportCSV = async () => {
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
      exportToCSV(investments, filename);
      toast({
        title: 'Export Successful',
        description: `Exported ${investments.length} investment(s) to CSV.`,
      });
    } catch (error) {
      console.error('CSV export error:', error);
      toast({
        title: 'Export Failed',
        description:
          error instanceof Error ? error.message : 'Failed to export to CSV',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='outline'
          disabled={isExporting}
          className='w-full sm:max-w-full h-10'
        >
          {isExporting ? (
            <>
              <Loader2 className='h-4 w-4 animate-spin mr-2' />
              <span>Exporting...</span>
            </>
          ) : (
            <>
              <Download className='h-4 w-4 mr-2' />
              <span>Export Data</span>
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
        <DropdownMenuItem onClick={handleExportCSV} disabled={isExporting}>
          <FileText className='mr-2 h-4 w-4' />
          <span>Export as CSV</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
