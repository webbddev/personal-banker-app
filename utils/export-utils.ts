import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FinancialInstrument } from '@/types/investment-schema';
import { CurrencyTotals } from '@/utils/investment-calculations';
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
    month: 'long',
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
    'Monthly Return': monthlyReturn.toFixed(2),
    'Maturity Date': formatDate(investment.expirationDate),
    'Days Until Maturity': daysUntilExpiration,
    Status:
      daysUntilExpiration <= 0
        ? 'EXPIRED'
        : daysUntilExpiration <= 30
          ? 'EXPIRING SOON'
          : 'ACTIVE',
    'Created Date': formatDate(investment.createdAt),
  };
}

/**
 * Exports investments to Excel format with improved professional layout
 */
export function exportToExcel(
  investments: FinancialInstrument[],
  currencyTotals?: CurrencyTotals,
  monthlyReturns?: CurrencyTotals,
  investorName?: string,
  filename: string = 'investments-export'
): void {
  try {
    const wb = XLSX.utils.book_new();
    const timestamp = formatDate(new Date());

    // Create cover sheet
    const coverData = [
      ['INVESTMENT PORTFOLIO REPORT'],
      [''],
      ['Investor Name:', investorName || 'N/A'],
      ['Report Generated:', timestamp],
      ['Total Investments:', investments.length],
      [''],
      [
        'This report contains a comprehensive overview of your investment portfolio,',
      ],
      [
        'including detailed information about each investment, performance metrics,',
      ],
      ['and currency distribution.'],
    ];

    const coverWs = XLSX.utils.aoa_to_sheet(coverData);
    coverWs['!cols'] = [{ wch: 30 }, { wch: 30 }];

    // Style the cover sheet title
    if (coverWs['A1']) {
      coverWs['A1'].s = {
        font: { bold: true, sz: 18 },
        alignment: { horizontal: 'center' },
      };
    }

    XLSX.utils.book_append_sheet(wb, coverWs, 'Cover');

    // Create summary sheet if totals are provided
    if (currencyTotals && monthlyReturns) {
      const summaryData = [
        ['PORTFOLIO SUMMARY'],
        [''],
        ['Investor:', investorName || 'N/A'],
        ['Report Date:', timestamp],
        [''],
        ['INVESTMENT TOTALS BY CURRENCY'],
        ['Currency', 'Total Investment', 'Monthly Return', 'Annual Return'],
      ];

      // Add currency rows
      const currencies = ['MDL', 'EUR', 'USD', 'GBP'] as const;
      currencies.forEach((currency) => {
        const total = currencyTotals[currency] || 0;
        const monthly = monthlyReturns[currency] || 0;
        const annual = monthly * 12;
        summaryData.push([
          currency,
          total.toFixed(2),
          monthly.toFixed(2),
          annual.toFixed(2),
        ]);
      });

      // Calculate investment type totals
      const typeBreakdown = investments.reduce(
        (acc, inv) => {
          const type = getInvestmentTypeLabel(inv.investmentType);
          if (!acc[type]) {
            acc[type] = { total: 0, count: 0 };
          }
          acc[type].total += inv.investmentAmount;
          acc[type].count++;
          return acc;
        },
        {} as Record<string, { total: number; count: number }>
      );

      summaryData.push(
        [''],
        ['INVESTMENT TOTALS BY TYPE'],
        ['Investment Type', 'Total Amount (MDL)', 'Count', 'Avg Amount']
      );

      Object.entries(typeBreakdown)
        .sort(([, a], [, b]) => b.total - a.total)
        .forEach(([type, data]) => {
          summaryData.push([
            type,
            data.total.toFixed(2),
            data.count.toString(),
            (data.total / data.count).toFixed(2),
          ]);
        });

      summaryData.push(
        [''],
        ['PORTFOLIO METRICS'],
        ['Total Investments:', investments.length.toString()],
        [
          'Active Investments:',
          investments
            .filter((i) => calculateDaysUntilExpiration(i.expirationDate) > 0)
            .length.toString(),
        ],
        [
          'Expiring Soon (30 days):',
          investments
            .filter((i) => {
              const days = calculateDaysUntilExpiration(i.expirationDate);
              return days > 0 && days <= 30;
            })
            .length.toString(),
        ],
        [
          'Expired:',
          investments
            .filter((i) => calculateDaysUntilExpiration(i.expirationDate) <= 0)
            .length.toString(),
        ]
      );

      const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
      summaryWs['!cols'] = [{ wch: 25 }, { wch: 20 }, { wch: 20 }, { wch: 20 }];
      XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');
    }

    // Create main investments sheet with formatted data
    const formattedData = investments.map(formatInvestmentForExport);
    const ws = XLSX.utils.json_to_sheet(formattedData);

    // Set column widths for better readability
    const columnWidths = [
      { wch: 28 }, // Organisation Name
      { wch: 22 }, // Investment Type
      { wch: 20 }, // Related Data
      { wch: 10 }, // Currency
      { wch: 18 }, // Investment Amount
      { wch: 16 }, // Rate of Return
      { wch: 14 }, // Income Tax
      { wch: 18 }, // Monthly Return
      { wch: 20 }, // Maturity Date
      { wch: 18 }, // Days Until Maturity
      { wch: 16 }, // Status
      { wch: 20 }, // Created Date
    ];
    ws['!cols'] = columnWidths;

    XLSX.utils.book_append_sheet(wb, ws, 'Investment Details');

    // Create analysis sheet
    const typeBreakdown = investments.reduce(
      (acc, inv) => {
        const type = getInvestmentTypeLabel(inv.investmentType);
        if (!acc[type]) {
          acc[type] = { count: 0, total: 0 };
        }
        acc[type].count++;
        acc[type].total += inv.investmentAmount;
        return acc;
      },
      {} as Record<string, { count: number; total: number }>
    );

    const analysisData = [
      ['INVESTMENT ANALYSIS'],
      [''],
      ['Investment Type Breakdown'],
      ['Type', 'Count', 'Total Amount', 'Average Amount'],
    ];

    Object.entries(typeBreakdown).forEach(([type, data]) => {
      analysisData.push([
        type,
        data.count.toString(),
        data.total.toFixed(2),
        (data.total / data.count).toFixed(2),
      ]);
    });

    const analysisWs = XLSX.utils.aoa_to_sheet(analysisData);
    analysisWs['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 20 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, analysisWs, 'Analysis');

    // Generate file with timestamp
    const fileTimestamp = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `${filename}-${fileTimestamp}.xlsx`);

    return;
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw new Error('Failed to export to Excel. Please try again.');
  }
}

/**
 * Exports investments to PDF format with improved professional layout
 */
export function exportToPDF(
  investments: FinancialInstrument[],
  currencyTotals?: CurrencyTotals,
  monthlyReturns?: CurrencyTotals,
  investorName?: string,
  filename: string = 'investments-export'
): void {
  try {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Add professional header with border
    doc.setFillColor(41, 98, 255); // Professional blue
    doc.rect(0, 0, pageWidth, 35, 'F');

    // Add white text for header
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('INVESTMENT PORTFOLIO REPORT', pageWidth / 2, 15, {
      align: 'center',
    });

    // Add investor name and date
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Investor: ${investorName || 'N/A'}`, 14, 24);
    doc.text(`Report Date: ${formatDate(new Date())}`, pageWidth - 14, 24, {
      align: 'right',
    });
    doc.text(`Total Investments: ${investments.length}`, 14, 30);

    // Reset text color
    doc.setTextColor(0, 0, 0);

    // Add summary section if data is provided
    let startY = 45;
    if (currencyTotals && monthlyReturns) {
      // Currency Summary
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setFillColor(240, 240, 240);
      doc.rect(14, startY - 5, pageWidth - 28, 8, 'F');
      doc.text('Portfolio Summary - By Currency', 18, startY);

      const summaryData = [
        [
          'Currency',
          'Total Investment',
          'Monthly Return',
          'Annual Return',
          'Count',
        ],
      ];

      const currencies = ['MDL', 'EUR', 'USD', 'GBP'] as const;
      currencies.forEach((currency) => {
        const total = currencyTotals[currency] || 0;
        const monthly = monthlyReturns[currency] || 0;
        const count = investments.filter((i) => i.currency === currency).length;
        summaryData.push([
          currency,
          total.toFixed(2),
          monthly.toFixed(2),
          (monthly * 12).toFixed(2),
          count.toString(),
        ]);
      });

      autoTable(doc, {
        startY: startY + 5,
        head: [summaryData[0]],
        body: summaryData.slice(1),
        theme: 'grid',
        headStyles: {
          fillColor: [41, 98, 255],
          fontSize: 10,
          fontStyle: 'bold',
          textColor: 255,
        },
        styles: {
          fontSize: 9,
          cellPadding: 3,
        },
        margin: { left: 14, right: 14 },
        columnStyles: {
          1: { halign: 'right' },
          2: { halign: 'right' },
          3: { halign: 'right' },
          4: { halign: 'center' },
        },
      });

      startY = (doc as any).lastAutoTable.finalY + 10;

      // Investment Type Summary
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setFillColor(240, 240, 240);
      doc.rect(14, startY - 5, pageWidth - 28, 8, 'F');
      doc.text('Portfolio Summary - By Investment Type', 18, startY);

      // Calculate investment type totals
      const typeBreakdown = investments.reduce(
        (acc, inv) => {
          const type = getInvestmentTypeLabel(inv.investmentType);
          if (!acc[type]) {
            acc[type] = { total: 0, count: 0, monthlyReturn: 0 };
          }
          acc[type].total += inv.investmentAmount;
          acc[type].count++;
          acc[type].monthlyReturn += calculateMonthlyReturn(
            inv.investmentAmount,
            inv.interestRate,
            inv.incomeTax
          );
          return acc;
        },
        {} as Record<
          string,
          { total: number; count: number; monthlyReturn: number }
        >
      );

      const typeData = [
        [
          'Investment Type',
          'Total Amount (MDL)',
          'Count',
          'Avg Amount',
          'Monthly Return',
        ],
      ];

      Object.entries(typeBreakdown)
        .sort(([, a], [, b]) => b.total - a.total)
        .forEach(([type, data]) => {
          typeData.push([
            type,
            data.total.toFixed(2),
            data.count.toString(),
            (data.total / data.count).toFixed(2),
            data.monthlyReturn.toFixed(2),
          ]);
        });

      autoTable(doc, {
        startY: startY + 5,
        head: [typeData[0]],
        body: typeData.slice(1),
        theme: 'grid',
        headStyles: {
          fillColor: [41, 98, 255],
          fontSize: 10,
          fontStyle: 'bold',
          textColor: 255,
        },
        styles: {
          fontSize: 9,
          cellPadding: 3,
        },
        margin: { left: 14, right: 14 },
        columnStyles: {
          1: { halign: 'right' },
          2: { halign: 'center' },
          3: { halign: 'right' },
          4: { halign: 'right' },
        },
      });

      startY = (doc as any).lastAutoTable.finalY + 12;
    }

    // Add investments table
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setFillColor(240, 240, 240);
    doc.rect(14, startY - 5, pageWidth - 28, 8, 'F');
    doc.text('Investment Details', 18, startY);

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

    // Create table with improved styling
    autoTable(doc, {
      startY: startY + 5,
      head: [
        [
          'Organisation',
          'Type',
          'Curr.',
          'Amount',
          'Rate',
          'Monthly',
          'Maturity',
          'Days',
        ],
      ],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [41, 98, 255],
        fontSize: 9,
        fontStyle: 'bold',
        textColor: 255,
      },
      styles: {
        fontSize: 8,
        cellPadding: 2.5,
      },
      alternateRowStyles: {
        fillColor: [248, 249, 250],
      },
      columnStyles: {
        0: { cellWidth: 45 },
        1: { cellWidth: 32 },
        2: { cellWidth: 15, halign: 'center' },
        3: { cellWidth: 25, halign: 'right' },
        4: { cellWidth: 18, halign: 'center' },
        5: { cellWidth: 25, halign: 'right' },
        6: { cellWidth: 32 },
        7: { cellWidth: 18, halign: 'center' },
      },
      margin: { left: 14, right: 14 },
      didDrawCell: (data) => {
        // Highlight expiring investments with color coding
        if (data.section === 'body' && data.column.index === 7) {
          const daysLeft = parseInt(data.cell.text[0]);
          if (daysLeft <= 0) {
            doc.setFillColor(220, 53, 69); // Red for expired
            doc.setTextColor(255, 255, 255);
          } else if (daysLeft <= 30) {
            doc.setFillColor(255, 193, 7); // Yellow for expiring soon
            doc.setTextColor(0, 0, 0);
          }
        }
      },
    });

    // Add footer with page numbers and branding
    const pageCount = doc.internal.pages.length - 1;
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);

      // Footer line
      doc.setDrawColor(200, 200, 200);
      doc.line(14, pageHeight - 15, pageWidth - 14, pageHeight - 15);

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);

      // Page number
      doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, {
        align: 'center',
      });

      // Confidential notice
      doc.text('CONFIDENTIAL - For Authorized Use Only', 14, pageHeight - 10);

      // Generated by
      doc.text(
        `Generated: ${formatDate(new Date())}`,
        pageWidth - 14,
        pageHeight - 10,
        { align: 'right' }
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
