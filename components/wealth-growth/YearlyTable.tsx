import { Table as TableIcon } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ProjectionPoint } from '@/utils/simulator-calculations';
import {
  convertCurrency,
  formatAmount,
  ExchangeRates,
  SupportedCurrencyCode,
} from '@/utils/currency-formatter';

interface YearlyTableProps {
  data: ProjectionPoint[];
  displayCurrency: SupportedCurrencyCode;
  exchangeRates: ExchangeRates;
}

export function YearlyTable({
  data,
  displayCurrency,
  exchangeRates,
}: YearlyTableProps) {
  const formatValue = (val: number) => {
    const converted = convertCurrency(
      val,
      'MDL',
      displayCurrency,
      exchangeRates
    );
    return formatAmount(converted, displayCurrency);
  };

  return (
    <Card className='w-full'>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TableIcon className="w-5 h-5 text-primary" />
          Detailed Growth Breakdown ({displayCurrency})
        </CardTitle>
        <CardDescription>
          Year-by-year projection of your wealth
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-[100px]'>Year</TableHead>
                <TableHead>Total Contributions</TableHead>
                <TableHead>Total Interest</TableHead>
                <TableHead>Ending Balance</TableHead>
                <TableHead className='text-right'>Passive Income / Mo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((point) => (
                <TableRow key={point.year}>
                  <TableCell className='font-medium'>
                    {point.year === 0 ? 'Start' : `Year ${point.year}`}
                  </TableCell>
                  <TableCell>{formatValue(point.totalContributions)}</TableCell>
                  <TableCell>{formatValue(point.totalInterest)}</TableCell>
                  <TableCell className='font-semibold'>
                    {formatValue(point.nominalTotal)}
                  </TableCell>
                  <TableCell className='text-right text-green-600 font-medium'>
                    {formatValue(point.passiveIncome)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
