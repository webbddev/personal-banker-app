import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  TrendingUp,
  Briefcase,
  AlertTriangle,
  Zap,
  PieChart,
} from 'lucide-react';
import {
  CurrencyTotals,
  MonthlyReturnsByInvestmentType,
} from '@/utils/investment-calculations';
import { formatAmount } from '@/utils/currency-formatter';
import { Investment } from '@prisma/client';
import { investmentTypeOptions } from '@/utils/investment-constants';

interface SectionCardsProps {
  monthlyReturns: CurrencyTotals;
  totalMonthlyRevenue: number;
  totalInvestments: number;
  expiringIn7Days: Investment[];
  expiringIn30Days: Investment[];
  monthlyReturnsByType: MonthlyReturnsByInvestmentType;
}

const getInvestmentTypeLabel = (typeValue: string) => {
  const option = investmentTypeOptions.find((opt) => opt.value === typeValue);
  return option ? option.label : typeValue;
};

export function SectionCards({
  monthlyReturns,
  totalMonthlyRevenue,
  totalInvestments,
  expiringIn7Days,
  expiringIn30Days,
  monthlyReturnsByType,
}: SectionCardsProps) {
  const cardClassName =
    'relative overflow-hidden hover:shadow-lg transition-shadow duration-300';
  const hoverEffect =
    'absolute inset-0 bg-gradient-to-r from-blue-100 to-blue-200 dark:from-purple-600 dark:to-indigo-600 opacity-0 hover:opacity-10 transition-opacity duration-300';

  const sortedMonthlyReturnsByType = Object.entries(monthlyReturnsByType).sort(
    ([typeA], [typeB]) => {
      if (typeA === 'bankDeposit') return -1;
      if (typeB === 'bankDeposit') return 1;
      return typeA.localeCompare(typeB);
    }
  );
  return (
    <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-4'>
      {/* Card 1 - Monthly Revenue */}
      <Card
        className={`${cardClassName} sm:col-span-2 lg:col-span-2 xl:col-span-1 2xl:col-span-1`}
      >
        <div className={hoverEffect} />
        <CardHeader>
          <CardTitle className='flex items-center justify-between'>
            <span>Monthly Revenue</span>
            <TrendingUp className='h-6 w-6 text-green-500' />
          </CardTitle>
          <CardDescription>Total earnings this month</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div>
            <p className='text-xs text-gray-500 uppercase mb-1 lg:mb-3'>
              Total (MDL Equivalent)
            </p>
            <p className='text-2xl font-bold'>
              {formatAmount(totalMonthlyRevenue, 'MDL')}
            </p>
          </div>
          <div className='space-y-2'>
            {Object.entries(monthlyReturns)
              .filter(([, amount]) => amount > 0)
              .map(([currency, amount]) => (
                <div
                  key={currency}
                  className='flex justify-between items-center'
                >
                  <span className='text-sm text-gray-400'>{`Returns in ${currency}`}</span>
                  <span className='text-sm font-medium text-green-400'>
                    + {formatAmount(amount, currency)}
                  </span>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Card 2 - Investment Overview */}
      <Card
        className={`${cardClassName} sm:col-span-2 lg:col-span-2 xl:col-span-2 2xl:col-span-1`}
      >
        <div className={hoverEffect} />
        <CardHeader>
          <CardTitle className='flex items-center justify-between'>
            <span>Investment Overview</span>
            <Briefcase className='h-6 w-6 text-blue-500' />
          </CardTitle>
          <CardDescription>Current portfolio status</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div>
            <p className='text-xs text-gray-500 uppercase mb-1 lg:mb-3'>
              Total Investments
            </p>
            <p className='text-2xl font-bold'>{totalInvestments}</p>
          </div>
          <div className='space-y-4'>
            {expiringIn7Days.length > 0 && (
              <div>
                <h3 className='text-sm font-semibold text-yellow-400 mb-2 flex justify-between items-center'>
                  <span>Investments Expiring in 7 Days</span>
                  <span className='text-sm font-medium'>
                    {expiringIn7Days.length}
                  </span>
                </h3>
                <Table>
                  <TableHeader>
                    <TableRow className='border-b border-gray-800'>
                      <TableHead className='text-xs h-8 py-2'>
                        Organization
                      </TableHead>
                      <TableHead className='text-xs h-8 py-2'>Amount</TableHead>
                      <TableHead className='text-xs h-8 py-2'>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expiringIn7Days.map((investment) => (
                      <TableRow
                        key={investment.id}
                        className='border-b border-gray-800/50'
                      >
                        <TableCell className='text-xs font-medium py-2'>
                          {investment.organisationName}
                        </TableCell>
                        <TableCell className='text-xs py-2'>
                          {formatAmount(
                            investment.investmentAmount,
                            investment.currency
                          )}
                        </TableCell>
                        <TableCell className='text-xs text-muted-foreground py-2'>
                          {new Date(
                            investment.expirationDate
                          ).toLocaleDateString('en-GB')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            {expiringIn30Days.length > 0 && (
              <div>
                <h3 className='text-sm font-semibold text-red-400 mb-2 flex justify-between items-center'>
                  <span>Investments Expiring in 30 Days</span>
                  <span className='text-sm font-medium'>
                    {expiringIn30Days.length}
                  </span>
                </h3>
                <Table>
                  <TableHeader>
                    <TableRow className='border-b border-gray-800'>
                      <TableHead className='text-xs h-8 py-2'>
                        Organization
                      </TableHead>
                      <TableHead className='text-xs h-8 py-2'>Amount</TableHead>
                      <TableHead className='text-xs h-8 py-2'>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expiringIn30Days.map((investment) => (
                      <TableRow
                        key={investment.id}
                        className='border-b border-gray-800/50'
                      >
                        <TableCell className='text-xs font-medium py-2'>
                          {investment.organisationName}
                        </TableCell>
                        <TableCell className='text-xs py-2'>
                          {formatAmount(
                            investment.investmentAmount,
                            investment.currency
                          )}
                        </TableCell>
                        <TableCell className='text-xs text-muted-foreground py-2'>
                          {new Date(
                            investment.expirationDate
                          ).toLocaleDateString('en-GB')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      {/* Card 3 - Revenue by Type */}
      <Card
        className={`${cardClassName} sm:col-span-1 lg:col-span-2 xl:col-span-1 2xl:col-span-1`}
      >
        <div className={hoverEffect} />
        <CardHeader>
          <CardTitle className='flex items-center justify-between'>
            <span>Revenue by Type</span>
            <PieChart className='h-6 w-6 text-yellow-500' />
          </CardTitle>
          <CardDescription>
            Monthly income from different investment types
          </CardDescription>
        </CardHeader>
        <CardContent>
          {Object.keys(monthlyReturnsByType).length > 0 ? (
            <div className='flex flex-col divide-y divide-gray-200 dark:divide-gray-800'>
              {Object.entries(monthlyReturnsByType).map(([type, returns]) => (
                <div key={type} className='py-3 first:pt-0 last:pb-0'>
                  <h3 className='text-sm font-semibold text-gray-400 mb-2'>
                    {getInvestmentTypeLabel(type)}
                  </h3>
                  <Table>
                    <TableBody>
                      {Object.entries(returns)
                        .filter(([, amount]) => amount > 0)
                        .map(([currency, amount]) => (
                          <TableRow key={currency} className='border-b-0'>
                            <TableCell className='text-xs text-gray-500 py-1 px-0'>
                              {`Returns in ${currency}`}
                            </TableCell>
                            <TableCell className='text-xs font-medium text-green-400 py-1 px-0 text-right'>
                              + {formatAmount(amount, currency)}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              ))}
            </div>
          ) : (
            <p className='text-center text-gray-500'>No revenue data by type</p>
          )}
        </CardContent>
      </Card>
      {/* Card 4 */}
      <Card
        className={`${cardClassName} sm:col-span-1 lg:col-span-2 xl:col-span-4 2xl:col-span-1`}
      >
        <div className={hoverEffect} />
        <CardHeader>
          <CardTitle className='flex items-center justify-between'>
            <span>Quick Actions</span>
            <Zap className='h-6 w-6 text-purple-500' />
          </CardTitle>
          <CardDescription>Shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <p className='text-center text-gray-500'>No actions available</p>
        </CardContent>
      </Card>
    </div>
  );
}
