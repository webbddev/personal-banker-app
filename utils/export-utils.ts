import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FinancialInstrument } from '@/types/investment-schema';
import { CurrencyTotals } from '@/utils/investment-calculations';
import { formatAmount } from '@/utils/currency-formatter';
import { investmentTypeOptions } from '@/utils/investment-constants';

/**
 * Formats a date to a readable string
 */
function formatDate(date: Date | string | null): string {
  if (!date) return 'N/A';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return 'Invalid Date';

  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Gets the display label for investment type
 */
function getInvestmentTypeLabel(type: string): string {
  const option = investmentTypeOptions.find((opt) => opt.value === type);
  return option?.label || type;
}

/**
 * Calculates days until expiration
 */
function calculateDaysUntilExpiration(expirationDate: Date | string): number {
  const expDate =
    typeof expirationDate === 'string'
      ? new Date(expirationDate)
      : expirationDate;
  const today = new Date();
  const diffTime = expDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Calculates monthly return for an investment
 */
function calculateMonthlyReturn(
  amount: number,
  rate: number,
  tax: number
): number {
  const annualReturn = amount * (rate / 100);
  const afterTaxReturn = annualReturn * (1 - tax / 100);
  return afterTaxReturn / 12;
}

/**
 * Formats investment data for export
 */
function formatInvestmentForExport(investment: FinancialInstrument) {
  const monthlyReturn = calculateMonthlyReturn(
    investment.investmentAmount,
    investment.interestRate,
    investment.incomeTax
  );

  const daysUntilExpiration = calculateDaysUntilExpiration(
    investment.expirationDate
  );

  return {
    'Organisation Name': investment.organisationName,
    'Investment Type': getInvestmentTypeLabel(investment.investmentType),
    'Related Data': investment.relatedData || 'N/A',
    Currency: investment.currency.toUpperCase(),
    'Investment Amount': investment.investmentAmount,
    'Rate of Return (%)': investment.interestRate,
    'Income Tax (%)': investment.incomeTax,
    'Monthly Return': monthlyReturn,
    'Maturity Date': formatDate(investment.expirationDate),
    'Days Until Maturity': daysUntilExpiration,
    'Created Date': formatDate(investment.createdAt),
  };
}

/**
 * Exports investments to Excel format
 */
export function exportToExcel(
  investments: FinancialInstrument[],
  currencyTotals?: CurrencyTotals,
  monthlyReturns?: CurrencyTotals,
  filename: string = 'investments-export'
): void {
  try {
    // Format investment data
    const formattedData = investments.map(formatInvestmentForExport);

    // Create workbook
    const wb = XLSX.utils.book_new();

    // Create main investments sheet
    const ws = XLSX.utils.json_to_sheet(formattedData);

    // Set column widths for better readability
    const columnWidths = [
      { wch: 25 }, // Organisation Name
      { wch: 20 }, // Investment Type
      { wch: 20 }, // Related Data
      { wch: 10 }, // Currency
      { wch: 18 }, // Investment Amount
      { wch: 18 }, // Rate of Return
      { wch: 15 }, // Income Tax
      { wch: 18 }, // Monthly Return
      { wch: 18 }, // Maturity Date
      { wch: 20 }, // Days Until Maturity
      { wch: 18 }, // Created Date
    ];
    ws['!cols'] = columnWidths;

    XLSX.utils.book_append_sheet(wb, ws, 'Investments');

    // Create summary sheet if totals are provided
    if (currencyTotals && monthlyReturns) {
      const summaryData = [
        { Metric: 'Investment Totals by Currency', Value: '' },
        { Metric: 'MDL', Value: currencyTotals.MDL || 0 },
        { Metric: 'EUR', Value: currencyTotals.EUR || 0 },
        { Metric: 'USD', Value: currencyTotals.USD || 0 },
        { Metric: 'GBP', Value: currencyTotals.GBP || 0 },
        { Metric: '', Value: '' },
        { Metric: 'Monthly Returns by Currency', Value: '' },
        { Metric: 'MDL', Value: monthlyReturns.MDL || 0 },
        { Metric: 'EUR', Value: monthlyReturns.EUR || 0 },
        { Metric: 'USD', Value: monthlyReturns.USD || 0 },
        { Metric: 'GBP', Value: monthlyReturns.GBP || 0 },
        { Metric: '', Value: '' },
        { Metric: 'Total Investments', Value: investments.length },
      ];

      const summaryWs = XLSX.utils.json_to_sheet(summaryData);
      summaryWs['!cols'] = [{ wch: 30 }, { wch: 20 }];
      XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');
    }

    // Generate file
    const timestamp = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `${filename}-${timestamp}.xlsx`);

    return;
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw new Error('Failed to export to Excel. Please try again.');
  }
}

/**
 * Exports investments to PDF format
 */
export function exportToPDF(
  investments: FinancialInstrument[],
  currencyTotals?: CurrencyTotals,
  monthlyReturns?: CurrencyTotals,
  filename: string = 'investments-export'
): void {
  try {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    // Add title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Investment Portfolio Report', 14, 15);

    // Add export date
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Export Date: ${formatDate(new Date())}`, 14, 22);
    doc.text(`Total Investments: ${investments.length}`, 14, 27);

    // Add summary section if data is provided
    let startY = 35;
    if (currencyTotals && monthlyReturns) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Summary', 14, startY);

      const summaryData = [
        ['Currency', 'Total Investment', 'Monthly Return'],
        [
          'MDL',
          (currencyTotals.MDL || 0).toFixed(2),
          (monthlyReturns.MDL || 0).toFixed(2),
        ],
        [
          'EUR',
          (currencyTotals.EUR || 0).toFixed(2),
          (monthlyReturns.EUR || 0).toFixed(2),
        ],
        [
          'USD',
          (currencyTotals.USD || 0).toFixed(2),
          (monthlyReturns.USD || 0).toFixed(2),
        ],
        [
          'GBP',
          (currencyTotals.GBP || 0).toFixed(2),
          (monthlyReturns.GBP || 0).toFixed(2),
        ],
      ];

      autoTable(doc, {
        startY: startY + 5,
        head: [summaryData[0]],
        body: summaryData.slice(1),
        theme: 'grid',
        headStyles: { fillColor: [66, 66, 66], fontSize: 10 },
        styles: { fontSize: 9 },
        margin: { left: 14 },
        tableWidth: 'auto',
      });

      startY = (doc as any).lastAutoTable.finalY + 10;
    }

    // Add investments table
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Investment Details', 14, startY);

    // Prepare table data
    const tableData = investments.map((inv) => {
      const monthlyReturn = calculateMonthlyReturn(
        inv.investmentAmount,
        inv.interestRate,
        inv.incomeTax
      );
      const daysUntilExpiration = calculateDaysUntilExpiration(
        inv.expirationDate
      );

      return [
        inv.organisationName,
        getInvestmentTypeLabel(inv.investmentType),
        inv.currency.toUpperCase(),
        inv.investmentAmount.toFixed(2),
        `${inv.interestRate}%`,
        monthlyReturn.toFixed(2),
        formatDate(inv.expirationDate),
        daysUntilExpiration.toString(),
      ];
    });

    // Create table
    autoTable(doc, {
      startY: startY + 5,
      head: [
        [
          'Organisation',
          'Type',
          'Currency',
          'Amount',
          'Rate',
          'Monthly Return',
          'Maturity Date',
          'Days Left',
        ],
      ],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [66, 66, 66],
        fontSize: 9,
        fontStyle: 'bold',
      },
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 30 },
        2: { cellWidth: 20 },
        3: { cellWidth: 25, halign: 'right' },
        4: { cellWidth: 18, halign: 'center' },
        5: { cellWidth: 28, halign: 'right' },
        6: { cellWidth: 30 },
        7: { cellWidth: 20, halign: 'center' },
      },
      margin: { left: 14, right: 14 },
      didDrawCell: (data) => {
        // Highlight expiring investments
        if (data.section === 'body' && data.column.index === 7) {
          const daysLeft = parseInt(data.cell.text[0]);
          if (daysLeft <= 0) {
            // Expired - red
            doc.setFillColor(255, 200, 200);
          } else if (daysLeft <= 30) {
            // Expiring soon - yellow
            doc.setFillColor(255, 255, 200);
          } else if (daysLeft >= 90 && daysLeft < 120) {
            // Good range - green
            doc.setFillColor(200, 255, 200);
          }
        }
      },
    });

    // Add footer with page numbers
    const pageCount = doc.internal.pages.length - 1;
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }

    // Save the PDF
    const timestamp = new Date().toISOString().split('T')[0];
    doc.save(`${filename}-${timestamp}.pdf`);

    return;
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    throw new Error('Failed to export to PDF. Please try again.');
  }
}
