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
  Timer,
  CalendarDays,
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
  expiredInvestments: Investment[];
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
  expiredInvestments,
}: SectionCardsProps) {
  const cardClassName =
    'relative overflow-hidden hover:shadow-lg transition-shadow duration-300';
  const hoverEffect =
    'absolute inset-0 bg-gradient-to-r from-blue-100 to-blue-200 dark:from-purple-600 dark:to-indigo-600 opacity-0 hover:opacity-10 transition-opacity duration-300';

  return (
    <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-4'>
      {/* Card 1 - Monthly Revenue */}
      <Card
        className={`${cardClassName} sm:col-span-2 lg:col-span-2 xl:col-span-1 2xl:col-span-1`}
      >
        <div className={hoverEffect} />
        <CardHeader>
          <CardTitle className='flex items-center justify-between text-xl lg:text-2xl'>
            <span>Monthly Revenue</span>
            <TrendingUp className='h-6 w-6 text-green-500' />
          </CardTitle>
          <CardDescription className='lg:text-base'>
            Total earnings this month
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div>
            <p className='text-xs lg:text-sm text-gray-500 uppercase mb-1 lg:mb-3'>
              Total (MDL Equivalent)
            </p>
            <p className='text-2xl lg:text-3xl font-bold'>
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
                  <span className='text-sm lg:text-base text-gray-400'>{`Returns in ${currency}`}</span>
                  <span className='text-sm lg:text-base font-medium text-green-400'>
                    + {formatAmount(amount, currency)}
                  </span>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Card 2 - Upcoming Maturities */}
      <Card
        className={`${cardClassName} sm:col-span-2 lg:col-span-2 xl:col-span-2 2xl:col-span-1`}
      >
        <div className={hoverEffect} />
        <CardHeader>
          <CardTitle className='flex items-center justify-between text-xl lg:text-2xl'>
            <span>Upcoming Maturities</span>
            <Briefcase className='h-6 w-6 text-blue-500' />
          </CardTitle>
          <CardDescription className='lg:text-base'>
            Current portfolio status
          </CardDescription>
        </CardHeader>

        <CardContent className='space-y-4'>
          <div>
            <p className='text-xs lg:text-sm text-gray-500 uppercase mb-1 lg:mb-3'>
              Total Investments
            </p>
            <p className='text-2xl lg:text-3xl font-bold'>{totalInvestments}</p>
          </div>
          <div className='space-y-4'>
            {/* Investments that have already expired */}
            {expiredInvestments.length > 0 && (
              <div>
                <h3 className='text-sm lg:text-base font-semibold text-red-500 mb-2 flex justify-between items-center'>
                  <span className='flex items-center'>
                    <AlertTriangle className='h-4 w-4 mr-2' />
                    <span>Expired Investments</span>
                  </span>
                  <span className='text-sm lg:text-base font-semibold'>
                    {expiredInvestments.length}
                  </span>
                </h3>
                <Table>
                  <TableHeader>
                    <TableRow className='border-b border-gray-800'>
                      <TableHead className='text-xs lg:text-sm h-8 py-2'>
                        Organization
                      </TableHead>
                      <TableHead className='text-xs lg:text-sm h-8 py-2'>
                        Amount
                      </TableHead>
                      <TableHead className='text-xs lg:text-sm h-8 py-2'>
                        Date
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expiredInvestments.map((investment) => (
                      <TableRow
                        key={investment.id}
                        className='border-b border-gray-800/50'
                      >
                        <TableCell className='text-xs lg:text-sm font-medium py-2'>
                          {investment.organisationName}
                        </TableCell>
                        <TableCell className='text-xs lg:text-sm py-2'>
                          {formatAmount(
                            investment.investmentAmount,
                            investment.currency
                          )}
                        </TableCell>
                        <TableCell className='text-xs lg:text-sm text-muted-foreground py-2'>
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
            {/* Investments expiring in 7 days */}
            {expiringIn7Days.length > 0 && (
              <div>
                <h3 className='text-sm lg:text-base font-semibold text-yellow-500 dark:text-yellow-400 mb-2 flex justify-between items-center'>
                  <span className='flex items-center'>
                    <Timer className='h-4 w-4 mr-2' />
                    <span>Investments Expiring in 7 Days</span>
                  </span>
                  <span className='text-sm lg:text-base font-semibold'>
                    {expiringIn7Days.length}
                  </span>
                </h3>
                <Table>
                  <TableHeader>
                    <TableRow className='border-b border-gray-800'>
                      <TableHead className='text-xs lg:text-sm h-8 py-2'>
                        Organization
                      </TableHead>
                      <TableHead className='text-xs lg:text-sm h-8 py-2'>
                        Amount
                      </TableHead>
                      <TableHead className='text-xs lg:text-sm h-8 py-2'>
                        Date
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expiringIn7Days.map((investment) => (
                      <TableRow
                        key={investment.id}
                        className='border-b border-gray-800/50'
                      >
                        <TableCell className='text-xs lg:text-sm font-medium py-2'>
                          {investment.organisationName}
                        </TableCell>
                        <TableCell className='text-xs lg:text-sm py-2'>
                          {formatAmount(
                            investment.investmentAmount,
                            investment.currency
                          )}
                        </TableCell>
                        <TableCell className='text-xs lg:text-sm text-muted-foreground py-2'>
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
            {/* Investments expiring in 30 days */}
            {expiringIn30Days.length > 0 && (
              <div>
                <h3 className='text-sm lg:text-base font-semibold text-green-600 dark:text-green-400 mb-2 flex justify-between items-center'>
                  <span className='flex items-center'>
                    <CalendarDays className='h-4 w-4 mr-2' />
                    <span>Investments Expiring in 30 Days</span>
                  </span>{' '}
                  <span className='text-sm lg:text-base font-semibold'>
                    {expiringIn30Days.length}
                  </span>
                </h3>
                <Table>
                  <TableHeader>
                    <TableRow className='border-b border-gray-800'>
                      <TableHead className='text-xs lg:text-sm h-8 py-2'>
                        Organization
                      </TableHead>
                      <TableHead className='text-xs lg:text-sm h-8 py-2'>
                        Amount
                      </TableHead>
                      <TableHead className='text-xs lg:text-sm h-8 py-2'>
                        Date
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expiringIn30Days.map((investment) => (
                      <TableRow
                        key={investment.id}
                        className='border-b border-gray-800/50'
                      >
                        <TableCell className='text-xs lg:text-sm font-medium py-2'>
                          {investment.organisationName}
                        </TableCell>
                        <TableCell className='text-xs lg:text-sm py-2'>
                          {formatAmount(
                            investment.investmentAmount,
                            investment.currency
                          )}
                        </TableCell>
                        <TableCell className='text-xs lg:text-sm text-muted-foreground py-2'>
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
          <CardTitle className='flex items-center justify-between text-xl lg:text-2xl'>
            <span>Revenue by Type</span>
            <PieChart className='h-6 w-6 text-yellow-500' />
          </CardTitle>
          <CardDescription className='lg:text-base'>
            Monthly income from different investment types
          </CardDescription>
        </CardHeader>
        <CardContent>
          {Object.keys(monthlyReturnsByType).length > 0 ? (
            <div className='flex flex-col divide-y divide-gray-200 dark:divide-gray-800'>
              {Object.entries(monthlyReturnsByType).map(([type, returns]) => (
                <div key={type} className='py-3 first:pt-0 last:pb-0'>
                  <h3 className='text-sm lg:text-base font-semibold text-gray-400 mb-2'>
                    {getInvestmentTypeLabel(type)}
                  </h3>
                  <Table>
                    <TableBody>
                      {Object.entries(returns)
                        .filter(([, amount]) => amount > 0)
                        .map(([currency, amount]) => (
                          <TableRow key={currency} className='border-b-0'>
                            <TableCell className='text-xs lg:text-sm text-gray-500 py-1 px-0'>
                              {`Returns in ${currency}`}
                            </TableCell>
                            <TableCell className='text-xs lg:text-sm font-medium text-green-400 py-1 px-0 text-right'>
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
            <p className='text-center text-gray-500 lg:text-base'>
              No revenue data by type
            </p>
          )}
        </CardContent>
      </Card>
      {/* Card 4 */}
      <Card
        className={`${cardClassName} sm:col-span-1 lg:col-span-2 xl:col-span-4 2xl:col-span-1`}
      >
        <div className={hoverEffect} />
        <CardHeader>
          <CardTitle className='flex items-center justify-between text-xl lg:text-2xl'>
            <span>Quick Actions</span>
            <Zap className='h-6 w-6 text-purple-500' />
          </CardTitle>
          <CardDescription className='lg:text-base'>Shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <p className='text-center text-gray-500 lg:text-base'>
            No actions available
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
